// Centralized JSON-LD builders. These feed Google's business panel, video search,
// and AI overviews. Business facts come from the admin-editable SiteConfig.
import type { SiteConfig } from './types'

export const SITE_URL = 'https://faq.ezbookaparty.com'
export const BUSINESS_ID = `${SITE_URL}/#business`

// Normalize a display phone like "(555) 123-4567" to E.164-ish "+1-555-123-4567".
function normalizePhone(raw?: string): string | undefined {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (digits.length === 10) return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  if (digits.length === 11 && digits.startsWith('1')) return `+1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  return undefined
}

// LocalBusiness for the homepage. Address fields are only emitted when present so we
// never ship a half-empty PostalAddress before the client fills in their NAP.
export function localBusinessLd(config: SiteConfig) {
  const phone = normalizePhone(config.phone)
  const sameAs = config.socialLinks.map(l => l.url.trim()).filter(u => u !== '')
  // Trim stray spaces so structured-data NAP stays clean/consistent.
  const street = config.address.trim()
  const city = config.city.trim()
  const region = config.region.trim()
  const postalCode = config.postalCode.trim()
  const hasAddress = street || city || region || postalCode
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: config.businessName.trim(),
    url: SITE_URL,
    ...(config.websiteUrl ? { mainEntityOfPage: config.websiteUrl.trim() } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(config.email ? { email: config.email.trim() } : {}),
    ...(hasAddress
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(street ? { streetAddress: street } : {}),
            ...(city ? { addressLocality: city } : {}),
            ...(region ? { addressRegion: region } : {}),
            ...(postalCode ? { postalCode } : {}),
            addressCountry: 'US',
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

// FAQPage with a single Question/acceptedAnswer — models "a page answering this one
// question". `answer` should be plain text (description + key points).
export function faqPageLd(opts: { question: string; answer: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: opts.url,
    mainEntity: [
      {
        '@type': 'Question',
        name: opts.question,
        acceptedAnswer: { '@type': 'Answer', text: opts.answer },
      },
    ],
  }
}

// VideoObject so Google can credit the embedded video to this page. `uploadDate` is
// REQUIRED by Google; callers pass null when there's no video and skip rendering.
export function videoObjectLd(opts: {
  name: string
  description: string
  thumbnailUrl: string
  embedUrl: string
  uploadDate: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: opts.name,
    description: opts.description,
    thumbnailUrl: opts.thumbnailUrl,
    embedUrl: opts.embedUrl,
    ...(opts.uploadDate ? { uploadDate: opts.uploadDate } : {}),
  }
}
