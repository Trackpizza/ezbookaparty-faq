import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CATEGORIES, getCategoryBySlug } from '@/config/categories'
import { getFaqsByCategory } from '@/lib/faqs'
import { getConfig } from '@/lib/config'
import { SITE_URL } from '@/lib/schema'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import FaqCard from '@/components/FaqCard'

export const revalidate = 60

export function generateStaticParams() {
  return CATEGORIES.map(c => ({ slug: c.slug }))
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug)
  if (!category) return {}
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `${SITE_URL}/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const category = getCategoryBySlug(params.slug)
  if (!category) notFound()

  const [faqs, config] = await Promise.all([getFaqsByCategory(category.id), getConfig()])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader bookingUrl={config.bookingUrl} />

      <section className="bg-gradient-to-b from-ink-900 to-ink-800 text-center px-6 pt-12 pb-10">
        <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
          ← All Questions
        </Link>
        <h1
          className="text-3xl sm:text-4xl font-semibold text-white mt-4 mb-3"
          style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
        >
          {category.emoji} {category.name}
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">{category.description}</p>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-10 w-full">
        {faqs.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No questions here yet — check back soon!</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {faqs.map(f => (
              <FaqCard key={f.slug} faq={f} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter config={config} />
    </div>
  )
}
