import BaseLayout from '../components/BaseLayout';
import HorizontalCard from '../components/HorizontalCard';
import GameThumbnail from '../components/GameThumbnail';
import FeaturedProjects from '../components/FeaturedProjects'

export default function Projects() {
  return (
    <BaseLayout title="Nicholas Trigger - Projects">
      <div>
        <div className="text-3xl w-full font-bold mb-5">Featured Projects</div>
      </div>

      <FeaturedProjects />

      <div>
        <div className="text-3xl w-full font-bold mb-5 mt-10">All Projects</div>
      </div>

      <HorizontalCard
        title="Factory Scheduling & KPI Reporting API"
        img="/schedule_factory.png"
        desc="A constraint-based production scheduling service built on OR-Tools CP-SAT. Accepts a job-shop problem as JSON, returns a tardiness-minimizing schedule with KPIs, and visualizes it via a React + TypeScript Gantt frontend. FastAPI backend with a pluggable adapter/objective/constraint architecture."
        url="/projects/factory-scheduler"
        badge="Full-Stack"
      />
      <div className="divider my-0"></div>
      <HorizontalCard
        title="ECG Synthesizer (ECG_SYN)"
        img="/ecgtimings.png"
        desc="An ESP32-based ECG synthesizer that generates physiologically accurate cardiac waveforms. Built with C++ and PlatformIO for embedded biomedical signal generation, based on the same EKG simulator used in Duke's BME teaching labs."
        url="/projects/ecg"
        badge="Embedded Systems"
      />
      <div className="divider my-0"></div>
      <HorizontalCard
        title="BME 354 Multi-Chip IC Tester"
        img="/chiptester354.png"
        desc="A multi-chip integrated circuit tester designed for BME 354 coursework at Duke. Features a custom KiCad PCB layout for validating multiple ICs in sequence."
        url="/projects/chip-tester"
        badge="Hardware"
      />
      <div className="divider my-0"></div>
      <HorizontalCard
        title="PET/CT Brain Phantom Simulator"
        img="/phantomsim.png"
        desc="A physics-based PET/CT brain phantom simulator implementing phantom generation, CT simulation, and PET simulation pipelines. Built with Python and Jupyter Notebook for medical imaging education and research."
        url="/projects/pet-ct-sim"
        badge="Medical Imaging"
      />
      <div className="divider my-0"></div>
      <HorizontalCard
        title="Dog Activity Trackers"
        img="/savinggrace.jpg"
        desc="Consulting TA for two Duke EGR 101 Foundry teams building wearable GPS and accelerometer trackers for foster dogs at Saving Grace Animal Shelter."
        url="/projects/dog"
        badge="Consulting / TA"
      />
      <div className="divider my-0"></div>
      <HorizontalCard
        title="Duke Club Ski & Board Sign"
        img="/skirender1.png"
        desc="Portable LED sign designed for Duke Club Ski & Board. Designed to be durable and travel-friendly for ski trips."
        url="#"
      />
      <div className="divider my-0"></div>
      <HorizontalCard
        title="This Website"
        img="/favicon.svg"
        desc="This one. It is built with React, Vite, and Tailwind CSS, statically prerendered for GitHub Pages."
        url="https://github.com/Nick-Trigger/Websites"
        target="_blank"
      />
    </BaseLayout>
  );
}