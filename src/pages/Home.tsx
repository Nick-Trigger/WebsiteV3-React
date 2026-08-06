import { Link } from "react-router-dom";
import BaseLayout from "../components/BaseLayout";
import ExperienceCard from "../components/ExperienceCard";
import { FeaturedProjects } from "../components/ProjectComponets";
import ContactButtons from "../components/ContactButtons";

const CircleArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    style={{ fill: "currentColor" }}
  >
    <path d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zM10 7l6 5-6 5V7z" />
  </svg>
);

export default function Home() {
  return (
    <BaseLayout>
      <div className="pb-12 mt-5">
        <div className="text-xl py-1">Hey there 👋</div>
        <div className="text-4xl md:text-5xl font-bold">
          I'm Nicholas Trigger
        </div>
        <div className="text-2xl md:text-3xl py-3 font-bold">
          Biomedical Engineer
        </div>
        <div className="py-2">
          <span className="text-lg">
            Recent Duke Biomedical Engineering graduate with hands-on experience
            across medical device R&D, embedded systems, and clinical research.
            I love building things, from PCB-level hardware and firmware to
            bacterial testing protocols and FDA-compliant clinical workflows.
            Co-founder of P.A.T.S. Development, where our team built an arterial
            line training device in collaboration with Duke Med, backed by a $5K
            VentureWell grant and a provisional patent.
          </span>
        </div>
        <ContactButtons />
      </div>

      <div>
        <div className="text-3xl w-full font-bold mb-2">
          Featured Projects ⚙
        </div>
        <a className="text-sm text-primary hover:text-secondary" href="/projects">
          See All Projects 🔗
        </a>
      </div>

      <FeaturedProjects />

      <div className="flex justify-center">
        <Link to="/projects" className="btn align-center">
          See All
          <CircleArrow />
        </Link>
      </div>

      <div>
        <div className="text-3xl w-full font-bold mb-5 mt-10">
          Featured Experience
        </div>
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
            style={{ fill: "currentColor" }}
          >
            <path d="m12 16 4-5h-3V4h-2v7H8z"></path>
            <path d="M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z"></path>
          </svg>
        </a>
      </div>
    </BaseLayout>
  );
}
