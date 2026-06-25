import type { Category } from '@/lib/types'

// Seed categories used until the client customizes them in admin → Site Settings.
// Once saved/edited there, the live list comes from Firestore (siteConfig/taxonomy)
// via lib/categories.ts; this array is only the starting point / fallback.
//
// Never reuse or repurpose an existing `id` — FAQs reference it.
export const DEFAULT_CATEGORIES: Category[] = [
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
