import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-revalidate-token')
  if (token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Revalidate every page (home, categories, faq details, sitemap).
  revalidatePath('/', 'layout')
  return NextResponse.json({ revalidated: true })
}
