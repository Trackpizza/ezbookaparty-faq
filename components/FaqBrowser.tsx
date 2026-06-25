'use client'
import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import FaqCard, { type FaqCardData } from './FaqCard'
import type { Category } from '@/config/categories'

// Search corpus carries a little extra (keywords + category name) for matching, but
// only the FaqCardData subset is ever rendered.
export interface BrowseFaq extends FaqCardData {
  keywords: string[]
  categoryName: string
}

type View = 'topics' | 'feed'

export default function FaqBrowser({
  faqs,
  categories,
}: {
  faqs: BrowseFaq[] // already sorted newest-first
  categories: Category[]
}) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>('topics')

  const fuse = useMemo(
    () =>
      new Fuse(faqs, {
        keys: [
          { name: 'question', weight: 2 },
          { name: 'keywords', weight: 1.8 },
          { name: 'categoryName', weight: 1.2 },
          { name: 'description', weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [faqs],
  )

  const q = query.trim()
  const results = useMemo(() => (q ? fuse.search(q).map(r => r.item) : []), [q, fuse])

  // Group non-empty categories for the Topics view.
  const grouped = useMemo(
    () =>
      categories
        .map(cat => ({ cat, items: faqs.filter(f => f.category === cat.id) }))
        .filter(g => g.items.length > 0),
    [categories, faqs],
  )

  return (
    <div>
      {/* Search bar */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search a question, e.g. deposit, delivery, cancel…"
            aria-label="Search questions"
            className="w-full pl-12 pr-10 py-4 rounded-full border border-brand-200 bg-white text-gray-900 text-base placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results when searching */}
      {q ? (
        <section className="max-w-6xl mx-auto px-6 pt-10">
          {results.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No questions match &ldquo;{q}&rdquo; — try a different word.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500 text-center mb-6">
                {results.length} question{results.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map(f => (
                  <FaqCard key={f.slug} faq={f} />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <>
          {/* View toggle */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex rounded-full bg-white border border-brand-200 p-1">
              <button
                onClick={() => setView('topics')}
                className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                  view === 'topics' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-brand-600'
                }`}
              >
                By Topic
              </button>
              <button
                onClick={() => setView('feed')}
                className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                  view === 'feed' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-brand-600'
                }`}
              >
                Latest
              </button>
            </div>
          </div>

          {faqs.length === 0 ? (
            <p className="text-center text-gray-400 py-16">
              No questions published yet — check back soon!
            </p>
          ) : view === 'feed' ? (
            <section className="max-w-6xl mx-auto px-6 pt-10">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {faqs.map(f => (
                  <FaqCard key={f.slug} faq={f} />
                ))}
              </div>
            </section>
          ) : (
            <div className="max-w-6xl mx-auto px-6 pt-10 space-y-14">
              {grouped.map(({ cat, items }) => (
                <section key={cat.id}>
                  <div className="mb-6 pb-3 border-b border-brand-100">
                    <h2
                      className="text-2xl font-semibold text-ink-900"
                      style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
                    >
                      {cat.emoji} {cat.name}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">{cat.description}</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(f => (
                      <FaqCard key={f.slug} faq={f} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
