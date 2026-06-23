# nicholastrigger.com

Personal portfolio site for Nicholas Trigger — Duke BME Alum '26, focusing on biomedical device engineering.

Live at [nicholastrigger.com](https://nicholastrigger.com) [![Deployment](https://github.com/Nick-Trigger/website2/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nick-Trigger/website2/actions/workflows/deploy.yml)

---

## Stack

- **[React 19](https://react.dev)** — component-based UI
- **[Vite 6](https://vitejs.dev)** — dev server and bundler
- **[vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg)** — static prerendering; every route is emitted as real HTML for SEO, social previews, and deep-linkable URLs on GitHub Pages
- **[React Router 6](https://reactrouter.com)** — client-side routing
- **[Tailwind CSS v4](https://tailwindcss.com)** + **[DaisyUI v5](https://daisyui.com)** — styling and components
- **[@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)** — `prose` rendering for project content

---

## Project Structure

```text
/
├── public/                  # Static assets (images, PDFs, 3D viewers, ibom.html, CNAME, robots.txt)
├── index.html               # HTML shell + no-flash theme init script
├── scripts/
│   └── postbuild.mjs        # Generates sitemap.xml and the GitHub Pages 404.html
├── src/
│   ├── main.tsx             # vite-react-ssg entry (builds router from routes.tsx)
│   ├── routes.tsx           # Route table (one entry per page, all prerendered)
│   ├── config.ts            # Site-wide metadata (title, description, URL)
│   ├── components/          # BaseLayout, Sidebar, Header, Footer, cards, Carousel,
│   │                        #   ProjectLayout, PdfViewerPage, ThemeToggle, Seo, SmartLink
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Projects.tsx
│   │   ├── Cv.tsx
│   │   ├── NotFound.tsx
│   │   └── projects/        # One TSX component per project detail page
│   └── styles/
│       └── global.css       # Tailwind + DaisyUI + typography imports
├── .github/workflows/deploy.yml   # GitHub Actions: build & deploy to GitHub Pages
└── package.json
```

---

## Pages

| Route | Description |
| ----- | ----------- |
| `/` | Home — bio, featured projects, experience |
| `/projects` | Full projects listing |
| `/projects/arm` | Arterial Line Placement Training Device |
| `/projects/arm/application` | VentureWell application (PDF viewer) |
| `/projects/clabsi` | CLABSI UV-C Disinfection Device |
| `/projects/clabsi/dhf` | CLABSI Design History File (PDF viewer) |
| `/projects/clabsi/poster` | CLABSI capstone poster (PDF viewer) |
| `/projects/dog` | Dog Activity Tracker (TA/consulting role) |
| `/projects/dog/posters` | Tabbed poster viewer for both Foundry teams |
| `/projects/chip-tester` | BME 354 Multi-Chip IC Tester |
| `/projects/ecg` | ECG Synthesizer |
| `/projects/factory-scheduler` | Factory Scheduling & KPI Reporting API |
| `/projects/pet-ct-sim` | PET/CT Brain Phantom Simulator |
| `/cv` | CV / resume |
| `/clabsi-ibom.html` | Interactive KiCad BOM (served as static HTML) |

---

## Adding a Project

1. Create `src/pages/projects/<Name>.tsx`. For a standard write-up, render the
   `ProjectLayout` component and pass `title`, `description`, `heroImage`
   (string or array → single image or auto-carousel), `badge`, `tags`,
   `githubUrl`, and `docs`. Put the body content as children using normal JSX
   (`<h2>`, `<p>`, `<table>`, …) — it's wrapped in `prose` styles automatically.
   For a PDF-only page, render `PdfViewerPage` instead.
2. Register the route in `src/routes.tsx`.
3. Add the path to the `paths` array in `scripts/postbuild.mjs` so it lands in the sitemap.
4. Add a `HorizontalCard` entry in `src/pages/Projects.tsx`.
5. Drop any static assets (images, PDFs, 3D viewers) into `public/`.

---

## Commands

| Command | Action |
| ------- | ------ |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server |
| `npm run build` | Prerender to `./dist/` and run the postbuild (sitemap + 404.html) |
| `npm run preview` | Preview the production build locally |

---

## Deployment

The site deploys automatically to **GitHub Pages** on every push to `main` via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the
project and publishes `./dist/`. The custom domain `www.nicholastrigger.com` is
configured via [`public/CNAME`](public/CNAME).
