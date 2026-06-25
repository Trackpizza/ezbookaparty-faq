import { adminDb } from './firebase/admin'
import type { Category } from './types'
import { DEFAULT_CATEGORIES } from '@/config/categories'

// Reads the admin-managed category list from siteConfig/taxonomy. Falls back to the
// seed defaults until the client saves their own list. Keeps only well-formed rows.
export async function getCategories(): Promise<Category[]> {
  try {
    const snap = await adminDb.collection('siteConfig').doc('taxonomy').get()
    const items = snap.exists ? (snap.data()?.items as unknown) : undefined
    if (!Array.isArray(items) || items.length === 0) return DEFAULT_CATEGORIES
    const clean = items.filter(
      (c): c is Category =>
        !!c && typeof c.id === 'string' && c.id !== '' && typeof c.slug === 'string' && typeof c.name === 'string',
    )
    return clean.length ? clean : DEFAULT_CATEGORIES
  } catch {
    return DEFAULT_CATEGORIES
  }
}

// Pure finders over an already-fetched list (categories are async now, so callers
// fetch once and look up locally).
export const findCategoryById = (cats: Category[], id: string) => cats.find(c => c.id === id)
export const findCategoryBySlug = (cats: Category[], slug: string) => cats.find(c => c.slug === slug)
