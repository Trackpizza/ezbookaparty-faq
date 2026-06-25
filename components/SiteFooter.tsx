import Link from 'next/link'
import type { SiteConfig } from '@/lib/types'

// Digits-only for tel:/sms: hrefs (keeps a leading + if present).
function dial(raw: string): string {
  const plus = raw.trim().startsWith('+') ? '+' : ''
  return plus + raw.replace(/\D/g, '')
}

// Shared footer. Pulls NAP + mobile (Call/Text) + disclaimer + social links from the
// admin-editable SiteConfig.
export default function SiteFooter({ config }: { config: SiteConfig }) {
  const hasPhone = config.phone.trim() !== ''
  const hasMobile = config.mobilePhone.trim() !== ''

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
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-1">
            {hasPhone && (
              <a href={`tel:${dial(config.phone)}`} className="text-white/50 hover:text-white/80 text-sm transition-colors">
                📞 Call {config.phone}
              </a>
            )}
            {hasMobile && (
              <>
                <a href={`tel:${dial(config.mobilePhone)}`} className="text-white/50 hover:text-white/80 text-sm transition-colors">
                  📱 Call {config.mobilePhone}
                </a>
                <a href={`sms:${dial(config.mobilePhone)}`} className="text-white/50 hover:text-white/80 text-sm transition-colors">
                  💬 Text us
                </a>
              </>
            )}
          </div>
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

      {config.disclaimer.trim() && (
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-white/35 leading-relaxed text-center md:text-left whitespace-pre-line">
            {config.disclaimer}
          </p>
        </div>
      )}
    </footer>
  )
}
