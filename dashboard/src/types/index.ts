export interface Lead {
  id: string
  business_name: string
  phone: string | null
  website: string | null
  category: string
  city: string
  address: string | null
  google_rating: number | null
  review_count: number | null
  website_score: number | null
  issues: WebsiteIssue[]
  status: 'new' | 'contacted' | 'responded' | 'closed' | 'not_interested'
  notes: string | null
  created_at: string
  whatsapp_sent_at: string | null
}

export interface WebsiteIssue {
  type: 'no_website' | 'slow_speed' | 'no_ssl' | 'not_mobile' | 'bad_seo' | 'no_contact' | 'outdated' | 'no_google_business'
  severity: 'critical' | 'high' | 'medium'
  description: string
  revenue_impact: string
}

export interface WebsiteAnalysis {
  url: string | null
  score: number
  issues: WebsiteIssue[]
  performance_score: number | null
  seo_score: number | null
  has_ssl: boolean
  is_mobile_friendly: boolean | null
  load_time: number | null
}

export interface WhatsAppMessage {
  id: string
  lead_id: string
  lead_name: string
  phone: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  sent_at: string
}

export interface Stats {
  total_leads: number
  new_leads: number
  contacted: number
  responded: number
  conversion_rate: number
  messages_sent: number
}

export interface SearchParams {
  city: string
  category: string
  max_results?: number
}

export interface ScrapedBusiness {
  name: string
  address: string
  phone: string | null
  website: string | null
  rating: number | null
  reviews: number | null
  category: string
}
