import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_PASSWORD
}

// GET — the site config doc (business facts + footer links).
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('siteConfig').doc('config').get()
  return NextResponse.json(snap.exists ? snap.data() : {})
}

// PUT — merge-save the site config, then trigger ISR revalidation.
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  await adminDb.collection('siteConfig').doc('config').set(body, { merge: true })
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-token': process.env.ADMIN_PASSWORD ?? '' },
    })
  } catch {
    /* best-effort */
  }
  return NextResponse.json({ success: true })
}
