import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import type { FaqInput } from '@/lib/types'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_PASSWORD
}

// Fire ISR revalidation after any write so changes appear immediately (best-effort).
async function triggerRevalidate() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-token': process.env.ADMIN_PASSWORD ?? '' },
    })
  } catch {
    /* revalidation is best-effort */
  }
}

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Coerce an arbitrary request body into a clean, fully-formed FaqInput.
function sanitize(body: Record<string, unknown>): FaqInput | null {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const strArr = (v: unknown) =>
    Array.isArray(v) ? v.map(x => (typeof x === 'string' ? x.trim() : '')).filter(Boolean) : []
  const question = str(body.question)
  const slug = normalizeSlug(str(body.slug) || question)
  const category = str(body.category)
  if (!question || !slug || !category) return null
  return {
    slug,
    question,
    category,
    description: str(body.description),
    bullets: strArr(body.bullets),
    transcript: typeof body.transcript === 'string' ? body.transcript : '',
    videoUrl: str(body.videoUrl),
    uploadDate: str(body.uploadDate),
    keywords: strArr(body.keywords),
    hidden: body.hidden === true,
  }
}

// True if another doc (not `exceptId`) already uses this slug.
async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const snap = await adminDb.collection('faqs').where('slug', '==', slug).get()
  return snap.docs.some(d => d.id !== exceptId)
}

// GET — list all FAQs (including hidden) for the admin table.
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('faqs').get()
  const faqs = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => ((b as { createdAt?: number }).createdAt ?? 0) - ((a as { createdAt?: number }).createdAt ?? 0))
  return NextResponse.json({ faqs })
}

// POST — create a new FAQ (auto doc id; slug stored as a field).
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input = sanitize(await req.json())
  if (!input) return NextResponse.json({ error: 'Question, slug, and category are required.' }, { status: 400 })
  if (await slugTaken(input.slug)) {
    return NextResponse.json({ error: `Slug "${input.slug}" is already in use.` }, { status: 409 })
  }
  const now = Date.now()
  const ref = await adminDb.collection('faqs').add({ ...input, createdAt: now, updatedAt: now })
  await triggerRevalidate()
  return NextResponse.json({ id: ref.id, success: true })
}

// PUT — update an existing FAQ (body.id identifies the doc).
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = (await req.json()) as Record<string, unknown>
  const id = typeof body.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const input = sanitize(body)
  if (!input) return NextResponse.json({ error: 'Question, slug, and category are required.' }, { status: 400 })
  if (await slugTaken(input.slug, id)) {
    return NextResponse.json({ error: `Slug "${input.slug}" is already in use.` }, { status: 409 })
  }
  await adminDb.collection('faqs').doc(id).set({ ...input, updatedAt: Date.now() }, { merge: true })
  await triggerRevalidate()
  return NextResponse.json({ success: true })
}

// DELETE — remove a FAQ by ?id=
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  await adminDb.collection('faqs').doc(id).delete()
  await triggerRevalidate()
  return NextResponse.json({ success: true })
}
