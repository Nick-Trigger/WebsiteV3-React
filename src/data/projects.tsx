import type { ComponentType } from 'react';
import GameThumbnail from '../components/GameThumbnail';
import { PythonLogo, JavaScriptLogo } from '../components/LanguageLogo';

const PlaygroundThumbnail = () => (
  <div className="flex items-center justify-center gap-5 w-full h-full bg-base-200">
    <PythonLogo className="w-14 h-14" />
    <JavaScriptLogo className="w-14 h-14" />
  </div>
);

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
  target?: string;
}

/**
 * The single source of truth for the projects listings. Featured entries show
 * on the home page and get a star; the projects page lists everything with
 * tag filtering. Project detail routes still live in src/routes.tsx.
 */
export const projects: Project[] = [
  {
    title: 'Browser Games',
    Media: GameThumbnail,
    desc: 'A small collection of playable browser games built as self-contained React components.',
    url: '/projects/games',
    tags: ['Interactive', 'React'],
    featured: true,
  },
  {
    title: 'Code Playgrounds',
    Media: PlaygroundThumbnail,
    desc: 'Write and run Python, JavaScript, C, C++, and Rust from the browser. Python and JavaScript execute in sandboxed WebAssembly VMs in a Web Worker; compiled languages run on a remote sandbox service.',
    url: '/projects/playgrounds',
    tags: ['Interactive', 'React', 'Python'],
    featured: true,
  },
  {
    title: 'Radial Arterial Line Placement Simulation Device',
    img: '/PulseMateLogo-01.svg',
    desc: 'Easy to use and durable, this training device is designed with students and medical professionals in mind.',
    url: '/projects/arm',
    badges: ['Patent Pending', 'VentureWell Summer 2023 Cohort'],
    tags: ['Medical Device', 'CAD', 'Hardware', 'Embedded'],
    featured: true,
  },
  {
    title: 'CLABSI Prevention Device',
    img: '/clabfree.png',
    desc: 'A handheld medical device designed to disinfect central line hubs and prevent Central Line Associated Bloodstream Infections (CLABSI) in clinical settings. Features embedded C firmware, custom KiCad PCB design, and CAD-modeled enclosure.',
    url: '/projects/clabsi',
    tags: ['Medical Device', 'Hardware', 'Embedded', 'CAD', 'C/C++', 'RTOS'],
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
