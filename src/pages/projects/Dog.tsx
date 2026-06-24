import ProjectLayout from '../../components/ProjectLayout';

export default function Dog() {
  return (
    <ProjectLayout
      title="Dog Activity Trackers"
      description="Two Duke Engineering Foundry teams building wearable activity trackers for foster dogs at Saving Grace Animal Shelter. I served as Teaching Assistant, consulting on hardware design, firmware, and testing methodology."
      heroImage="/savinggrace.jpg"
      badge="Duke EGR 101"
      tags={['Embedded Systems', 'IoT', 'Consulting / TA', 'Duke Foundry']}
      docs={[
        {
          title: 'Team MAAAC Poster',
          url: '/projects/dog/posters',
          description: 'Dog Activity Tracking Device: GPS + Kalman filter approach',
        },
        {
          title: 'Dog Fitness Tracker Poster',
          url: '/projects/dog/posters',
          description: 'Dog Fitness Tracker: accelerometer-based collar device',
        },
      ]}
    >
      <div className="not-prose flex flex-wrap gap-2 mb-6 text-sm text-base-content/70">
        <span>Teaching Assistant & Consultant</span>
        <span className="opacity-40">|</span>
        <span>Duke University EGR 101 Foundry</span>
        <span className="opacity-40">|</span>
        <span>Client: Chip Bobbert, Saving Grace Animal Shelter</span>
      </div>

      <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content">Teams Mentored</div>
          <div className="stat-value text-2xl text-primary">2</div>
          <div className="stat-desc text-base-content">Duke Foundry teams</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content">Budget Target</div>
          <div className="stat-value text-2xl text-secondary">$50</div>
          <div className="stat-desc text-base-content">Both teams passed</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content">GPS Accuracy</div>
          <div className="stat-value text-2xl text-accent">+8.7%</div>
          <div className="stat-desc text-base-content">Distance error (Team 1)</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content">Lightest Build</div>
          <div className="stat-value text-2xl text-info">65 g</div>
          <div className="stat-desc text-base-content">2.3 oz (Team 2)</div>
        </div>
      </div>

      <h2>Context</h2>

      <p>
        Dogs at Saving Grace Animal Shelter are frequently placed with foster families as part of
        rehabilitation programs for abused or at-risk animals. Full rehabilitation requires daily
        monitoring of specific activity and movement levels, but no affordable, subscription-free
        solution existed for the shelter's budget.
      </p>

      <p>
        Client Chip Bobbert engaged two separate Duke EGR 101 Foundry teams to tackle the problem.
        I served as <strong>Teaching Assistant</strong>, consulting both teams throughout the
        semester on hardware decisions, electronics design, firmware architecture, and testing
        methodology.
      </p>

      <hr />

      <h2>Team 1: Dog Activity Tracking Device (Team MAAAC)</h2>

      <p>
        <em>Alexandre Dias, Ari Dixit, Arshaan Sayed, Conrad Qu, Mila Prakapenka</em>
      </p>

      <p>
        This team built a GPS + accelerometer collar device with a dedicated ground station. The
        standout technical contribution was a <strong>Kalman filter</strong> fusing GPS position
        data and accelerometer measurements to produce a more accurate distance estimate than
        either sensor alone, assigning weights based on each sensor's predetermined uncertainty
        characteristics.
      </p>

      <h3>Architecture</h3>

      <ul>
        <li>
          <strong>On-collar device:</strong> GPS module + accelerometer, radio transceiver (HC-12)
        </li>
        <li>
          <strong>Ground station:</strong> HC-12 receiver + ESP32 with Wi-Fi, uploads to Firebase
          Realtime Database
        </li>
        <li>
          <strong>Frontend:</strong> HTML/CSS/JS web app where users set target activity levels and
          view the past two days of stats
        </li>
      </ul>

      <h3>Results</h3>

      <table>
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Target</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cost</td>
            <td>&lt; $50, no subscription</td>
            <td>
              <strong>Pass</strong> ($42.72)
            </td>
          </tr>
          <tr>
            <td>Durability</td>
            <td>Water & impact resistant</td>
            <td>
              <strong>Pass</strong> (submerged 15 cm, dropped 3 m)
            </td>
          </tr>
          <tr>
            <td>Accuracy</td>
            <td>&lt; 10% distance error</td>
            <td>
              <strong>Pass</strong> (+8.7% error)
            </td>
          </tr>
          <tr>
            <td>Weight</td>
            <td>&lt; 400 g</td>
            <td>
              <strong>Pass</strong> (123 g)
            </td>
          </tr>
          <tr>
            <td>Safety</td>
            <td>No sharp edges</td>
            <td>
              <strong>Pass</strong>
            </td>
          </tr>
          <tr>
            <td>Battery life</td>
            <td>≥ 3 days</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>UI usability</td>
            <td>Rating ≥ 3/4 from 10 users</td>
            <td>TBD</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>Team 2: Dog Fitness Tracker</h2>

      <p>
        <em>Sam Patterson, Pablo Garza T, Yiannis Lempidakis, John Button, Jacob Hills</em>
      </p>

      <p>
        This team took a simpler, lower-cost approach: an accelerometer-only collar clip storing
        distance travelled in a local memory log, transmitted wirelessly to a remote interface. The
        emphasis was on ease of use: the device was designed to be set up by a non-technical foster
        family with no prior experience.
      </p>

      <h3>Architecture</h3>

      <ul>
        <li>
          <strong>On-collar device:</strong> IMU (accelerometer) + ESP8266, clips directly to
          collar
        </li>
        <li>
          <strong>Casing:</strong> 3D-printed enclosure with battery port seal for waterproofing
        </li>
        <li>
          <strong>Interface:</strong> Remote web interface for activity log review
        </li>
      </ul>

      <h3>Results</h3>

      <table>
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Target</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cost</td>
            <td>&lt; $50</td>
            <td>
              <strong>Pass</strong> ($17.54)
            </td>
          </tr>
          <tr>
            <td>Durability</td>
            <td>Waterproof to 1 m, lasts &gt; 1 year</td>
            <td>
              <strong>Pass</strong>
            </td>
          </tr>
          <tr>
            <td>Size</td>
            <td>&lt; 3 oz</td>
            <td>
              <strong>Pass</strong>, 2.3 oz (65 g)
            </td>
          </tr>
          <tr>
            <td>Safety</td>
            <td>AKC regulations compliant</td>
            <td>
              <strong>Pass</strong>
            </td>
          </tr>
          <tr>
            <td>Data accuracy</td>
            <td>&lt; 15% error</td>
            <td>
              <strong>Failed</strong>, 75% accuracy (25% error)
            </td>
          </tr>
          <tr>
            <td>Battery life</td>
            <td>&gt; 2 days</td>
            <td>
              <strong>Failed</strong> (ESP8266 drew more current than anticipated)
            </td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>Consulting Role</h2>

      <p>Across both teams my involvement covered:</p>

      <ul>
        <li>
          <strong>Hardware selection:</strong> advising on MCU and sensor choices relative to power
          budget and cost constraints
        </li>
        <li>
          <strong>Firmware guidance:</strong> sensor fusion strategy (Kalman filter implementation
          for Team 1), data logging architecture for Team 2
        </li>
        <li>
          <strong>Testing methodology:</strong> helping teams design valid, repeatable test
          procedures for each design criterion
        </li>
        <li>
          <strong>Presentation coaching:</strong> working with Dr. Elizabeth Paley to prepare teams
          for final poster presentations
        </li>
      </ul>

      <p>
        Both teams' work contributed to Saving Grace Animal Shelter's ongoing rehabilitation
        program for foster dogs.
      </p>
    </ProjectLayout>
  );
}
