import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { WebsiteAnalysis, WebsiteIssue } from '@/types'

async function checkPageSpeed(url: string): Promise<{ performance: number; seo: number } | null> {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY || ''
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${apiKey ? `&key=${apiKey}` : ''}`

    const response = await axios.get(apiUrl, { timeout: 30000 })
    const data = response.data

    const performance = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100)
    const seo = Math.round((data.lighthouseResult?.categories?.seo?.score || 0) * 100)

    return { performance, seo }
  } catch {
    return null
  }
}

async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  const issues: WebsiteIssue[] = []

  const hasSSL = url.startsWith('https://')
  let isMobileFriendly: boolean | null = null
  let loadTime: number | null = null
  let htmlContent = ''
  let fetchSuccess = false

  // Fetch the website
  try {
    const start = Date.now()
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      },
      maxRedirects: 5,
    })
    loadTime = Date.now() - start
    htmlContent = response.data
    fetchSuccess = true
  } catch {
    fetchSuccess = false
  }

  // SSL check
  if (!hasSSL) {
    issues.push({
      type: 'no_ssl',
      severity: 'critical',
      description: 'Geen HTTPS / SSL beveiligingscertificaat',
      revenue_impact: 'Bezoekers zien een "Niet Beveiligd" waarschuwing → verlaten de site',
    })
  }

  if (!fetchSuccess) {
    issues.push({
      type: 'outdated',
      severity: 'critical',
      description: 'Website is niet bereikbaar of crasht',
      revenue_impact: '100% van bezoekers verlaat de site onmiddellijk',
    })
    return {
      url,
      score: 5,
      issues,
      performance_score: 0,
      seo_score: 0,
      has_ssl: hasSSL,
      is_mobile_friendly: false,
      load_time: null,
    }
  }

  const $ = cheerio.load(htmlContent)

  // Mobile-friendly check
  const viewport = $('meta[name="viewport"]').attr('content')
  isMobileFriendly = !!viewport && viewport.includes('width=device-width')

  if (!isMobileFriendly) {
    issues.push({
      type: 'not_mobile',
      severity: 'critical',
      description: 'Website is niet mobielvriendelijk (geen responsive design)',
      revenue_impact: '60% van bezoekers gebruikt mobiel → verliest meer dan de helft van potentiële klanten',
    })
  }

  // Load time check
  if (loadTime && loadTime > 4000) {
    issues.push({
      type: 'slow_speed',
      severity: 'high',
      description: `Website laadt te traag (${(loadTime / 1000).toFixed(1)} seconden)`,
      revenue_impact: 'Elke extra seconde laadtijd kost 7% conversies → klanten haken af',
    })
  }

  // SEO checks
  const title = $('title').text().trim()
  const metaDesc = $('meta[name="description"]').attr('content')
  const h1Count = $('h1').length

  if (!title || title.length < 10) {
    issues.push({
      type: 'bad_seo',
      severity: 'high',
      description: 'Geen of slechte paginatitel (SEO)',
      revenue_impact: 'Bedrijf verschijnt niet in Google zoekresultaten → klanten vinden hen niet',
    })
  }

  if (!metaDesc) {
    issues.push({
      type: 'bad_seo',
      severity: 'medium',
      description: 'Geen meta beschrijving voor zoekmachines',
      revenue_impact: 'Lagere click-through rate in Google → minder bezoekers',
    })
  }

  if (h1Count === 0) {
    issues.push({
      type: 'bad_seo',
      severity: 'medium',
      description: 'Geen H1 kopstitel op de pagina (SEO structuur ontbreekt)',
      revenue_impact: 'Google begrijpt de pagina niet → slechte ranking',
    })
  }

  // Contact form check
  const hasContactForm = $('form').length > 0 || $('[href*="tel:"]').length > 0 || $('[href*="mailto:"]').length > 0
  if (!hasContactForm) {
    issues.push({
      type: 'no_contact',
      severity: 'high',
      description: 'Geen duidelijk contactformulier of klikbare telefoon',
      revenue_impact: 'Geïnteresseerde klanten weten niet hoe contact op te nemen → omzet verlies',
    })
  }

  // Image optimization check
  const images = $('img')
  let unoptimizedImages = 0
  images.each((_, el) => {
    const src = $(el).attr('src') || ''
    const alt = $(el).attr('alt')
    if (!alt) unoptimizedImages++
    if (src.includes('.bmp') || src.includes('.tiff')) unoptimizedImages++
  })

  if (unoptimizedImages > 3) {
    issues.push({
      type: 'slow_speed',
      severity: 'medium',
      description: `${unoptimizedImages} afbeeldingen niet geoptimaliseerd (geen alt-tekst, verkeerd formaat)`,
      revenue_impact: 'Trage laadtijd door grote afbeeldingen → hogere bounce rate',
    })
  }

  // Check PageSpeed API (free tier, may be rate limited)
  const pageSpeedResult = await checkPageSpeed(url)
  let performanceScore = pageSpeedResult?.performance || null
  const seoScore = pageSpeedResult?.seo || null

  // Estimate performance if API not available
  if (!performanceScore) {
    performanceScore = 100
    if (loadTime && loadTime > 4000) performanceScore -= 40
    else if (loadTime && loadTime > 2000) performanceScore -= 20
    if (!isMobileFriendly) performanceScore -= 20
    if (!hasSSL) performanceScore -= 15
    performanceScore = Math.max(10, performanceScore)
  }

  // Add PageSpeed issue if score is low
  if (performanceScore !== null && performanceScore < 50) {
    const existing = issues.find(i => i.type === 'slow_speed')
    if (!existing) {
      issues.push({
        type: 'slow_speed',
        severity: 'high',
        description: `Slechte website snelheid (Google PageSpeed score: ${performanceScore}/100)`,
        revenue_impact: 'Google geeft voorkeur aan snelle websites → lagere ranking en minder klanten',
      })
    }
  }

  // Calculate overall score
  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const highCount = issues.filter(i => i.severity === 'high').length
  const mediumCount = issues.filter(i => i.severity === 'medium').length

  let score = 100
  score -= criticalCount * 25
  score -= highCount * 15
  score -= mediumCount * 7
  score = Math.max(5, Math.min(100, score))

  return {
    url,
    score,
    issues,
    performance_score: performanceScore,
    seo_score: seoScore,
    has_ssl: hasSSL,
    is_mobile_friendly: isMobileFriendly,
    load_time: loadTime,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, business_name } = await request.json()

    if (!url) {
      // No website = worst score
      const issues: WebsiteIssue[] = [
        {
          type: 'no_website',
          severity: 'critical',
          description: 'Geen website gevonden',
          revenue_impact: 'Onzichtbaar op Google → verliest 90% van online klanten aan concurrenten',
        },
        {
          type: 'no_google_business',
          severity: 'high',
          description: 'Geen professionele online aanwezigheid',
          revenue_impact: 'Klanten kunnen het bedrijf niet vinden of beoordelen online',
        },
      ]
      return NextResponse.json({
        url: null,
        score: 5,
        issues,
        performance_score: 0,
        seo_score: 0,
        has_ssl: false,
        is_mobile_friendly: false,
        load_time: null,
        business_name,
      })
    }

    // Normalize URL
    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    const analysis = await analyzeWebsite(normalizedUrl)

    return NextResponse.json({ ...analysis, business_name })
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Analyse mislukt' }, { status: 500 })
  }
}
