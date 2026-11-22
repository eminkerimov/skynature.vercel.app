# SkyNature

SkyNature is a responsive nature-stay discovery and booking experience for fictional eco homes, forest cabins, glamping tents, lakeside hideaways, treehouses, and mountain retreats.

The project is a client-side product demo. Listings, reviews, editorial content, settings, and image URLs come from one public JSON file on Cloudflare Pages. Favourites persist in the browser, and booking requests are completed locally without a backend or payment.

## Features

- Editorial home page with destination search, stay categories, featured stays, destinations, trust points, guest notes, and clear calls to action.
- About page with contrasting light/dark sections, animated photo panels linked to stay types, catalogue counts, and a responsive photo-and-text grid.
- Explore catalogue with 30 typed stays, query search, multi-criteria filters, sorting, removable filter chips, pagination, and an empty state.
- Filter and page state synchronized with `URLSearchParams`, including browser back/forward support.
- Responsive desktop filter sidebar and keyboard-accessible mobile filter drawer.
- Stay detail pages with a five-photo gallery, mobile swipe, fullscreen keyboard/touch navigation, amenities, reviews, related stays, and a mobile booking bar.
- Accessible booking modal with validation, live cost calculation, focus management, Escape handling, and a success state.
- Saved stays stored in `localStorage` through a dedicated Context and custom hook.
- Guest-capacity filtering and dates/guest counts carried from search into the booking form through the URL.
- Compare up to three stays using a searchable picker in the floating selection bar or comparison page, with persistent selection and a price/amenity/policy table.
- Animated save controls and a confirmation notification with Undo.
- Lazy-loaded routes, dynamic document titles, scroll restoration, error boundary, and a themed 404 page.
- One shared request for project data, an in-memory cache across routes, response validation, a loading state, and retry after errors.
- Five WebP photographs per stay and four landscape images served from Cloudflare Pages.

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
├── assets/fonts/ Local font files
├── components/   Reusable interface and behaviour components
├── context/      Project data, favourites, comparison, and notifications
├── hooks/        Shared React hooks
├── layouts/      AppLayout with shared header and footer
├── pages/        Home, Explore, Stay, Saved, Compare, About, and NotFound routes
├── services/     Shared JSON request, cache, and response validation
├── styles/       Global reset, tokens, and shared design primitives
├── test/         Test setup, shared data provider, and fixtures
│   └── fixtures/project-data.json  Project-data fixture for tests
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
- `/compare` — compare up to three selected stays
- `/about` — the idea behind SkyNature and how to choose a stay
- `*` — 404 fallback

## Deployment

Build the frontend with `npm run build` and publish the contents of `dist` to the existing Cloudflare Workers & Pages frontend project. The separate `dbem` Pages project hosts public content:

```text
skynature/
  data.json
  images/
    forest-river.webp
    stay-01-cover.webp
    stay-01-detail-01.webp
    ...
```

The app reads `https://dbem.pages.dev/skynature/data.json` once per app session, including React StrictMode. Navigating between pages uses the same cached object. A fresh page load revalidates the JSON with the server. Images load from the URLs in that JSON.

To change public content, update `data.json` or the images and publish the complete local `dbem` folder using the existing manual Pages upload workflow. Frontend code does not need rebuilding for these content updates; visitors receive them after reloading the page. Keep the deployed paths rooted at `/skynature`, and preserve other projects in the upload.

An Internet connection is required for local development as well. If the JSON cannot be loaded or has an incompatible format, the app shows a retry action.

## Testing

The suite covers request deduplication and caching, retries and timeouts, response validation, route navigation using one request, URL filter persistence, guest capacity, date/guest handoff into booking, JSON-driven home content, favourites and Undo, comparison limits/persistence, gallery navigation/focus, and booking validation, pricing, and keyboard entry without losing focus.

Only saved-stay IDs and comparison IDs persist in browser storage. Search dates and guest counts travel in the URL. Availability is not checked against a booking service; submitting the booking form remains a local demo.

Tests use the isolated fixture `src/test/fixtures/project-data.json`. The production app does not import this fixture.
