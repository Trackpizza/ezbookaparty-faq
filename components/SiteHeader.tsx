import Link from 'next/link'

// Shared top bar. `bookingUrl` is the main "Book a Party" CTA from SiteConfig.
export default function SiteHeader({ bookingUrl }: { bookingUrl: string }) {
  return (
    <header className="bg-ink-900">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl" aria-hidden>🎈</span>
          <span
            className="text-white text-lg font-semibold group-hover:text-brand-200 transition-colors"
            style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
          >
            EZ Book A Party
          </span>
          <span className="hidden sm:inline text-white/40 text-sm font-medium">· FAQ</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden sm:inline text-sm text-white/70 hover:text-white font-medium transition-colors">
            All Questions
          </Link>
          {bookingUrl && (
            <a
              href={bookingUrl}
              className="bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-600 transition-colors"
            >
              Book a Party
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
