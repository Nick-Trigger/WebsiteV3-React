# nicholastrigger.com

The personal portfolio of Nicholas Trigger, a Duke BME Alum '26 focused on biomedical device engineering, embedded systems, and medical imaging. Live at [nicholastrigger.com](https://nicholastrigger.com).

[![Deploy to GitHub Pages](https://github.com/Nick-Trigger/WebsiteV3-React/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nick-Trigger/WebsiteV3-React/actions/workflows/deploy.yml)

---

## What it is

A small, content-focused portfolio: a landing page with a bio and featured work, a full projects listing, detailed write-ups for each engineering project (UV-C disinfection device, arterial-line trainer, dog activity trackers, ECG synthesizer, and more), and a long-form CV. Several projects also embed supporting PDFs (design history files, posters, and grant applications) viewed inline.

## How it's built

The site is a **React single-page app that is statically prerendered to HTML at build time**. This pairing is deliberate. It reads and navigates like a fast React app in the browser, but every route also ships as a real, fully-rendered HTML file. That keeps the pages crawlable for search engines, gives proper social-share previews, and lets deep links work directly on GitHub Pages, none of which a plain client-rendered SPA gets for free.

- **React 19 + TypeScript** for the UI.
- **Vite** for bundling and the dev server.
- **vite-react-ssg** prerenders each route in the route table into static HTML, then hydrates it into an interactive app on the client.
- **React Router** drives client-side navigation between the prerendered pages.
- **Tailwind CSS v4 + DaisyUI** for styling and components, with the typography plugin handling the long-form `prose` content on project pages.
- Images in `public/` are optimized at build time (sharp + svgo); a sitemap and a Pages-friendly `404.html` are emitted as a post-build step.
- It ships automatically to **GitHub Pages** on every push to `main`, served from the custom domain configured via `public/CNAME`.

## How it's organized

```text
public/             Static assets: images, PDFs, 3D viewers, favicon, CNAME, robots.txt
index.html          The HTML shell, including a pre-paint theme script (no flash of wrong theme)
src/
  routes.tsx        The route table, the single source of truth for which pages exist
  main.tsx          App entry; vite-react-ssg builds the router from routes.tsx
  config.ts         Site-wide metadata (title, description, author, URL)
  pages/            One component per page (Home, Projects, CV, 404, and each project)
  components/        Shared building blocks (see below)
  styles/global.css  Tailwind/DaisyUI imports plus a few custom rules
scripts/            Build-time helpers (favicon generation, sitemap + 404 emission)
```

The structure leans on a few shared pieces that most pages compose:

- **`BaseLayout`** is the page shell: sidebar, mobile header, footer, theme handling, scroll-to-top on navigation, and the page-transition animation. The sidebar persists across navigations; only the main content animates and resets scroll.
- **`ProjectLayout`** is the template for project write-ups. A page passes in metadata (title, hero image or image carousel, tags, badge, GitHub link, related documents) and its body content; the layout renders a consistent hero, prose area, and a "Project Documents" grid.
- **`PdfViewerPage`** is a focused full-width layout for the inline PDF pages (posters, design files, applications).
- Smaller components round it out: the cards on the listing pages, the CV timeline, the theme toggle, the image carousel, and a link helper that routes internal navigation through React Router while leaving external and file links as plain anchors.

Project pages are authored as plain React components rather than a separate content format, so the same JSX, components, and type-checking apply everywhere on the site.

## A note on history

This site began life as an Astro project and was rebuilt on the React and Vite stack described above, preserving the visual design and content while moving to a single React-based authoring model.
