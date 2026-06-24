import Link from 'next/link'
import type { Faq } from '@/lib/types'
import { getCategoryById } from '@/config/categories'
import { getYouTubeThumbnail } from '@/lib/youtube'

// Just the fields a listing card needs — keeps transcripts out of client payloads.
export type FaqCardData = Pick<Faq, 'slug' | 'question' | 'description' | 'category' | 'videoUrl'>

// Listing card: a YouTube THUMBNAIL (plain <img>, no iframe) + question + summary,
// linking to the full /faq/<slug> page. Listings never embed players, so a page can
// show dozens of these with no performance cost — the playable iframe lives only on
// the detail page (one per page).
export default function FaqCard({ faq }: { faq: FaqCardData }) {
  const thumb = getYouTubeThumbnail(faq.videoUrl)
  const category = getCategoryById(faq.category)

  return (
    <Link
      href={`/faq/${faq.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-brand-100 overflow-hidden hover:shadow-lg hover:border-brand-300 transition-all"
    >
      <div className="relative aspect-video bg-brand-50 overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl" aria-hidden>
            🎉
          </div>
        )}
        {faq.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-black/55 flex items-center justify-center">
              <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        {category && (
          <span className="text-xs font-semibold text-brand-600 mb-1.5">
            {category.emoji} {category.name}
          </span>
        )}
        <h3 className="font-semibold text-ink-900 leading-snug mb-1.5 group-hover:text-brand-700 transition-colors">
          {faq.question}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{faq.description}</p>
        <span className="mt-3 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
          Watch &amp; read →
        </span>
      </div>
    </Link>
  )
}
