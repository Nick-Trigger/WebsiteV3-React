import type { ComponentType } from 'react';
import GameThumbnail from '../components/GameThumbnail';
import { PythonLogo, JavaScriptLogo } from '../components/LanguageLogo';

const PlaygroundThumbnail = () => (
  <div className="flex items-center justify-center gap-5 w-full h-full bg-base-200">
    <PythonLogo className="w-14 h-14" />
    <JavaScriptLogo className="w-14 h-14" />
  </div>
);

const QrCodeThumbnail = () => (
  <div className="flex items-center justify-center w-full h-full bg-base-200">
    <svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor" aria-hidden="true">
      <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-2h2v2h-2v-2z" />
    </svg>
  </div>
);

export interface Subproject {
  title: string;
  url: string;
  /** Starred within the parent card only; doesn't put the parent on the home page. */
  featured?: boolean;
}

export interface Project {
  title: string;
  desc: string;
  url: string;
  /** Static thumbnail image (ignored if Media is set). */
  img?: string;
  /** Custom thumbnail component, e.g. the live game preview. */
  Media?: ComponentType;
  /** A single badge; use `badges` for several. */
  badge?: string;
  badges?: string[];
  /** Labels used by the tag filter on the projects page. */
  tags?: string[];
  /** Featured projects are starred and also shown on the home page. */
  featured?: boolean;
  /** Hand-picked children listed by name (no image) on the card. */
  subprojects?: Subproject[];
  target?: string;
}

/**
 * The single source of truth for the projects listings. Featured entries show
 * on the home page and get a star; the projects page lists everything with
 * tag filtering. Project detail routes still live in src/routes.tsx.
 */
export const projects: Project[] = [
    {
    title: 'Radial Arterial Line Placement Simulation Device',
    img: '/3_2FRender.jpg',
    desc: 'Easy to use and durable, this training device is designed with students and medical professionals in mind.',
    url: '/projects/arm',
    badges: ['Patent Pending', 'VentureWell Summer 2023 Cohort'],
    tags: ['Medical Device', 'CAD', 'Hardware', 'Embedded'],
    featured: true,
  },
    {
    title: 'Central Line Hub Disinfection Device',
    img: '/clabfree.png',
    desc: 'A handheld medical device designed to disinfect central line hubs and prevent Central Line Associated Bloodstream Infections (CLABSI) in clinical settings. Features embedded C firmware, custom KiCad PCB design, and CAD-modeled enclosure.',
    url: '/projects/clabsi',
    tags: ['Medical Device', 'Hardware', 'Embedded', 'CAD', 'C/C++', 'RTOS', 'Linux'],
    featured: true,
  },
  {
    title: 'Browser Games',
    Media: GameThumbnail,
    desc: 'A small collection of playable browser games built as self-contained React components.',
    url: '/projects/games',
    tags: ['Interactive', 'React'],
    featured: false,
    subprojects: [{ title: 'UFO Invasion Pinball', url: '/projects/games/pinball', featured: true }],
  },
  {
    title: 'Code Playgrounds',
    Media: PlaygroundThumbnail,
    desc: 'Write and run Python, JavaScript, C, C++, and Rust from the browser. Python and JavaScript execute in sandboxed WebAssembly VMs in a Web Worker; compiled languages run on a remote sandbox service.',
    url: '/projects/playgrounds',
    tags: ['Interactive', 'React', 'Python'],
    featured: false,
  },
  {
    title: 'QR Code Generator',
    Media: QrCodeThumbnail,
    desc: 'A tool to generate custom-styled QR codes',
    url: '/projects/qr-code-generator',
    tags: ['NEW', 'Interactive', 'React'],
    featured: true,
  },
  {
    title: 'Web Planner',
    desc: 'A personal planning app with an interactive calendar, task management with priorities, auto-saving daily notes, and US holiday integration. FastAPI + SQLAlchemy backend, React 19 + TypeScript frontend, PostgreSQL in Docker.',
    url: '/projects/web-planner',
    tags: ['Full-Stack', 'Python', 'React'],
  },
  {
    title: 'FastAPI + React Starter Template',
    desc: 'A batteries-included starter template for full-stack web apps: FastAPI backend with SQLAlchemy and Alembic migrations, React 19 + TypeScript frontend, Dockerized PostgreSQL, and a one-command dev workflow.',
    url: '/projects/fastapi-react-starter',
    tags: ['Full-Stack', 'Python', 'React'],
  },
  {
    title: 'Factory Scheduling & KPI Reporting API',
    img: '/schedule_factory.png',
    desc: 'A constraint-based production scheduling service built on OR-Tools CP-SAT. Accepts a job-shop problem as JSON, returns a tardiness-minimizing schedule with KPIs, and visualizes it via a React + TypeScript Gantt frontend. FastAPI backend with a pluggable adapter/objective/constraint architecture.',
    url: '/projects/factory-scheduler',
    tags: ['Full-Stack', 'Python', 'React'],
  },
  {
    title: 'ECG Synthesizer (ECG_SYN)',
    img: '/ecgtimings.png',
    desc: "An ESP32-based ECG synthesizer that generates physiologically accurate cardiac waveforms. Built with C++ and PlatformIO for embedded biomedical signal generation, based on the same EKG simulator used in Duke's BME teaching labs.",
    url: '/projects/ecg',
    tags: ['Embedded', 'Hardware', 'C/C++', 'RTOS'],
  },
  {
    title: 'BME 354 Multi-Chip IC Tester',
    img: '/chiptester354.png',
    desc: 'A multi-chip integrated circuit tester designed for BME 354 coursework at Duke. Features a custom KiCad PCB layout for validating multiple ICs in sequence.',
    url: '/projects/chip-tester',
    tags: ['Hardware', 'Analog Circuit Design'],
  },
  {
    title: 'PET/CT Brain Phantom Simulator',
    img: '/phantomsim.png',
    desc: 'A physics-based PET/CT brain phantom simulator implementing phantom generation, CT simulation, and PET simulation pipelines. Built with Python and Jupyter Notebook for medical imaging education and research.',
    url: '/projects/pet-ct-sim',
    tags: ['Medical Imaging', 'Python', 'Interactive'],
  },
  {
    title: 'Dog Activity Trackers',
    img: '/savinggrace.jpg',
    desc: 'Consulting TA for two Duke EGR 101 Foundry teams building wearable GPS and accelerometer trackers for foster dogs at Saving Grace Animal Shelter.',
    url: '/projects/dog',
    tags: ['Hardware', 'Embedded'],
  },
  {
    title: 'Duke Club Ski & Board Sign',
    img: '/skirender1.png',
    desc: 'Portable LED sign designed for Duke Club Ski & Board. Designed to be durable and travel-friendly for ski trips.',
    url: '#',
    tags: ['Hardware', 'CAD'],
  },
  {
    title: 'This Website',
    img: '/favicon.svg',
    desc: 'This one. It is built with React, Vite, and Tailwind CSS, statically prerendered for GitHub Pages.',
    url: 'https://github.com/Nick-Trigger/Websites',
    target: '_blank',
    tags: ['React'],
  },
];
