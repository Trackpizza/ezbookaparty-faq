import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/schema'

// Allow all public pages; keep the admin panel out of the index. Points at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
