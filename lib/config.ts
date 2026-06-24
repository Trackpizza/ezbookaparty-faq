import { adminDb } from './firebase/admin'
import type { SiteConfig, SocialLink } from './types'
import { DEFAULT_CONFIG } from './types'

// Reads the single `siteConfig/config` doc and merges it over DEFAULT_CONFIG so a
// missing field never breaks a page. Falls back entirely to defaults on any error.
export async function getConfig(): Promise<SiteConfig> {
  try {
    const snap = await adminDb.collection('siteConfig').doc('config').get()
    if (!snap.exists) return DEFAULT_CONFIG
    const data = snap.data() as Partial<SiteConfig>
    const socialLinks: SocialLink[] = (Array.isArray(data.socialLinks) ? data.socialLinks : [])
      .filter((l): l is SocialLink => !!l && typeof l.url === 'string' && l.url.trim() !== '')
    return { ...DEFAULT_CONFIG, ...data, socialLinks }
  } catch {
    return DEFAULT_CONFIG
  }
}
