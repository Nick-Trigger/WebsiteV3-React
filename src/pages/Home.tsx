import { Link } from 'react-router-dom';
import BaseLayout from '../components/BaseLayout';
import HorizontalCard from '../components/HorizontalCard';
import ExperienceCard from '../components/ExperienceCard';

const CircleArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    style={{ fill: 'currentColor' }}
  >
    <path d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zM10 7l6 5-6 5V7z" />
  </svg>
);

export default function Home() {
  return (
    <BaseLayout>
      <div className="pb-12 mt-5">
        <div className="text-xl py-1">Hey there 👋</div>
        <div className="text-5xl font-bold">I'm Nicholas Trigger</div>
        <div className="text-3xl py-3 font-bold">
          Duke BME Alum '26 | Medical Devices, Embedded Systems & Imaging
        </div>
        <div className="py-2">
          <span className="text-lg">
            Recent Duke Biomedical Engineering graduate with hands-on experience across medical
            device R&D, embedded systems, and clinical research. I love building things, from
            PCB-level hardware and firmware to bacterial testing protocols and FDA-compliant
            clinical workflows. Co-founder of P.A.T.S. Development, where our team built an
            arterial line training device in collaboration with Duke Med, backed by a $5K
            VentureWell grant and a provisional patent.
          </span>
        </div>
        <div className="mt-8">
          <a
            className="btn btn-outline btn-primary"
            href="mailto:nicholas.trigger@duke.edu"
            target="_blank"
            rel="noopener noreferrer"
          >
            Let's connect!
          </a>
          <Link to="/projects" className="btn ml-5">
            Portfolio
          </Link>
          <a
            href="https://www.linkedin.com/in/nick-trigger"
            target="_blank"
            rel="noopener noreferrer"
            className="btn ml-5"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/Nick-Trigger"
            target="_blank"
            rel="noopener noreferrer"
            className="btn ml-5"
          >
            GitHub
          </a>
        </div>
      </div>

      <div>
        <div className="text-3xl w-full font-bold mb-2">Some projects ⚙</div>
      </div>

      <HorizontalCard
        title="Arterial Line Placement Training Device"
        img="/alptprototype.jpg"
        desc="Easy to use and durable, this training device is designed with students in mind. (VentureWell Summer 2023 Cohort)(Patent Pending)"
        url="/projects/arm"
        badge="In Development"
      />
      <div className="divider my-0"></div>
      <HorizontalCard
        title="Open-Source Dog Activity Tracking Device"
        img="/savinggrace.jpg"
        desc="Led two teams to develop a tracking device for a 501(c)(3) non-kill dog shelter."
        url="/projects/dog"
        badge="EGR 101 TA F23"
      />
      <div className="divider my-0"></div>
      <HorizontalCard
        title="CLABSI Prevention Device"
        img="/clabfree.png"
        desc="Handheld UV-C disinfection device for central-line hubs. Custom KiCad PCBs, Zephyr RTOS firmware on nRF54L15, and hardware safety interlocks. People's Choice Award, Duke BME Capstone."
        url="/projects/clabsi"
        badge="Medical Device"
      />

      <div className="flex justify-center">
        <Link to="/projects" className="btn align-center">
          See All
          <CircleArrow />
        </Link>
      </div>

      <div>
        <div className="text-3xl w-full font-bold mb-5 mt-10">Experience</div>
      </div>

      <ExperienceCard
        title="R&D Research Engineer"
        employer="Reselute Medical"
        desc="Designed, validated, and implemented novel bacterial testing protocols to support product evaluation efforts. Conducted literature reviews and synthesized prior research to inform experimental design. Documented and analyzed experimental results to support iterative design decisions and technical reporting."
        img="/ReseluteLogo.webp"
        url="https://www.reselutemedical.com"
        target="_blank"
      />
      <div className="divider my-0"></div>
      <ExperienceCard
        title="Classroom R&D Engineer"
        employer="Duke University BME Department"
        desc="Designed, fabricated, and assembled electronic laboratory hardware for deployment across BME teaching labs. Developed a stimulus-responsive EKG simulator generating physiologically accurate signals for lab use. Validated hardware performance under extended use conditions to ensure durability and safety."
        img="/pratt.svg"
        url="https://bme.duke.edu"
        target="_blank"
      />
      <div className="divider my-0"></div>
      <ExperienceCard
        title="Clinical Research Associate"
        employer="Christus Spohn Health System - Shoreline"
        desc="Supported emergency medicine clinical studies through compliant data collection and EMR review. Collected and documented patient consent per IRB and FDA guidelines. Collaborated with physicians, residents, and research staff to support ongoing clinical investigations."
        img="/christuslogo.svg"
        url="https://www.christushealth.org/for-providers/academics/graduate-medical-education/residency-fellowship-programs/spohn-emergency-medicine-residency-program/curriculum#/"
        target="_blank"
      />
      <div className="flex justify-center space-x-5">
        <Link to="/cv" className="btn align-center">
          See CV
          <CircleArrow />
        </Link>
        <a
          href="https://duke.box.com/s/g4uf97sq9jq5zdsoe0rsb8g2djkvfpm2"
          className="btn align-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            style={{ fill: 'currentColor' }}
          >
            <path d="m12 16 4-5h-3V4h-2v7H8z"></path>
            <path d="M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z"></path>
          </svg>
        </a>
      </div>
    </BaseLayout>
  );
}
