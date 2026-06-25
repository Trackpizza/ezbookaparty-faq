// ── Categories: admin-editable topic taxonomy (Firestore doc siteConfig/taxonomy)
// A small ordered list the client manages to match their batches / YouTube
// playlists. Each FAQ stores a category `id`; `id` must stay stable once FAQs
// reference it (the slug/name can change freely).

export interface Category {
  id: string            // stable key stored on each FAQ (never changes)
  slug: string          // SEO URL segment for /category/<slug>
  name: string          // display name
  description: string   // shown on the category page + home section
  emoji: string         // small decorative marker
}

// ── FAQ entries: one Firestore doc per question, in the `faqs` collection ──────
// Each FAQ is the atomic unit of the site: one video + answer + transcript = one
// page = one URL targeting that question's search query. Created/edited from /admin.

export interface Faq {
  id: string            // Firestore doc id (stable; keyed by slug at creation)
  slug: string          // SEO URL segment for /faq/<slug> (editable)
  question: string      // the H1 + the question users search
  category: string      // Category.id from config/categories.ts
  description: string    // 1–2 sentence answer summary (cards, meta description, schema)
  bullets: string[]     // key takeaways shown under the video
  transcript: string    // full video transcript (Markdown) — critical for SEO/AI/a11y
  videoUrl: string      // YouTube URL (watch/short/embed); '' = no video yet
  uploadDate: string    // YYYY-MM-DD — REQUIRED by Google for VideoObject
  keywords: string[]    // extra search terms (synonyms, phrasings)
  hidden: boolean       // true = off everywhere AND /faq/<slug> 404s
  createdAt: number     // epoch ms — powers the chronological "feed" view
  updatedAt: number     // epoch ms — last edit, used as sitemap lastModified
}

// Shape used by the admin create/edit form (no server-managed fields).
export type FaqInput = Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>

export const EMPTY_FAQ: FaqInput = {
  slug: '',
  question: '',
  category: '',
  description: '',
  bullets: [],
  transcript: '',
  videoUrl: '',
  uploadDate: '',
  keywords: [],
  hidden: false,
}

// ── Site config: a single Firestore doc `siteConfig/config` ────────────────────
// Business facts + footer links that feed the LocalBusiness schema and the footer.
// Editable from /admin so the client can keep NAP (name/address/phone) in sync with
// their Google Business Profile without a redeploy.

export interface SocialLink {
  label: string
  url: string
}

export interface SiteConfig {
  businessName: string
  tagline: string
  phone: string         // main landline/office → Call (tel:) link + schema
  mobilePhone: string   // cell → Call (tel:) AND Text (sms:) links
  email: string
  bookingUrl: string    // main "Book a Party" CTA destination
  websiteUrl: string    // main marketing site (logo link)
  address: string       // street address
  city: string
  region: string        // state, e.g. "TX"
  postalCode: string
  disclaimer: string    // site-wide legal/policy disclaimer shown in the footer
  socialLinks: SocialLink[]  // Instagram, Facebook, GBP, etc. → footer + schema sameAs
}

export const DEFAULT_CONFIG: SiteConfig = {
  businessName: 'EZ Book A Party',
  tagline: 'Answers to your party booking, rental, and setup questions.',
  phone: '',
  mobilePhone: '',
  email: '',
  bookingUrl: 'https://www.ezbookaparty.com',
  websiteUrl: 'https://www.ezbookaparty.com',
  address: '',
  city: '',
  region: '',
  postalCode: '',
  disclaimer: '',
  socialLinks: [],
}
