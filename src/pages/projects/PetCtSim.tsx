import ProjectLayout from '../../components/ProjectLayout';

const BINDER_URL =
  'https://mybinder.org/v2/gh/Nick-Trigger/Pet-Scan-Simulator-303-Final-Project/HEAD?urlpath=%2Fdoc%2Ftree%2FRunME.ipynb';

export default function PetCtSim() {
  return (
    <ProjectLayout
      title="PET/CT Brain Phantom Simulator"
      description="A physics-based PET/CT brain phantom simulator implementing phantom generation, CT simulation, and PET simulation pipelines in Python and Jupyter Notebook, built for medical imaging education and research at Duke University."
      heroImage={['/phantomsim.png']}
      badge="Medical Imaging"
      tags={['Python', 'Jupyter Notebook', 'Medical Imaging', 'PET/CT', 'Duke BME']}
      githubUrl="https://github.com/Nick-Trigger/Pet-Scan-Simulator-303-Final-Project"
      docs={[
        {
          title: 'Launch Interactive Notebook (mybinder.org)',
          url: BINDER_URL,
          description: 'Run the full simulation in your browser via Binder, no install required',
        },
      ]}
    >
      <h2>Overview</h2>

      <p>
        The PET/CT Brain Phantom Simulator is a physics-based simulation pipeline that models the
        full imaging chain for two modalities: <strong>Computed Tomography (CT)</strong> and{' '}
        <strong>Positron Emission Tomography (PET)</strong>. Built in Python and Jupyter Notebook
        for <strong>BME 303 (Systems & Signals in Biomedical Engineering)</strong> at Duke, it
        demonstrates how each modality acquires and reconstructs brain images from a synthetic
        phantom.
      </p>

      <div className="not-prose mt-4 mb-6">
        <a href={BINDER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Try It in Your Browser (mybinder.org)
        </a>
      </div>

      <hr />

      <h2>Simulation Pipeline</h2>

      <p>The project is structured as three sequential stages:</p>

      <h3>1. Phantom Generation</h3>

      <p>
        A synthetic brain phantom is constructed as a 2D cross-section with anatomically distinct
        tissue regions (white matter, gray matter, CSF, and skull), each assigned realistic
        attenuation coefficients (for CT) and tracer uptake values (for PET).
      </p>

      <h3>2. CT Simulation</h3>

      <p>Models the X-ray transmission process:</p>

      <table>
        <thead>
          <tr>
            <th>Step</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Forward projection</strong>
            </td>
            <td>
              Radon transform computes sinogram (line integrals of attenuation through the phantom
              at many angles)
            </td>
          </tr>
          <tr>
            <td>
              <strong>Noise model</strong>
            </td>
            <td>Poisson noise applied to photon counts to simulate detector statistics</td>
          </tr>
          <tr>
            <td>
              <strong>Reconstruction</strong>
            </td>
            <td>
              Filtered back-projection (FBP) with a ramp filter recovers the attenuation map from
              the sinogram
            </td>
          </tr>
        </tbody>
      </table>

      <h3>3. PET Simulation</h3>

      <p>Models the annihilation photon coincidence detection process:</p>

      <table>
        <thead>
          <tr>
            <th>Step</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Emission map</strong>
            </td>
            <td>Tracer activity distribution derived from the phantom's tissue uptake map</td>
          </tr>
          <tr>
            <td>
              <strong>Forward projection</strong>
            </td>
            <td>Sinogram generated from the emission map via Radon transform</td>
          </tr>
          <tr>
            <td>
              <strong>Attenuation correction</strong>
            </td>
            <td>
              CT-derived attenuation map used to correct PET coincidence data for photon absorption
            </td>
          </tr>
          <tr>
            <td>
              <strong>Noise model</strong>
            </td>
            <td>Poisson statistics applied to coincidence counts</td>
          </tr>
          <tr>
            <td>
              <strong>Reconstruction</strong>
            </td>
            <td>FBP reconstruction recovers the tracer distribution image</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>Key Concepts Demonstrated</h2>

      <ul>
        <li>
          <strong>Radon transform</strong> as the mathematical basis for both CT and PET forward
          projection
        </li>
        <li>
          <strong>Filtered back-projection</strong> as the classical analytic reconstruction
          algorithm
        </li>
        <li>
          <strong>Attenuation correction:</strong> why PET alone underestimates deep-tissue
          activity and how CT fixes it
        </li>
        <li>
          <strong>Poisson noise:</strong> why medical imaging statistics are shot-noise limited and
          how dose affects image quality
        </li>
      </ul>

      <hr />

      <h2>Running the Simulation</h2>

      <p>
        The easiest way is via the Binder link above. It launches a live Jupyter environment in
        your browser with no local setup required. Open <code>RunME.ipynb</code> and run cells top
        to bottom to step through phantom generation, CT simulation, and PET simulation with inline
        visualizations at each stage.
      </p>

      <p>To run locally:</p>

      <pre>
        <code>{`git clone https://github.com/Nick-Trigger/Pet-Scan-Simulator-303-Final-Project
cd Pet-Scan-Simulator-303-Final-Project
pip install -r requirements.txt
jupyter notebook RunME.ipynb`}</code>
      </pre>
    </ProjectLayout>
  );
}
