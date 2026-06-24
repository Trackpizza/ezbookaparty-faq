import type { MetadataRoute } from 'next'
import { getPublicFaqs } from '@/lib/faqs'
import { CATEGORIES } from '@/config/categories'
import { SITE_URL } from '@/lib/schema'

// Generated from Firestore + the category config, so it always reflects what's live.
// Submit it to Search Console ONCE — Google re-crawls it; no monthly manual rebuild.
export const revalidate = 60

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const faqs = await getPublicFaqs()
  const now = new Date()

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    ...CATEGORIES.map(c => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...faqs.map(f => ({
      url: `${SITE_URL}/faq/${f.slug}`,
      lastModified: f.updatedAt ? new Date(f.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
