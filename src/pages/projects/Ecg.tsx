import ProjectLayout from '../../components/ProjectLayout';

export default function Ecg() {
  return (
    <ProjectLayout
      title="ECG Synthesizer"
      description="An ESP32-based ECG synthesizer that generates physiologically accurate cardiac waveforms (P wave, QRS complex, and T wave) through a custom analog output stage. Built with C++ and PlatformIO, based on the EKG simulator used in Duke's BME teaching labs."
      heroImage={['/ecgtimings.png', '/ecg_schem.png']}
      badge="Embedded Systems"
      tags={[
        'ESP32',
        'C++ / PlatformIO',
        'Analog Circuit Design',
        'Biomedical Engineering',
        'Duke BME',
      ]}
      githubUrl="https://github.com/Nick-Trigger/ECG_SYN"
    >
      <h2>Overview</h2>

      <p>
        The ECG Synthesizer generates a realistic electrocardiogram (ECG) signal on hardware,
        replicating the cardiac waveform morphology (P wave, QRS complex, and T wave) at a
        configurable heart rate. The project pairs an ESP32 microcontroller (used as a DAC source)
        with a custom analog output stage that conditions the differential signal for standard ECG
        lead outputs (RA, LL, RL).
      </p>

      <p>
        The design is based on the EKG simulator circuit used in{' '}
        <strong>Duke University's BME teaching labs</strong>, extended with embedded firmware for
        waveform synthesis.
      </p>

      <hr />

      <h2>Hardware</h2>

      <h3>Output Stage Circuit</h3>

      <p>
        The analog front-end takes a positive and negative waveform from the ESP32 and conditions
        them for ECG lead outputs.
      </p>

      <table>
        <thead>
          <tr>
            <th>Stage</th>
            <th>Components</th>
            <th>Function</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Input summing</strong>
            </td>
            <td>R1, R2 (1 MΩ each)</td>
            <td>Sums POSITIVE WFORM and NEGATIVE WFORM at U1A inputs</td>
          </tr>
          <tr>
            <td>
              <strong>Differential amplifier</strong>
            </td>
            <td>U1A, R3 (1 kΩ), R4</td>
            <td>Amplifies differential signal; R4 sets gain to GND reference</td>
          </tr>
          <tr>
            <td>
              <strong>Buffer/comparator</strong>
            </td>
            <td>U1B (±5 V supply)</td>
            <td>Buffers U1A output to drive the ECG lead resistor ladder</td>
          </tr>
          <tr>
            <td>
              <strong>Lead outputs</strong>
            </td>
            <td>R7 (RL), R8 (LL), R9 (RA), with test points TP1–TP3</td>
            <td>Provides the three standard limb lead reference voltages</td>
          </tr>
        </tbody>
      </table>

      <p>
        The ±5 V rail powers the output op-amp (U1B), ensuring the conditioned waveform can swing
        symmetrically around ground, matching the common-mode range expected by ECG acquisition
        hardware.
      </p>

      <h3>Key Design Choices</h3>

      <ul>
        <li>
          <strong>1 MΩ input resistors:</strong> high input impedance preserves the DAC signal and
          limits loading on the ESP32 output
        </li>
        <li>
          <strong>1 kΩ feedback (R3):</strong> sets a moderate closed-loop gain while keeping the
          differential stage stable
        </li>
        <li>
          <strong>Separate ±5 V supply for U1B:</strong> allows rail-to-rail output swing
          independent of the 3.3 V MCU supply
        </li>
      </ul>

      <hr />

      <h2>Firmware</h2>

      <p>
        Written in <strong>C++ with PlatformIO</strong> targeting the ESP32. The firmware
        synthesizes each segment of the cardiac cycle:
      </p>

      <table>
        <thead>
          <tr>
            <th>Waveform Segment</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>P wave</strong>
            </td>
            <td>Atrial depolarization: low-amplitude, rounded positive deflection</td>
          </tr>
          <tr>
            <td>
              <strong>QRS complex</strong>
            </td>
            <td>Ventricular depolarization: rapid, high-amplitude spike</td>
          </tr>
          <tr>
            <td>
              <strong>T wave</strong>
            </td>
            <td>Ventricular repolarization: slower, positive deflection</td>
          </tr>
          <tr>
            <td>
              <strong>Isoelectric baseline</strong>
            </td>
            <td>Flat segments between waves at the correct physiological timing</td>
          </tr>
        </tbody>
      </table>

      <p>
        The synthesized waveform is output through the ESP32's built-in DAC, then split into
        differential positive/negative outputs before entering the analog conditioning stage.
      </p>

      <hr />

      <h2>Use Case</h2>

      <p>The synthesizer produces a realistic ECG signal that can drive:</p>
      <ul>
        <li>ECG acquisition boards and analog front-ends for testing</li>
        <li>Teaching demonstrations of cardiac waveform morphology</li>
        <li>Bench validation of signal processing algorithms before live patient data is used</li>
      </ul>

      <p>
        This makes it useful as a <strong>signal source for BME lab coursework</strong>, verifying
        that ECG amplifier circuits, filters, and ADC pipelines respond correctly to a known,
        repeatable input.
      </p>
    </ProjectLayout>
  );
}
