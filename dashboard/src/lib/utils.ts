import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { WebsiteIssue } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('nl-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getScoreColor(score: number) {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-600'
}

export function getScoreBg(score: number) {
  if (score >= 70) return 'bg-green-100 text-green-800'
  if (score >= 40) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

export function getStatusBg(status: string) {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800'
    case 'contacted': return 'bg-yellow-100 text-yellow-800'
    case 'responded': return 'bg-green-100 text-green-800'
    case 'closed': return 'bg-purple-100 text-purple-800'
    case 'not_interested': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'new': return 'Nieuw'
    case 'contacted': return 'Gecontacteerd'
    case 'responded': return 'Gereageerd'
    case 'closed': return 'Gesloten'
    case 'not_interested': return 'Niet geïnteresseerd'
    default: return status
  }
}

export function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical': return '🔴'
    case 'high': return '🟠'
    case 'medium': return '🟡'
    default: return '⚪'
  }
}

export function buildWhatsAppMessage(
  template: string,
  lead: { business_name: string; website: string | null; issues: WebsiteIssue[] },
  signature: string
): string {
  const topIssues = lead.issues.slice(0, 3).map(i => `• ${i.description}`).join('\n')
  const lossPoints = lead.issues.slice(0, 3).map(i => `• ${i.revenue_impact}`).join('\n')

  return template
    .replace('{bedrijfsnaam}', lead.business_name)
    .replace('{website}', lead.website || 'uw website')
    .replace('{problemen}', topIssues)
    .replace('{verlies}', lossPoints)
    .replace('{handtekening}', signature)
}

export const DEFAULT_TEMPLATE = `Goeiedag {bedrijfsnaam} 👋

Ik analyseerde {website} en ontdekte enkele verbeterpunten:

{problemen}

Hierdoor verliest u mogelijk klanten:
{verlies}

Met ons Webdesign + SEO pakket lossen we dit snel op en zorgen we dat u meer klanten aantrekt via Google.

Interesse in een gratis analyse? Antwoord gewoon op dit bericht!

{handtekening}`

export const DEFAULT_SIGNATURE = `Met vriendelijke groeten,
[Uw naam]
📱 [Uw telefoon]
🌐 [Uw website]`

export const BUSINESS_CATEGORIES = [
  'restaurant', 'bakkerij', 'slager', 'kapper', 'schoonheidssalon',
  'tandarts', 'advocaat', 'boekhouder', 'garage', 'loodgieter',
  'elektricien', 'schilder', 'tuinaanleg', 'vastgoed', 'hotel',
  'apotheek', 'dierenarts', 'sportschool', 'bloemist', 'traiteur',
  'catering', 'drukkerij', 'reisbureau', 'opticiën', 'klusjesman',
]

export const BELGIAN_CITIES = [
  'Antwerpen', 'Gent', 'Brussel', 'Brugge', 'Leuven', 'Hasselt',
  'Mechelen', 'Aalst', 'Sint-Niklaas', 'Kortrijk', 'Oostende',
  'Turnhout', 'Genk', 'Dendermonde', 'Lokeren', 'Ronse',
]
