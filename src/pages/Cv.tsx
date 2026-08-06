import BaseLayout from "../components/BaseLayout";
import ContactButtons from "../components/ContactButtons";
import TimeLine from "../components/TimeLine";

export default function Cv() {
  return (
    <BaseLayout title="Nicholas Trigger - Curriculum Vitae">
      <div className="mb-5">
        <div id="profile" className="text-4xl md:text-5xl font-bold">
          Curriculum Vitae
        </div>
      </div>

      <div className="text-lg mb-5 py-2">
        <span className="text-lg">
          Biomedical Engineering alumnus from Duke University (BSE, '26)
          specializing in medical device R&D, with hands-on experience
          designing, prototyping, and validating hardware from PCB-level
          electronics to mechanical enclosures. Comfortable across embedded
          systems (C/C++, RTOS, ESP32) and benchtop testing under
          ISO/FDA-conscious development, with clinical research and leadership
          experience that bridges engineering and real-world clinical workflows.
          Most recently an R&D Engineer at Reselute Medical and a Classroom R&D
          Engineer in Duke's BME department, designing and validating electronic
          lab hardware used by students every day. Co-founder of P.A.T.S.
          Development, where our team built an arterial line training device in
          collaboration with Duke Med, backed by a $5K VentureWell grant and a
          provisional patent. Actively seeking full-time roles in medical device
          engineering, embedded systems, or hardware R&D.
        </span>
        <ContactButtons />
      </div>

      <div className="mb-5">
        <div id="education" className="text-3xl w-full font-bold">
          Education
        </div>
      </div>

      <div className="time-line-container grid gap-4 mb-10">
        <TimeLine
          title="Duke University · BS Biomedical Engineering"
          subtitle="August 2022 to May 2026 · Durham, NC"
        >
          <ul className="list-disc mx-6 mb-2 grid gap-0.5 text-sm">
            <li>
              Relevant Coursework: Biomaterials, Biomechanics, Medical Device
              Design, Embedded Medical Devices, Imaging Systems
            </li>
          </ul>
        </TimeLine>
      </div>

      <div className="mb-5">
        <div id="engineering-experience" className="text-3xl w-full font-bold">
          Engineering Experience
        </div>
      </div>

      <div className="time-line-container mb-10">
        <TimeLine
          title="Research and Development Engineer"
          subtitle="December 2025 to May 2026 at Reselute Medical · Durham, NC"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Designed, validated, and implemented novel bacterial testing
              protocols to support product evaluation efforts.
            </li>
            <li>
              Conducted literature reviews and synthesized prior research to
              inform experimental design.
            </li>
            <li>
              Documented and analyzed experimental results to support iterative
              design decisions and technical reporting.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Classroom R&D Engineer"
          subtitle="April 2025 to May 2026 at Duke University BME Department · Durham, NC"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Designed, fabricated, and assembled electronic laboratory hardware
              for deployment across BME teaching labs.
            </li>
            <li>
              Developed a stimulus-responsive EKG simulator generating
              physiologically accurate signals for lab use.
            </li>
            <li>
              Validated hardware performance under extended use conditions to
              ensure durability and safety.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Makerspace Assistant Manager"
          subtitle="August 2023 to May 2024 at The Foundry at Duke University · Durham, NC"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Supervised day-to-day operations of the Foundry makerspace,
              supporting student use of fabrication equipment.
            </li>
            <li>
              Trained and onboarded users on safe operation of 3D printers,
              laser cutters, CNC machines, and electronics tools.
            </li>
            <li>
              Coordinated maintenance schedules and ensured compliance with
              safety standards across the facility.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Engineering Design Teaching Assistant"
          subtitle="August 2023 to June 2024 at Duke University BME Department · Durham, NC"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Mentored student teams through end-to-end engineering design and
              prototyping workflows.
            </li>
            <li>
              Supported hardware and CAD development for client-driven design
              projects.
            </li>
            <li>Evaluated technical deliverables and design reviews.</li>
            <li>Oversaw safe use of machine shop equipment.</li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Engineering Services Intern"
          subtitle="July 2023 to August 2024 at City of Corpus Christi Large Projects Division · Corpus Christi, TX"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Developed and implemented a streamlined workflow that accelerated
              city audit processes, improving efficiency and reducing processing
              time.
            </li>
            <li>
              Assisted in the bidding process by organizing and managing files,
              ensuring accurate and accessible documentation.
            </li>
            <li>
              Identified and exposed discrepancies between contractor agreements
              and city contracts, contributing to improved contract compliance.
            </li>
          </ul>
        </TimeLine>
      </div>

      <div className="mb-5">
        <div id="research-experience" className="text-3xl w-full font-bold">
          Research Experience
        </div>
      </div>

      <div className="time-line-container mb-10">
        <TimeLine
          title="Clinical Research Associate"
          subtitle="June 2023 to August 2024 at CHRISTUS Spohn Health System · Corpus Christi, TX"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Supported emergency medicine clinical studies through compliant
              data collection and EMR review.
            </li>
            <li>
              Collected and documented patient consent per IRB and FDA
              guidelines.
            </li>
            <li>
              Collaborated with physicians, residents, and research staff to
              support ongoing clinical investigations.
            </li>
          </ul>
        </TimeLine>
      </div>

      <div className="mb-5">
        <div id="patents" className="text-3xl w-full font-bold">
          Patents
        </div>
      </div>
      <div className="time-line-container mb-10">
        <TimeLine
          title="Device and Methods for Arterial Insertion Training"
          subtitle="US Provisional Patent No. 63/463,432 · Filed May 2, 2023"
        ></TimeLine>
      </div>

      <div className="mb-5">
        <div id="projects" className="text-3xl w-full font-bold">
          Projects
        </div>
      </div>

      <div className="time-line-container mb-10">
        <TimeLine
          title="CLAB-Free · CLABSI Prevention Device"
          subtitle="Duke BME Senior Capstone"
          separator="·"
          buttonLink="../projects/clabsi"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Developed a handheld UV-C disinfection device for central-line
              hubs, targeting the ~40,000 annual CLABSIs and removing dependence
              on nurse compliance with the Scrub-the-Hub protocol.
            </li>
            <li>
              Engineered three custom KiCad PCBs and an SLA 3D-printed
              enclosure, validating a 4-log CFU reduction and 2.49 mW optical
              output in the 263–273 nm germicidal window.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Stimulus-Responsive ECG Synthesizer"
          buttonLink="../projects/ecg"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Designed and built an ESP32 ECG synthesizer (C++/FreeRTOS) with a
              custom differential analog output stage targeting standard
              limb-lead outputs.
            </li>
            <li>
              Enabled repeatable bench validation of ECG acquisition hardware
              and signal-processing algorithms.
            </li>
          </ul>
        </TimeLine>
        <TimeLine title="Browser Games" buttonLink="../projects/games">
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Built a collection of eight self-contained browser games (Snake,
              2048, Tower Defense, Flappy Bird, and more) in React and
              TypeScript using a registry-driven architecture and a reusable
              game-player component.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Radial Arterial Line Placement Training Device"
          subtitle="VentureWell Summer 2023 Cohort"
          separator="·"
          buttonLink="../projects/arm"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Co-developed a durable, anatomically accurate arterial line
              placement training device to address the shortage of realistic,
              reusable simulation tools for radial a-line insertion training.
            </li>
            <li>
              Iterated through multiple prototype revisions incorporating
              clinician and user feedback to improve pulse simulation fidelity,
              tissue realism, and durability under repeated needle insertions.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Factory Scheduling & KPI Reporting API"
          buttonLink="../projects/factory-scheduler"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Built a constraint-based production scheduling service on OR-Tools
              CP-SAT that accepts job-shop problems as JSON and returns
              tardiness-minimizing schedules with KPIs.
            </li>
            <li>
              Architected a FastAPI backend with pluggable adapter, objective,
              and constraint systems, paired with a React + TypeScript Gantt
              frontend.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="BME 354 Multi-Chip IC Tester"
          buttonLink="../projects/chip-tester"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Designed a custom KiCad PCB to validate multiple integrated
              circuits for Duke BME 354 coursework.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="PET/CT Brain Phantom Simulator"
          buttonLink="../projects/pet-ct-sim"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Built a physics-based PET/CT brain phantom simulator in Python and
              Jupyter, implementing phantom generation, CT simulation, and PET
              simulation pipelines for medical imaging education.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Dog Activity Trackers"
          subtitle="Duke EGR 101 Consulting TA"
          separator="·"
          buttonLink="../projects/dog"
        >
          <ul className="list-disc mx-6 mb-6 grid gap-0.5 text-sm">
            <li>
              Served as consulting TA for two Duke EGR 101 Foundry teams
              building wearable GPS and accelerometer trackers for foster dogs
              at Saving Grace Animal Shelter.
            </li>
            <li>
              Guided students through sensor selection, prototyping, and
              iteration on a real-world wearable.
            </li>
          </ul>
        </TimeLine>
        <TimeLine 
        title="NicholasTrigger.com Portfolio Website"
        buttonLink="https://github.com/Nick-Trigger/Portfolio-Websites"
        >
          <ul className="list-disc mx-6 grid gap-0.5 text-sm">
            <li>
              Built a personal portfolio site in React, Vite, and Tailwind CSS,
              statically prerendered for GitHub Pages, with site-wide custom features.
            </li>
          </ul>
        </TimeLine>
      </div>

      <div className="mb-5">
        <div id="leadership" className="text-3xl w-full font-bold">
          Leadership & Extracurricular Involvement
        </div>
      </div>

      <div className="time-line-container grid gap-4 mb-10">
        <TimeLine
          title="Co-Founder & Developer · P.A.T.S. Development"
          subtitle="August 2023 to May 2026 · Durham, NC"
        >
          <ul className="list-disc mx-6 grid gap-0.5 text-sm">
            <li>
              Led development of a medical training device focused on improving
              arterial line placement accuracy.
            </li>
            <li>
              Directed device design, prototyping, and iterative testing in
              collaboration with other students and Duke Med School.
            </li>
            <li>
              Secured a $5,000 VentureWell grant to support continued device
              development.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Community Outreach Manager & Class Lead · Duke Robotics Mentorship (DuRM)"
          subtitle="October 2023 to April 2025 · Triangle, NC"
        >
          <ul className="list-disc mx-6 grid gap-0.5 text-sm">
            <li>
              Led weekly robotics instruction sessions for middle school
              students in Durham-area schools.
            </li>
            <li>
              Managed communication and coordination between Duke undergraduate
              mentors and partner schools.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Equipment & Safety Chair · Duke University Club Ski and Board"
          subtitle="August 2023 to May 2026 · Durham, NC"
        >
          <ul className="list-disc mx-6 grid gap-0.5 text-sm">
            <li>
              Oversaw equipment inventory, inspection, and maintenance to ensure
              compliance with safety standards.
            </li>
            <li>
              Coordinated equipment logistics and distribution to support club
              operations and travel.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Payload Team Engineer · Duke University Club Aerospace"
          subtitle="August 2023 to May 2025 · Durham, NC"
        >
          <ul className="list-disc mx-6 grid gap-0.5 text-sm">
            <li>
              Developed embedded firmware to control payload release sequencing
              and system timing.
            </li>
            <li>
              Contributed to the development and integration of a CubeSat-style
              payload for a student-led rocket mission.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Founder, Event Manager & Team Lead · RunCorpusChristi"
          subtitle="August 2020 to July 2022 · Corpus Christi, TX"
        >
          <ul className="list-disc mx-6 grid gap-0.5 text-sm">
            <li>Organized charity running events across Corpus Christi, TX.</li>
            <li>
              Raised over $10,000 for the Ronald McDonald House and Driscoll
              Children's Hospital.
            </li>
          </ul>
        </TimeLine>
        <TimeLine
          title="Fish & Herpetology Volunteer · Texas State Aquarium"
          subtitle="May 2017 to April 2020 · Corpus Christi, TX"
        >
          <ul className="list-disc mx-6 grid gap-0.5 text-sm">
            <li>
              Provided animal care through maintenance, enrichment, and feeding.
            </li>
            <li>
              Educated guests on animals and environmental threats to wildlife.
            </li>
            <li>Received the President's Gold Award for Volunteer Service.</li>
          </ul>
        </TimeLine>
      </div>

      <div className="mb-5">
        <div id="certifications" className="text-3xl w-full font-bold">
          Certifications
        </div>
      </div>

      <ul className="list-disc mx-6 mb-10 grid gap-2">
        <li>CSSC: Lean Six Sigma White Belt</li>
        <li>Nordic Semiconductor: nRF Connect SDK Fundamentals</li>
        <li>Nordic Semiconductor: Matter Fundamentals</li>
        <li>
          <a
            href="https://www.citiprogram.org/verify/?w36eb6ede-5dde-40c6-a7b6-5dc6190f6a21-57141618"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 CITI Program: Clinical Research Coordinator (CRC) Foundations
          </a>
        </li>
        <li>
          <a
            href="https://www.citiprogram.org/verify/?w30e0d541-b4f8-4c06-93fd-3a20ad6d4dcf-57141616"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 CITI Program: Principal Investigator; Sub Investigators; CRC's
            (Human Subjects)
          </a>
        </li>
      </ul>

      <div className="mb-5">
        <div id="skills" className="text-3xl w-full font-bold">
          Skills
        </div>
      </div>

      <div className="mb-2 font-semibold text-sm">Biomedical Engineering</div>
      <ul className="list-disc md:columns-3 columns-2 mx-6 mb-4 text-sm">
        <li>BioSignal Processing</li>
        <li>Medical Device Prototyping</li>
        <li>Biomechanics</li>
        <li>X-ray, CT, MRI & PET</li>
        <li>Medical Image Processing</li>
        <li>ISO Standards</li>
        <li>FDA Regulations</li>
        <li>EMG</li>
        <li>Bacterial Testing</li>
        <li>Phantom Development</li>
        <li>Medical Firmware</li>
        <li>Verification & Validation</li>
        <li>Bench Testing</li>
        <li>System Validation</li>
        <li>Data Collection & Analysis</li>
      </ul>

      <div className="mb-2 font-semibold text-sm">Mechanical CAD</div>
      <ul className="list-disc md:columns-3 columns-2 mx-6 mb-4 text-sm">
        <li>SOLIDWORKS</li>
        <li>Fusion 360</li>
        <li>AutoCAD</li>
        <li>Onshape</li>
        <li>GD&T</li>
      </ul>

      <div className="mb-2 font-semibold text-sm">
        Electrical CAD & Embedded Systems
      </div>
      <ul className="list-disc md:columns-3 columns-2 mx-6 mb-4 text-sm">
        <li>KiCad</li>
        <li>EAGLE</li>
        <li>PCB Design, Layout, and Stackup</li>
        <li>PCB Triage</li>
        <li>C/C++</li>
        <li>Embedded C</li>
        <li>FreeRTOS</li>
        <li>Zephyr RTOS</li>
      </ul>

      <div className="mb-2 font-semibold text-sm">Communication Protocols</div>
      <ul className="list-disc md:columns-3 columns-2 mx-6 mb-4 text-sm">
        <li>SPI</li>
        <li>I2C</li>
        <li>UART</li>
        <li>CAN</li>
        <li>USB</li>
        <li>BLE</li>
      </ul>

      <div className="mb-2 font-semibold text-sm">Programming</div>
      <ul className="list-disc md:columns-3 columns-2 mx-6 mb-4 text-sm">
        <li>Python</li>
        <li>C / C++</li>
        <li>JavaScript</li>
        <li>TypeScript</li>
        <li>SQL</li>
        <li>HTML & CSS</li>
        <li>LaTeX</li>
        <li>Git, GitHub & GitLab</li>
      </ul>

      <div className="mb-2 font-semibold text-sm">
        Prototyping & Manufacturing
      </div>
      <ul className="list-disc md:columns-3 columns-2 mx-6 mb-10 text-sm">
        <li>3D Printing (FDM)</li>
        <li>CNC & Manual Machining</li>
        <li>Laser Cutting</li>
        <li>Waterjet Cutting</li>
        <li>PCB Fabrication</li>
        <li>PCB Assembly</li>
        <li>Bench Testing & Validation</li>
      </ul>
    </BaseLayout>
  );
}
