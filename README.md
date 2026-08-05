# SkyNature

SkyNature is a responsive nature-stay discovery and booking experience for fictional eco homes, forest cabins, glamping tents, lakeside hideaways, treehouses, and mountain retreats.

The project is a client-side product demo: listings and reviews are local mock data, favourites persist in the browser, and booking requests are completed locally without a backend or payment.

## Features

- Editorial home page with destination search, stay categories, featured stays, destinations, trust points, guest notes, and clear calls to action.
- Explore catalogue with 24 typed stays, query search, multi-criteria filters, sorting, removable filter chips, pagination, skeleton loading, and an empty state.
- Filter and page state synchronized with `URLSearchParams`, including browser back/forward support.
- Responsive desktop filter sidebar and keyboard-accessible mobile filter drawer.
- Stay detail pages with a responsive gallery, amenities, activities, house information, reviews, related stays, and a sticky booking summary.
- Accessible booking modal with validation, live cost calculation, focus management, Escape handling, and a success state.
- Saved stays stored in `localStorage` through a dedicated Context and custom hook.
- Lazy-loaded routes, dynamic document titles, scroll restoration, error boundary, and a themed 404 page.
- Local WebP imagery only; there are no remote image or data dependencies.

## Stack

- React 19 and TypeScript
- Vite
- React Router
- SCSS Modules
- lucide-react
- Vitest, React Testing Library, and jest-dom

## Project structure

```text
src/
├── assets/       Local fonts and optimized WebP imagery
├── components/   Reusable interface and behaviour components
├── context/      Favourites state provider
├── data/         Typed local stay catalogue
├── hooks/        Shared React hooks
├── layouts/      AppLayout with shared header and footer
├── pages/        Home, Explore, Stay, Saved, and NotFound routes
├── styles/       Global reset, tokens, and shared design primitives
├── test/         Global test setup
├── types/        Domain types
└── utils/        Filtering, sorting, and formatting helpers
```

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run test:watch
npm run preview
```

## Routes

- `/` — home
- `/explore` — searchable and filterable catalogue
- `/stays/:slug` — stay details and booking request
- `/saved` — locally saved stays
- `*` — 404 fallback

## Deployment

`vercel.json` rewrites requests to `index.html`, so client-side routes can be opened directly on Vercel.

## Testing

The suite covers the pure filtering/sorting pipeline, favourites persistence and recovery, and the booking form validation, pricing, and success flow.
