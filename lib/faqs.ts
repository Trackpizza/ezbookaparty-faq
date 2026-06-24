import { adminDb } from './firebase/admin'
import type { Faq } from './types'

// Normalize a raw Firestore doc into a well-formed Faq, so a missing/garbage field
// never crashes a page. `id` is the Firestore doc id.
function normalize(id: string, data: Record<string, unknown>): Faq {
  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  const strArr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
  return {
    id,
    slug: str(data.slug) || id,
    question: str(data.question),
    category: str(data.category),
    description: str(data.description),
    bullets: strArr(data.bullets),
    transcript: str(data.transcript),
    videoUrl: str(data.videoUrl),
    uploadDate: str(data.uploadDate),
    keywords: strArr(data.keywords),
    hidden: data.hidden === true,
    createdAt: num(data.createdAt),
    updatedAt: num(data.updatedAt) || num(data.createdAt),
  }
}

// Single source read: fetch the whole collection once, normalize, sort newest-first.
// The collection is small (hundreds of docs) and every public read is ISR-cached, so
// in-memory filtering keeps us free of Firestore composite-index setup at handoff.
export async function getAllFaqs(): Promise<Faq[]> {
  try {
    const snap = await adminDb.collection('faqs').get()
    return snap.docs
      .map(d => normalize(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

// Public (non-hidden) FAQs, newest-first — the chronological "feed".
export async function getPublicFaqs(): Promise<Faq[]> {
  return (await getAllFaqs()).filter(f => !f.hidden)
}

// Non-hidden FAQs in one category, newest-first.
export async function getFaqsByCategory(categoryId: string): Promise<Faq[]> {
  return (await getPublicFaqs()).filter(f => f.category === categoryId)
}

// One FAQ by slug. Returns hidden FAQs too — the page decides whether to 404 — so a
// direct hit on a freshly-hidden slug still resolves to the doc (then 404s in the page).
export async function getFaqBySlug(slug: string): Promise<Faq | null> {
  const all = await getAllFaqs()
  return all.find(f => f.slug === slug) ?? null
}

// Slugs of non-hidden FAQs — used by the sitemap and generateStaticParams.
export async function getPublicSlugs(): Promise<string[]> {
  return (await getPublicFaqs()).map(f => f.slug)
}
