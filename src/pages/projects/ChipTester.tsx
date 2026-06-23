import ProjectLayout from '../../components/ProjectLayout';

export default function ChipTester() {
  return (
    <ProjectLayout
      title="BME 354 Multi-Chip IC Tester"
      description="A custom KiCad PCB designed for BME 354 at Duke University that validates multiple integrated circuits in sequence, reducing bench setup time and providing a repeatable test fixture for analog IC verification."
      heroImage={['/chiptester354.png']}
      badge="Hardware"
      tags={['KiCad', 'PCB Design', 'Analog ICs', 'Duke BME']}
      githubUrl="https://github.com/Nick-Trigger/BME-354-Chip-Tester"
    >
      <h2>Overview</h2>

      <p>
        The Multi-Chip IC Tester is a custom PCB designed for{' '}
        <strong>BME 354 (Biomedical Electronic Measurements)</strong> at Duke University. The board
        provides a single, repeatable test fixture for validating multiple analog integrated
        circuits in sequence, replacing the rat's-nest of individual breadboard setups that would
        otherwise be required for each IC.
      </p>

      <hr />

      <h2>Problem</h2>

      <p>
        BME 354 lab work involves characterizing a suite of analog ICs: op-amps, comparators, and
        other linear devices. Testing each chip individually on a breadboard is time-consuming and
        prone to wiring errors that obscure whether a failure is in the chip or the setup. A
        dedicated PCB eliminates that ambiguity by providing a fixed, known-good test harness for
        every device under test.
      </p>

      <hr />

      <h2>PCB Design</h2>

      <p>
        Designed in <strong>KiCad</strong>. Key layout decisions:
      </p>

      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Multi-socket layout</strong>
            </td>
            <td>DIP sockets for each target IC, wired to a shared test bus</td>
          </tr>
          <tr>
            <td>
              <strong>Power rails</strong>
            </td>
            <td>Decoupled ±V supply rails with bypass capacitors at each socket</td>
          </tr>
          <tr>
            <td>
              <strong>Test points</strong>
            </td>
            <td>Labeled probe pads at key nodes for oscilloscope or DMM access</td>
          </tr>
          <tr>
            <td>
              <strong>Input/output headers</strong>
            </td>
            <td>Pin headers for function generator input and scope output connections</td>
          </tr>
        </tbody>
      </table>

      <p>
        The board routes signal, power, and ground traces such that each IC slot is electrically
        independent, so a failed device does not affect adjacent socket measurements.
      </p>

      <hr />

      <h2>Workflow</h2>

      <ol>
        <li>Insert target IC into the appropriate DIP socket</li>
        <li>
          Connect bench supply to the power header and function generator to the input header
        </li>
        <li>Probe labeled test points with an oscilloscope or DMM</li>
        <li>Compare measured transfer characteristics against datasheet specs</li>
        <li>Swap to the next IC and repeat, no rewiring needed</li>
      </ol>

      <hr />

      <h2>Course Context</h2>

      <p>
        BME 354 covers analog measurement systems used in biomedical instrumentation: amplifiers,
        filters, ADCs, and signal conditioning. The ICs tested on this board feed directly into
        larger lab circuits: ECG amplifiers, photodetector front-ends, and similar physiological
        measurement chains. Having a fast, reliable IC verification step early in the lab workflow
        prevents hours of debugging downstream.
      </p>
    </ProjectLayout>
  );
}
