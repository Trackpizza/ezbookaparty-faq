# EZ Book A Party — FAQ & Video Library (`faq.ezbookaparty.com`)

A fast, SEO-strong FAQ/video library on **Next.js 14 (App Router) + Firebase App Hosting**.
Built on the local-business site blueprint (`C:/ERIC/APPS/BUILD-PLAYBOOK.md`), with one key
divergence: **content is a Firestore collection managed from an admin form**, not a config file —
because this site grows ~30 videos/month into hundreds of pages.

## Mental model

- **One question = one page = one URL.** Each FAQ (`/faq/<slug>`) is a video + short answer +
  bullets + full transcript, targeting that question's search query. Pages are **generated from
  data**, so adding a question is a form submission, not a code change.
- **Topics are the primary taxonomy.** `config/categories.ts` defines a small, stable list
  (Booking, Payments, Party Types, Setup/Delivery, Policies). Each FAQ stores a category `id`.
- **Two browse views** on the home page: *By Topic* (category sections) and *Latest* (chronological
  feed). Plus on-page fuzzy **search** (Fuse.js) over question + description + keywords.
- **No iframes in listings.** Cards show a YouTube *thumbnail* linking to the page; the single
  playable iframe lives only on the detail page. So page count is free — performance is per-page.

## Content model

- Firestore collection **`faqs`** — one doc per question (`lib/types.ts` → `Faq`). Doc id is an
  auto id; `slug` is a field (editable without breaking the doc).
- Single doc **`siteConfig/config`** — business NAP + footer/social links (`SiteConfig`).
- Reads: `lib/faqs.ts` (fetches the whole small collection once, filters/sorts in memory — no
  Firestore composite indexes to set up) and `lib/config.ts` (merges over `DEFAULT_CONFIG`).

## Admin (`/admin`)

Password-gated (`ADMIN_PASSWORD`, token in `sessionStorage` → `x-admin-token`). Two tabs:

- **Questions** — list + **Add/Edit** form (question, auto slug, category, summary, YouTube URL,
  upload date, key points, full transcript/Markdown, search keywords, hidden). Create/update/delete
  via `/api/admin/faqs`.
- **Site Settings** — business facts + social links via `/api/admin/config`.

Every write fires `/api/revalidate` (`revalidatePath('/', 'layout')`) so changes appear immediately.

## SEO kit

- `app/sitemap.ts` — generated from Firestore + categories. **Submit once**; Google re-crawls.
- `app/robots.ts` — allow all, disallow `/admin`.
- `lib/schema.ts` — `LocalBusiness` (home), `FAQPage` + `VideoObject` (each FAQ page).
  `VideoObject.uploadDate` is **required** by Google — the admin auto-stamps today when a video URL
  is added.
- Fonts self-hosted via `next/font` (Fredoka display + Nunito body).

## Local dev

```bash
cp .env.local.example .env.local   # fill in ADMIN_PASSWORD + the 3 FIREBASE_* values
npm run dev                        # http://localhost:3000
npx tsc --noEmit && npm run build  # typecheck + production build
```

Without Firebase creds the site renders its empty state (no crash) — populated content needs the
project below.

## Firebase + deploy (per BUILD-PLAYBOOK §9–12)

1. New standalone Firebase project (Blaze), Firestore `(default)` DB.
2. App Hosting backend → connect this repo + `main`, Node 22.
3. Secrets (Secret Manager, bound in `apphosting.yaml`): `FIREBASE_PROJECT_ID`,
   `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY_BASE64`, `ADMIN_PASSWORD`. Set the public
   `NEXT_PUBLIC_APP_URL` value to the live URL (then the custom domain).
4. Deploy: `firebase apphosting:rollouts:create <backend> --git-branch main --force --project <project>`
   (App Hosting does not auto-deploy on push — trigger the rollout). Then poll the live URL.
5. Custom domain `faq.ezbookaparty.com` → App Hosting → Domains → add subdomain → DNS records.

## Search Console

`ezbookaparty.com` is already a Search property. If it's a DNS-verified **Domain** property, the
subdomain is covered — submit `https://faq.ezbookaparty.com/sitemap.xml`. If it's **URL-prefix**,
add a separate property for `faq.` first.
