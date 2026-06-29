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
          Biomedical Engineer
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
        <div className="mt-8 flex w-full gap-2">
          <a
            className="btn btn-outline btn-primary align-center"
            href="mailto:nicktrig124@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Let's Connect!
          </a>
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
          <a
            className="btn align-center"
            href="./projects"
            target="_blank"
            rel="noopener noreferrer"
          >
            Portfolio
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ fill: 'currentColor' }}
            >
              <path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" d="M2.75 8.623v7.379a4 4 0 0 0 4 4h10.5a4 4 0 0 0 4-4v-5.69a4 4 0 0 0-4-4H12M2.75 8.624V6.998a3 3 0 0 1 3-3h2.9a2.5 2.5 0 0 1 1.768.732L12 6.313m-9.25 2.31h5.904a2.5 2.5 0 0 0 1.768-.732L12 6.313"></path>
            </svg>
          </a>
          <a
            className="btn align-center"
            href="https://www.linkedin.com/in/nick-trigger"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ fill: 'currentColor' }}
            >
              <circle cx="4.983" cy="5.009" r="2.188"></circle>
              <path d="M9.237 8.855v12.139h3.769v-6.003c0-1.584.298-3.118 2.262-3.118 1.937 0 1.961 1.811 1.961 3.218v5.904H21v-6.657c0-3.27-.704-5.783-4.526-5.783-1.835 0-3.065 1.007-3.568 1.96h-.051v-1.66H9.237zm-6.142 0H6.87v12.139H3.095z"></path>
            </svg>
          </a>
          <a
            className="btn align-center"
            href="https://github.com/nick-trigger"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ fill: 'currentColor' }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
              />
            </svg>
          </a>
        </div>
      </div>

      <div>
        <div className="text-3xl w-full font-bold mb-2">Featured Projects ⚙</div>
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
