// Topic taxonomy — the PRIMARY way FAQs are grouped and browsed. This is a small,
// stable list that changes rarely, so it lives in config (not Firestore). Each FAQ
// stores a category `id`; everything else (title, description, ordering, the
// /category/<slug> page) is driven from here.
//
// To add a topic: append an entry. To rename a topic shown on the site: edit `name`
// /`description`. Never change an `id` once FAQs reference it.

export interface Category {
  id: string            // stable key stored on each FAQ (never changes)
  slug: string          // SEO URL segment for /category/<slug>
  name: string          // display name
  description: string   // shown on the category page + home section
  emoji: string         // small visual marker (purely decorative)
}

export const CATEGORIES: Category[] = [
  {
    id: 'booking',
    slug: 'booking-a-party',
    name: 'Booking a Party',
    description: 'How to reserve a date, check availability, hold a deposit, and lock in your party.',
    emoji: '📅',
  },
  {
    id: 'payments',
    slug: 'payments-and-deposits',
    name: 'Payments & Deposits',
    description: 'Deposits, balances, accepted payment methods, refunds, and how billing works.',
    emoji: '💳',
  },
  {
    id: 'party-types',
    slug: 'party-types-and-packages',
    name: 'Party Types & Packages',
    description: 'Birthday parties, rentals, themes, add-ons, and what each package includes.',
    emoji: '🎉',
  },
  {
    id: 'setup-delivery',
    slug: 'setup-and-delivery',
    name: 'Setup & Delivery',
    description: 'Delivery windows, setup and teardown, space requirements, and timing.',
    emoji: '🚚',
  },
  {
    id: 'policies',
    slug: 'policies-and-safety',
    name: 'Policies & Safety',
    description: 'Cancellations, weather, damage, safety rules, and the fine print.',
    emoji: '🛡️',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c])) as Record<string, Category>
export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map(c => [c.slug, c])) as Record<string, Category>

export function getCategoryById(id: string): Category | undefined {
  return CATEGORY_BY_ID[id]
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORY_BY_SLUG[slug]
}
