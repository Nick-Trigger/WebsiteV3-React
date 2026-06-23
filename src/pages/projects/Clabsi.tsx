import ProjectLayout from '../../components/ProjectLayout';

export default function Clabsi() {
  return (
    <ProjectLayout
      title="CLABSI Prevention Device"
      description="A handheld UV-C disinfection device for central-line hubs, developed at Duke University's Pratt School of Engineering."
      heroImage={[
        '/clabfree.png',
        '/clabfree2_pcb.jpg',
        '/clabfree_frontopen.jpg',
        '/clabfree_frontclosed_cath.jpg',
        '/clabfree_mdesign.png',
      ]}
      badge="Senior Capstone"
      tags={['Embedded Systems', 'PCB Design', 'Zephyr RTOS', 'Medical Device', 'Duke BME']}
      githubUrl="https://github.com/Nick-Trigger/CLABSI"
      docs={[
        {
          title: 'Design History File',
          url: '/projects/clabsi/dhf',
          description: 'Final Design History File',
        },
        {
          title: 'Final Poster',
          url: '/projects/clabsi/poster',
          description: 'Duke BME capstone poster',
        },
        {
          title: 'Interactive BOM',
          url: '/clabsi-ibom.html',
          description:
            'KiCad interactive bill of materials; click components to highlight on the PCB',
        },
        {
          title: 'Gerber Files',
          url: 'https://github.com/Nick-Trigger/CLABSI/tree/main/KiCad/Exports',
          description: 'Fab-ready Gerber exports for all three PCB boards',
        },
        {
          title: 'Schematic & Layout',
          url: 'https://github.com/Nick-Trigger/CLABSI/tree/main/KiCad/CLABSI%20(FINAL)',
          description: 'Final revision schematic, PCB layout, BOM, and 3D STEP models',
        },
        {
          title: 'Firmware Source',
          url: 'https://github.com/Nick-Trigger/CLABSI/tree/main/Firmware',
          description: 'Zephyr RTOS application for the nRF54L15 MCU',
        },
      ]}
    >
      <div className="not-prose flex flex-wrap gap-2 mb-6 text-sm text-base-content/70">
        <span>D. Bearden · D. Chong · N. Kodua · F. Rudd · N. Trigger</span>
        <span className="opacity-40">|</span>
        <span>Dept. of Biomedical Engineering, Duke University</span>
      </div>

      <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content">Shutoff Time</div>
          <div className="stat-value text-2xl text-primary">17 ms</div>
          <div className="stat-desc text-base-content">450 ms limit (ISO 15858)</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content">CFU Reduction</div>
          <div className="stat-value text-2xl text-secondary">4-log</div>
          <div className="stat-desc text-base-content">EPA OCSPP 810.2200</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content">Device Weight</div>
          <div className="stat-value text-2xl text-accent">204 g</div>
          <div className="stat-desc text-base-content">One-handed operation</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content">UV-C Bandwidth</div>
          <div className="stat-value text-2xl text-info">263–273 nm</div>
          <div className="stat-desc text-base-content">2.49 ± 0.047 mW optical</div>
        </div>
      </div>

      <h2>Problem & Need</h2>

      <p>
        Central Line-Associated Bloodstream Infections (CLABSIs) occur when bacteria enter the
        bloodstream via a central line. <strong>40,000 CLABSIs occur annually</strong> in the US,
        costing hospitals approximately <strong>$1.9B per year</strong>, and 65–70% are completely
        preventable with proper disinfection.
      </p>

      <p>
        The current standard of care is the <em>Scrub-the-Hub</em> technique, which relies
        entirely on nurse compliance with manual protocol. Infections arise from human error and
        inconsistent adherence to workflow. This device removes that dependency.
      </p>

      <blockquote>
        <strong>Need Statement:</strong> Hospital nurses need a quick, reliable, and user-friendly
        system to disinfect central lines to maintain adherence to proper protocols and reduce
        infection risk in patients.
      </blockquote>

      <hr />

      <h2>Why UV-C Disinfection?</h2>

      <p>
        DNA and RNA strongly absorb 260 nm UV-C incident light. The high-energy photons create
        nitrogenous base lesions, distorting the helix structure and blocking transcription and
        translation, effectively sterilizing the hub surface without chemicals, contact, or manual
        technique.
      </p>

      <hr />

      <h2>Device Design</h2>

      <h3>Mechanical</h3>

      <p>
        The enclosure is resin-printed to prevent UV-C light leakage. Key mechanical elements:
      </p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Component</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Resin-Printed Casing</td>
            <td>Contains UV-C, prevents leakage</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Disinfection Chamber</td>
            <td>Where the catheter hub is inserted</td>
          </tr>
          <tr>
            <td>3</td>
            <td>RGB LED</td>
            <td>Color-coded status during operation and errors</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Activation Button</td>
            <td>Single-button start/abort</td>
          </tr>
          <tr>
            <td>5</td>
            <td>Opening Aperture</td>
            <td>Seals around the catheter to prevent leakage</td>
          </tr>
          <tr>
            <td>6</td>
            <td>Safety Interlocks (×2)</td>
            <td>Abort if device opens prematurely</td>
          </tr>
        </tbody>
      </table>

      <h3>Electrical</h3>

      <p>Three custom KiCad PCBs make up the electrical system:</p>

      <table>
        <thead>
          <tr>
            <th>Board</th>
            <th>Function</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Main</strong>
            </td>
            <td>
              nRF54L15 MCU, power management, BMS (MAX17260), RGB LED driver (LP5815)
            </td>
          </tr>
          <tr>
            <td>
              <strong>UVC</strong>
            </td>
            <td>UV-C LED driver with current-limiting elements</td>
          </tr>
          <tr>
            <td>
              <strong>Base</strong>
            </td>
            <td>Mechanical base and connector board</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>Firmware</h2>

      <p>
        Written in C on <strong>Zephyr RTOS</strong> (nRF Connect SDK), targeting the nRF54L15.
        The application runs a hierarchical state machine (Zephyr SMF):
      </p>

      <pre>
        <code>{`INIT → IDLE ──► DISINFECTING ──► IDLE
            ──► CHARGING      ──► (abort via button or interlock)
            ──► ERROR`}</code>
      </pre>

      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>Behavior</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>INIT</code>
            </td>
            <td>Initialize GPIO, PWM, I2C, BMS, safety interlocks</td>
          </tr>
          <tr>
            <td>
              <code>IDLE</code>
            </td>
            <td>Awaiting button press; battery SOC displayed on RGB LED</td>
          </tr>
          <tr>
            <td>
              <code>CHARGING</code>
            </td>
            <td>Charge in progress; RGB indicates charge level</td>
          </tr>
          <tr>
            <td>
              <code>DISINFECTING</code>
            </td>
            <td>UV-C LED at full PWM; instant abort on interlock open or button press</td>
          </tr>
          <tr>
            <td>
              <code>ERROR</code>
            </td>
            <td>RGB error pattern + buzzer; cleared by button press</td>
          </tr>
        </tbody>
      </table>

      <p>
        The critical safety path: interlock GPIO interrupts submit a work item that disables PWM
        output before the SMF state transition completes, with a mean shutoff time of{' '}
        <strong>17 ± 2 ms</strong>, well within the 450 ms safety limit derived from ISO 15858.
      </p>

      <hr />

      <h2>Testing Results</h2>

      <div className="not-prose overflow-x-auto mb-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Device Weight</td>
              <td>204 g</td>
            </tr>
            <tr>
              <td>UV-C LED Optical Power</td>
              <td>2.49 ± 0.047 mW</td>
            </tr>
            <tr>
              <td>UV-C LED Bandwidth</td>
              <td>262.9 – 273.2 nm</td>
            </tr>
            <tr>
              <td>Rapid Shutoff Time</td>
              <td>17 ± 2 ms (limit: &lt;450 ms)</td>
            </tr>
            <tr>
              <td>Germicidal CFU Reduction</td>
              <td>4-log reduction (n=3 replicates)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Germicidal testing used DH5α bacteria incubated, seeded, and adhered to catheter hubs at
        room temperature. Hubs were irradiated with UV-C at 0, 2, and 4 hours, then vortexed for
        CFU counts by serial dilution, achieving a 4-log reduction.
      </p>

      <hr />

      <h2>Regulatory & Market</h2>

      <p>
        The CLAB-Free device will be classified as a <strong>Class II FDA device</strong> given
        the inherent risk of UV light and catheter use. Two potential pathways:
      </p>

      <ul>
        <li>
          <strong>510(k), Preferred:</strong> If determined similar enough to existing UV
          surface-disinfecting devices
        </li>
        <li>
          <strong>De Novo:</strong> If disinfection through catheter tubing constitutes a novel
          use case
        </li>
      </ul>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="card bg-neutral p-4 rounded-xl shadow">
          <div className="text-xs text-base-content/60 mb-1">Total Available Market</div>
          <div className="text-xl font-bold text-primary">~$1.61B</div>
          <div className="text-sm text-base-content/70">
            Global catheter-related bloodstream infection market (2024)
          </div>
        </div>
        <div className="card bg-neutral p-4 rounded-xl shadow">
          <div className="text-xs text-base-content/60 mb-1">Serviceable Available Market</div>
          <div className="text-xl font-bold text-secondary">~$481M</div>
          <div className="text-sm text-base-content/70">
            US central-line infection market (minimum estimate)
          </div>
        </div>
        <div className="card bg-neutral p-4 rounded-xl shadow">
          <div className="text-xs text-base-content/60 mb-1">Serviceable Obtainable Market</div>
          <div className="text-xl font-bold text-accent">~$16.1M</div>
          <div className="text-sm text-base-content/70">5% of preventable CLABSIs</div>
        </div>
      </div>

      <hr />

      <h2>Conclusion & Next Steps</h2>

      <p>
        The device successfully disinfects central line hubs using UV-C light in the germicidal
        range, achieves a 4-log CFU reduction, and operates safely within ISO 15858 exposure
        limits. It is portable, one-handed, and reusable between patients.
      </p>

      <p>
        <strong>Planned next steps:</strong>
      </p>
      <ul>
        <li>Nurse usability testing</li>
        <li>Design of docking/recharging stations</li>
        <li>Autoclavable disinfection chamber redesign</li>
        <li>Head-to-head testing against proper and improper Scrub-the-Hub technique</li>
      </ul>
    </ProjectLayout>
  );
}
