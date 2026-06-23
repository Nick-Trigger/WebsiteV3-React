# nicholastrigger.com

Personal portfolio site for Nicholas Trigger — Duke BME Alum '26, focusing on biomedical device engineering.

Live at [nicholastrigger.com](https://nicholastrigger.com) [![Deployment](https://github.com/Nick-Trigger/website2/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nick-Trigger/website2/actions/workflows/deploy.yml)

---

## Stack

- **[Astro 5](https://astro.build)** — static site framework with file-based routing
- **[Tailwind CSS v4](https://tailwindcss.com)** + **[DaisyUI v5](https://daisyui.com)** — styling and components
- **[MDX](https://mdxjs.com)** — markdown + JSX for rich project pages
- **[React 19](https://react.dev)** — interactive components via Astro islands
- **[@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)** — prose rendering for markdown content
- **[Zod](https://zod.dev)** — frontmatter schema validation for content collections

---

## Project Structure

```text
/
├── public/                  # Static assets (images, PDFs, 3D viewers, ibom.html)
├── src/
│   ├── components/          # HorizontalCard, Header, SideBar, Footer, ExperenceCard, etc.
│   ├── content/
│   │   ├── config.ts            # Zod schemas for blog & store collections
│   │   ├── blog/                # Blog post markdown files
│   │   └── store/               # Store item markdown files
│   ├── layouts/
│   │   ├── BaseLayout.astro     # Root shell (sidebar, header, footer)
│   │   ├── ProjectLayout.astro  # Reusable project detail page template
│   │   ├── PostLayout.astro     # Blog post layout
│   │   └── StoreItemLayout.astro
│   ├── pages/
│   │   ├── index.astro          # Home / landing page
│   │   ├── projects.astro       # Projects listing
│   │   ├── cv.astro             # CV page
│   │   ├── 404.astro
│   │   └── projects/
│   │       ├── arm.astro            # Arterial Line Training Device
│   │       ├── clabsi/
│   │       │   ├── index.mdx        # CLABSI project detail page
│   │       │   └── poster.astro     # Capstone poster viewer
│   │       └── dog/
│   │           ├── index.mdx        # Dog activity tracker detail page
│   │           └── posters.astro    # Tabbed poster viewer (2 teams)
│   ├── styles/
│   │   └── global.css
│   └── config.ts            # Site-wide metadata (title, description, socials)
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions: build & deploy to GitHub Pages
└── package.json
```

---

## Pages

| Route | Description |
| ----- | ----------- |
| `/` | Home — bio, featured projects, experience |
| `/projects` | Full projects listing |
| `/projects/arm` | Arterial Line Placement Training Device |
| `/projects/clabsi` | CLABSI UV-C Disinfection Device |
| `/projects/clabsi/poster` | CLABSI capstone poster viewer |
| `/projects/dog` | Dog Activity Tracker (TA/consulting role) |
| `/projects/dog/posters` | Tabbed poster viewer for both Foundry teams |
| `/cv` | CV / resume |
| `/clabsi-ibom.html` | Interactive KiCad BOM (served as static HTML) |

---

## ProjectLayout Template

`ProjectLayout.astro` is a reusable layout for project detail pages. Use it from an `.mdx` file via frontmatter:

```yaml
---
layout: ../../layouts/ProjectLayout.astro
title: "My Project"
description: "One-line description."
heroImage: "/image.png"
badge: "Category"
tags:
  - Tag1
  - Tag2
githubUrl: "https://github.com/Nick-Trigger/repo"
docs:
  - title: "Document Name"
    url: "/path/or/url"
    description: "Short description"
---
```

The slot content (markdown body) is rendered with `prose` typography styles.

---

## Adding a Project

1. Create `src/pages/projects/<slug>/index.mdx` using the frontmatter schema above.
2. Add an entry to the grid in `src/pages/projects.astro`.
3. Drop any static assets (images, PDFs, 3D viewers) into `public/`.

---

## Commands

| Command | Action |
| ------- | ------ |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` (needs the PlantUML server running — see below) |
| `npm run build:local` | Start the PlantUML server, build, then stop it |
| `npm run preview` | Preview production build locally |
| `npm run diagrams:up` | Start the local PlantUML server (Docker) |
| `npm run diagrams:down` | Stop the local PlantUML server |

---

## Diagrams (PlantUML)

State diagrams and other PlantUML figures are rendered by a **self-hosted**
PlantUML server at **build time** and inlined into the page as SVG. The published
site makes no third-party calls and needs no server at runtime — the diagram is
baked into the static output.

Use the [`PlantUML`](src/components/PlantUML.astro) component from any `.mdx` page:

```mdx
import PlantUML from "../../../components/PlantUML.astro";

<PlantUML alt="My state machine" code={`
@startuml
[*] --> IDLE
IDLE --> RUNNING : start
RUNNING --> IDLE : stop
@enduml
`} />
```

The renderer runs in Docker via [`docker-compose.yml`](docker-compose.yml):

```bash
npm run diagrams:up     # start the PlantUML server (localhost:8080)
npm run build           # render + inline diagrams, output to ./dist/
npm run diagrams:down   # stop the server
# or do all three at once:
npm run build:local
```

Override the server host with the `PLANTUML_SERVER` env var or the component's
`server` prop. In CI, the [deploy workflow](.github/workflows/deploy.yml) runs the
same image as a service container, so deployments render diagrams the same way.
A production build **fails** if the server is unreachable (rather than shipping a
missing diagram); `npm run dev` instead shows a placeholder so the page still loads.

---

## Deployment

The site deploys automatically to **GitHub Pages** on every push to `main` via `.github/workflows/deploy.yml`. The custom domain `www.nicholastrigger.com` is configured via `public/CNAME`.

To deploy manually:

```bash
npm run build   # outputs to ./dist/
```

Then push `./dist/` to the `gh-pages` branch, or let the workflow handle it.
