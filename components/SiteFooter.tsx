import Link from 'next/link'
import type { SiteConfig } from '@/lib/types'

// Shared footer. Pulls NAP + social links from the admin-editable SiteConfig.
export default function SiteFooter({ config }: { config: SiteConfig }) {
  const telHref = config.phone ? `tel:${config.phone.replace(/\D/g, '')}` : ''
  return (
    <footer className="bg-ink-900 border-t border-white/10 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p
            className="text-white font-semibold"
            style={{ fontFamily: 'var(--font-fredoka), system-ui, sans-serif' }}
          >
            {config.businessName}
          </p>
          {config.phone && (
            <a href={telHref} className="text-white/50 hover:text-white/80 text-sm transition-colors">
              {config.phone}
            </a>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
          {config.socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
            >
              {link.label || link.url}
            </a>
          ))}
          <Link href="/" className="text-white/50 hover:text-white transition-colors">
            All Questions
          </Link>
          {config.bookingUrl && (
            <a href={config.bookingUrl} className="text-white/50 hover:text-white transition-colors">
              Book a Party
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
