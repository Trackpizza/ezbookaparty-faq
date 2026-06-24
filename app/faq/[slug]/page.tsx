import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getFaqBySlug, getPublicSlugs, getFaqsByCategory } from '@/lib/faqs'
import { getConfig } from '@/lib/config'
import { getCategoryById } from '@/config/categories'
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'
import { faqPageLd, videoObjectLd, SITE_URL } from '@/lib/schema'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import FaqCard from '@/components/FaqCard'
import Markdown from '@/components/Markdown'

export const revalidate = 60

// Pre-render the known FAQs; new slugs render on-demand (dynamicParams defaults true).
export async function generateStaticParams() {
  return (await getPublicSlugs()).map(slug => ({ slug }))
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const faq = await getFaqBySlug(params.slug)
  if (!faq || faq.hidden) return {}
  return {
    title: faq.question,
    description: faq.description,
    keywords: faq.keywords.join(', '),
    alternates: { canonical: `${SITE_URL}/faq/${faq.slug}` },
  }
}

export default async function FaqPage({ params }: Props) {
  const faq = await getFaqBySlug(params.slug)
  if (!faq || faq.hidden) notFound()

  const [config, related] = await Promise.all([
    getConfig(),
    getFaqsByCategory(faq.category),
  ])
  const category = getCategoryById(faq.category)
  const embedUrl = getYouTubeEmbedUrl(faq.videoUrl)
  const thumb = getYouTubeThumbnail(faq.videoUrl)

  // Plain-text answer for schema: description + key points.
  const answerText = [faq.description, ...faq.bullets].filter(Boolean).join(' ')
  const pageUrl = `${SITE_URL}/faq/${faq.slug}`
  const faqLd = faqPageLd({ question: faq.question, answer: answerText, url: pageUrl })
  const videoLd =
    embedUrl && thumb
      ? videoObjectLd({
          name: faq.question,
          description: faq.description || faq.question,
          thumbnailUrl: thumb,
          embedUrl,
          uploadDate: faq.uploadDate,
        })
      : null

  const relatedOthers = related.filter(f => f.slug !== faq.slug).slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      {videoLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }} />
      )}

      <SiteHeader bookingUrl={config.bookingUrl} />

      <main className="flex-1">
        {/* Breadcrumb + question */}
        <section className="max-w-3xl mx-auto px-6 pt-10">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-brand-600 transition-colors">
              All Questions
            </Link>
            {category && (
              <>
                <span>/</span>
                <Link href={`/category/${category.slug}`} className="hover:text-brand-600 transition-colors">
                  {category.name}
                </Link>
              </>
            )}
          </div>
          <h1
            className="text-3xl sm:text-4xl font-semibold text-ink-900 leading-tight text-balance"
            style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
          >
            {faq.question}
          </h1>
          {faq.description && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">{faq.description}</p>
          )}
        </section>

        {/* Video (single player per page → eager iframe is fine) */}
        {embedUrl && (
          <section className="max-w-3xl mx-auto px-6 pt-8">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-black" style={{ aspectRatio: '16/9' }}>
              <iframe
                src={embedUrl}
                title={faq.question}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </section>
        )}

        {/* Key points */}
        {faq.bullets.length > 0 && (
          <section className="max-w-3xl mx-auto px-6 pt-10">
            <div className="bg-white rounded-2xl border border-brand-100 p-6">
              <h2
                className="text-lg font-semibold text-ink-900 mb-4"
                style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
              >
                Quick answer
              </h2>
              <ul className="space-y-2.5">
                {faq.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="shrink-0 mt-1 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Transcript / full answer */}
        {faq.transcript.trim() && (
          <section className="max-w-3xl mx-auto px-6 pt-10">
            <h2
              className="text-xl font-semibold text-ink-900 mb-3"
              style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
            >
              Full answer
            </h2>
            <Markdown>{faq.transcript}</Markdown>
          </section>
        )}

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 pt-12">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl px-8 py-10 text-center">
            <h2
              className="text-2xl font-semibold text-white mb-2"
              style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
            >
              Ready to book your party?
            </h2>
            <p className="text-white/80 mb-6">We&rsquo;ll help you pick a date and lock it in.</p>
            <a
              href={config.bookingUrl}
              className="inline-block bg-white text-brand-700 font-semibold px-7 py-3 rounded-full hover:bg-brand-50 transition-colors"
            >
              Book a Party
            </a>
          </div>
        </section>

        {/* Related */}
        {relatedOthers.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 pt-14">
            <h2
              className="text-xl font-semibold text-ink-900 mb-6"
              style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
            >
              More about {category?.name ?? 'this'}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedOthers.map(f => (
                <FaqCard key={f.slug} faq={f} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter config={config} />
    </div>
  )
}
