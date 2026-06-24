import { getPublicFaqs } from '@/lib/faqs'
import { getConfig } from '@/lib/config'
import { CATEGORIES, getCategoryById } from '@/config/categories'
import { localBusinessLd } from '@/lib/schema'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import FaqBrowser, { type BrowseFaq } from '@/components/FaqBrowser'

// ISR: served instantly from the CDN, regenerated at most once/min and immediately on
// admin save (revalidate hook). New FAQs not yet in a static build render on-demand.
export const revalidate = 60

export default async function HomePage() {
  const [faqs, config] = await Promise.all([getPublicFaqs(), getConfig()])

  const browseFaqs: BrowseFaq[] = faqs.map(f => ({
    slug: f.slug,
    question: f.question,
    description: f.description,
    category: f.category,
    videoUrl: f.videoUrl,
    keywords: f.keywords,
    categoryName: getCategoryById(f.category)?.name ?? '',
  }))

  const bizLd = localBusinessLd(config)

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bizLd) }} />
      <SiteHeader bookingUrl={config.bookingUrl} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-ink-900 to-ink-800 text-center px-6 pt-14 pb-12">
        <h1
          className="text-4xl sm:text-5xl font-semibold text-white mb-4 text-balance"
          style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
        >
          Party Booking Questions, Answered 🎉
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          {config.tagline} Every question gets a short video and a written answer you can
          read in seconds.
        </p>
      </section>

      <main className="flex-1 -mt-6 pb-8">
        <FaqBrowser faqs={browseFaqs} categories={CATEGORIES} />
      </main>

      <SiteFooter config={config} />
    </div>
  )
}
