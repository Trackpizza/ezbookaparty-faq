import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { DEFAULT_CATEGORIES } from '@/config/categories'
import type { Category } from '@/lib/types'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_PASSWORD
}

async function triggerRevalidate() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-token': process.env.ADMIN_PASSWORD ?? '' },
    })
  } catch {
    /* best-effort */
  }
}

function slugify(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Ensure value is unique within `used` by appending -2, -3, … on collision.
function unique(value: string, used: Set<string>): string {
  let v = value || 'category'
  let n = 2
  while (used.has(v)) v = `${value}-${n++}`
  used.add(v)
  return v
}

// GET — current categories (seeded with defaults until the client saves their own).
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('siteConfig').doc('taxonomy').get()
  const items = snap.exists ? snap.data()?.items : undefined
  return NextResponse.json({ categories: Array.isArray(items) && items.length ? items : DEFAULT_CATEGORIES })
}

// PUT — save the full ordered list. Assigns stable ids to new rows (existing ids are
// preserved so FAQs never orphan), normalizes + de-dupes slugs and ids.
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = (await req.json()) as { categories?: unknown }
  const raw = Array.isArray(body.categories) ? body.categories : []

  const usedIds = new Set<string>()
  const usedSlugs = new Set<string>()
  const items: Category[] = []
  for (const r of raw) {
    const row = (r ?? {}) as Partial<Category>
    const name = (row.name ?? '').trim()
    if (!name) continue // skip blank rows
    const id = unique((row.id ?? '').trim() || slugify(name), usedIds)
    const slug = unique(slugify((row.slug ?? '').trim() || name), usedSlugs)
    items.push({
      id,
      slug,
      name,
      description: (row.description ?? '').trim(),
      emoji: (row.emoji ?? '').trim(),
    })
  }
  if (items.length === 0) {
    return NextResponse.json({ error: 'Add at least one category.' }, { status: 400 })
  }

  await adminDb.collection('siteConfig').doc('taxonomy').set({ items })
  await triggerRevalidate()
  return NextResponse.json({ success: true, categories: items })
}
