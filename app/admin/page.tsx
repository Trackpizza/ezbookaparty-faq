'use client'
import { useState, useEffect, useCallback } from 'react'
import { CATEGORIES, getCategoryById } from '@/config/categories'
import type { SiteConfig, SocialLink } from '@/lib/types'
import { DEFAULT_CONFIG } from '@/lib/types'

const TOKEN_KEY = 'faq_admin_token'
const todayISO = () => new Date().toISOString().slice(0, 10)

function slugify(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ── Raw FAQ row as returned by the API (Firestore doc + id) ───────────────────
interface FaqRow {
  id: string
  slug: string
  question: string
  category: string
  description?: string
  bullets?: string[]
  transcript?: string
  videoUrl?: string
  uploadDate?: string
  keywords?: string[]
  hidden?: boolean
  createdAt?: number
}

// ── The FAQ create/edit form model ────────────────────────────────────────────
interface FormState {
  id?: string
  question: string
  slug: string
  slugEdited: boolean
  category: string
  description: string
  bulletsText: string
  transcript: string
  videoUrl: string
  uploadDate: string
  keywordsText: string
  hidden: boolean
}

const emptyForm = (): FormState => ({
  question: '',
  slug: '',
  slugEdited: false,
  category: CATEGORIES[0]?.id ?? '',
  description: '',
  bulletsText: '',
  transcript: '',
  videoUrl: '',
  uploadDate: '',
  keywordsText: '',
  hidden: false,
})

const formFromRow = (r: FaqRow): FormState => ({
  id: r.id,
  question: r.question,
  slug: r.slug,
  slugEdited: true,
  category: r.category,
  description: r.description ?? '',
  bulletsText: (r.bullets ?? []).join('\n'),
  transcript: r.transcript ?? '',
  videoUrl: r.videoUrl ?? '',
  uploadDate: r.uploadDate ?? '',
  keywordsText: (r.keywords ?? []).join(', '),
  hidden: r.hidden === true,
})

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState<'questions' | 'settings'>('questions')

  // ── Auth ────────────────────────────────────────────────────────────────────
  const token = () => (typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) ?? '' : '')

  const handleLogin = async () => {
    setAuthError('')
    const res = await fetch('/api/admin/faqs', { headers: { 'x-admin-token': password } })
    if (res.ok) {
      sessionStorage.setItem(TOKEN_KEY, password)
      setAuthed(true)
    } else {
      setAuthError('Incorrect password')
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem(TOKEN_KEY)) setAuthed(true)
  }, [])

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-ink-900 mb-1">FAQ Admin</h1>
          <p className="text-sm text-gray-500 mb-6">EZ Book A Party</p>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className={inputCls}
            />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-ink-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold">FAQ Admin</h1>
          <p className="text-white/50 text-xs">EZ Book A Party</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex rounded-full bg-white/10 p-1">
            <button
              onClick={() => setTab('questions')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                tab === 'questions' ? 'bg-white text-ink-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setTab('settings')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                tab === 'settings' ? 'bg-white text-ink-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Site Settings
            </button>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem(TOKEN_KEY)
              setAuthed(false)
            }}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {tab === 'questions' ? <QuestionsTab token={token} /> : <SettingsTab token={token} />}
      </div>
    </div>
  )
}

// ── Questions tab ─────────────────────────────────────────────────────────────
function QuestionsTab({ token }: { token: () => string }) {
  const [faqs, setFaqs] = useState<FaqRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/faqs', { headers: { 'x-admin-token': token() } })
    if (res.ok) {
      const data = await res.json()
      setFaqs(data.faqs ?? [])
    }
    setLoading(false)
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const update = (patch: Partial<FormState>) => setForm(f => (f ? { ...f, ...patch } : f))

  const onQuestion = (v: string) =>
    setForm(f => (f ? { ...f, question: v, slug: f.slugEdited ? f.slug : slugify(v) } : f))

  const onVideo = (v: string) =>
    setForm(f => (f ? { ...f, videoUrl: v, uploadDate: v.trim() && !f.uploadDate ? todayISO() : f.uploadDate } : f))

  const save = async () => {
    if (!form) return
    setError('')
    if (!form.question.trim() || !form.slug.trim() || !form.category) {
      setError('Question, slug, and category are required.')
      return
    }
    setSaving(true)
    const payload = {
      id: form.id,
      question: form.question,
      slug: form.slug,
      category: form.category,
      description: form.description,
      bullets: form.bulletsText.split('\n').map(s => s.trim()).filter(Boolean),
      transcript: form.transcript,
      videoUrl: form.videoUrl,
      uploadDate: form.uploadDate,
      keywords: form.keywordsText.split(',').map(s => s.trim()).filter(Boolean),
      hidden: form.hidden,
    }
    const res = await fetch('/api/admin/faqs', {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token() },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      setForm(null)
      await load()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Save failed.')
    }
  }

  const remove = async (row: FaqRow) => {
    if (!confirm(`Delete "${row.question}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/faqs?id=${encodeURIComponent(row.id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token() },
    })
    if (res.ok) await load()
  }

  // ── Editor form ──
  if (form) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">{form.id ? 'Edit question' : 'Add a question'}</h2>
          <button onClick={() => setForm(null)} className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to list
          </button>
        </div>

        <Field label="Question" hint="The exact question people ask / search.">
          <input type="text" value={form.question} onChange={e => onQuestion(e.target.value)} placeholder="How much is the deposit to book?" className={inputCls} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="URL slug" hint={`faq.ezbookaparty.com/faq/${form.slug || '...'}`}>
            <input type="text" value={form.slug} onChange={e => update({ slug: e.target.value, slugEdited: true })} placeholder="how-much-is-the-deposit" className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e => update({ category: e.target.value })} className={inputCls}>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Short answer / summary" hint="1–2 sentences. Shows on cards, the page intro, search results, and the meta description.">
          <textarea value={form.description} onChange={e => update({ description: e.target.value })} rows={2} className={inputCls} placeholder="A $50 deposit holds your date; it's applied to your final balance." />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="YouTube video URL" hint="watch / youtu.be / shorts link. Optional.">
            <input type="text" value={form.videoUrl} onChange={e => onVideo(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
          </Field>
          <Field label="Video upload date" hint="Required by Google for video search. Auto-fills to today.">
            <input type="date" value={form.uploadDate} onChange={e => update({ uploadDate: e.target.value })} disabled={!form.videoUrl.trim()} className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-300`} />
          </Field>
        </div>

        <Field label="Key points (one per line)" hint="Short bullet takeaways shown under the video.">
          <textarea value={form.bulletsText} onChange={e => update({ bulletsText: e.target.value })} rows={4} className={`${inputCls} font-mono`} placeholder={'$50 deposit holds your date\nApplied to your final balance\nRefundable up to 7 days before'} />
        </Field>

        <Field label="Full answer / transcript (Markdown)" hint="The complete written answer or video transcript — critical for SEO & accessibility. ## headings, **bold**, - bullets, [links](https://...).">
          <textarea value={form.transcript} onChange={e => update({ transcript: e.target.value })} rows={10} className={`${inputCls} font-mono leading-relaxed`} placeholder="Paste the full transcript or write the complete answer here…" />
        </Field>

        <Field label="Extra search keywords (comma-separated)" hint="Synonyms & alternate phrasings to help on-site search find this.">
          <input type="text" value={form.keywordsText} onChange={e => update({ keywordsText: e.target.value })} placeholder="down payment, reservation fee, hold my date" className={inputCls} />
        </Field>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.hidden} onChange={e => update({ hidden: e.target.checked })} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          Hidden (off the site and the URL 404s)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button onClick={() => setForm(null)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="px-6 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : form.id ? 'Save changes' : 'Publish question'}
          </button>
        </div>
      </div>
    )
  }

  // ── List ──
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Questions</h2>
          <p className="text-sm text-gray-500">{faqs.length} published{faqs.some(f => f.hidden) ? ` · ${faqs.filter(f => f.hidden).length} hidden` : ''}</p>
        </div>
        <button onClick={() => setForm(emptyForm())} className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors">
          <span className="text-lg leading-none">+</span> Add question
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
          No questions yet — click &ldquo;Add question&rdquo; to publish your first.
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map(row => {
            const cat = getCategoryById(row.category)
            return (
              <div key={row.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 truncate">{row.question}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cat ? `${cat.emoji} ${cat.name}` : 'Uncategorized'} · /{row.slug}
                    {row.videoUrl ? ' · 🎬 video' : ''}
                    {row.hidden ? ' · 🚫 hidden' : ''}
                  </p>
                </div>
                <button onClick={() => setForm(formFromRow(row))} className="text-sm font-semibold text-brand-600 hover:text-brand-700 shrink-0">
                  Edit
                </button>
                <button onClick={() => remove(row)} aria-label="Delete" className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Site Settings tab ─────────────────────────────────────────────────────────
function SettingsTab({ token }: { token: () => string }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/admin/config', { headers: { 'x-admin-token': token() } })
      if (res.ok) {
        const data = await res.json()
        setConfig({ ...DEFAULT_CONFIG, ...data, socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [] })
      }
      setLoading(false)
    })()
  }, [token])

  const set = (patch: Partial<SiteConfig>) => setConfig(c => ({ ...c, ...patch }))
  const setLink = (i: number, key: keyof SocialLink, val: string) =>
    setConfig(c => ({ ...c, socialLinks: c.socialLinks.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)) }))
  const addLink = () => setConfig(c => ({ ...c, socialLinks: [...c.socialLinks, { label: '', url: '' }] }))
  const removeLink = (i: number) => setConfig(c => ({ ...c, socialLinks: c.socialLinks.filter((_, idx) => idx !== i) }))

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token() },
      body: JSON.stringify(config),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Site Settings</h2>
          <p className="text-sm text-gray-500">Business info for the footer + Google business panel. Match your Google Business Profile.</p>
        </div>
        <button onClick={save} disabled={saving} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Business name"><input type="text" value={config.businessName} onChange={e => set({ businessName: e.target.value })} className={inputCls} /></Field>
        <Field label="Tagline"><input type="text" value={config.tagline} onChange={e => set({ tagline: e.target.value })} className={inputCls} /></Field>
        <Field label="Phone"><input type="text" value={config.phone} onChange={e => set({ phone: e.target.value })} placeholder="(555) 123-4567" className={inputCls} /></Field>
        <Field label="Email"><input type="text" value={config.email} onChange={e => set({ email: e.target.value })} className={inputCls} /></Field>
        <Field label="Booking URL" hint="Where the 'Book a Party' button goes."><input type="text" value={config.bookingUrl} onChange={e => set({ bookingUrl: e.target.value })} className={inputCls} /></Field>
        <Field label="Main website URL"><input type="text" value={config.websiteUrl} onChange={e => set({ websiteUrl: e.target.value })} className={inputCls} /></Field>
        <Field label="Street address"><input type="text" value={config.address} onChange={e => set({ address: e.target.value })} className={inputCls} /></Field>
        <Field label="City"><input type="text" value={config.city} onChange={e => set({ city: e.target.value })} className={inputCls} /></Field>
        <Field label="State / region"><input type="text" value={config.region} onChange={e => set({ region: e.target.value })} placeholder="TX" className={inputCls} /></Field>
        <Field label="Postal code"><input type="text" value={config.postalCode} onChange={e => set({ postalCode: e.target.value })} className={inputCls} /></Field>
      </div>

      <div className="pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-ink-900">Social & footer links</h3>
          <button onClick={addLink} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <span className="text-lg leading-none">+</span> Add link
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">Instagram, Facebook, your Google Business Profile, etc. These also feed the business schema.</p>
        {config.socialLinks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No links yet.</p>
        ) : (
          <div className="space-y-3">
            {config.socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input type="text" value={link.label} onChange={e => setLink(i, 'label', e.target.value)} placeholder="Instagram" className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <input type="text" value={link.url} onChange={e => setLink(i, 'url', e.target.value)} placeholder="https://instagram.com/..." className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button onClick={() => removeLink(i)} aria-label="Remove" className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Small labeled-field wrapper ───────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
