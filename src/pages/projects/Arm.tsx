import ProjectLayout from '../../components/ProjectLayout';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const stlStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

function ClientStlViewer({ stlFile = '/alptArm.stl', color = '#20cfff' }: {
  stlFile?: string;
  color?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F0F0F0');

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    scene.add(light);

    const loader = new STLLoader();
    let mesh: THREE.Mesh | undefined;

    loader.load(
      stlFile,
      (geometry) => {
        geometry.computeBoundingBox();
        geometry.center();

        mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.1,
          }),
        );

        scene.add(mesh);

        const size = geometry.boundingBox?.getSize(new THREE.Vector3()).length() ?? 100;
        camera.position.set(0, 0, size * 1.5);
        camera.near = size / 100;
        camera.far = size * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
      },
      undefined,
      () => setError(true),
    );

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    let animationFrame = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controls.dispose();
      mesh?.geometry.dispose();
      if (mesh?.material instanceof THREE.Material) mesh.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ ...stlStyle, position: 'relative' }}>
      {error && <span>Unable to load the STL model.</span>}
    </div>
  );
}

export default function Arm() {
  return (
    <ProjectLayout
      title="Pulse Mate: Arterial Line Placement Training Device"
      description="A low-cost, single-operator radial arterial line placement trainer with electronic pulse simulation and touchscreen control. VentureWell E-Team, Duke University. Patent Pending."
      heroImage={['/PulseMateLogo-01.svg', '/alptprototype.jpg', '/alptbox2.png', '/alptCntrlopen_view2.png', '/3_2FRender.jpg', '/3_2BRender.jpg']}
      badge="VentureWell E-Team"
      tags={['Medical Device', 'Embedded Systems', 'Duke EGR', 'Patent Pending']}
      docs={[
        {
          title: 'VentureWell E-Team Application',
          url: '/projects/arm/application',
          description: 'Full team application submitted to VentureWell Summer 2023 Cohort',
        },
        {
          title: 'Video Demonstration',
          url: 'https://youtu.be/cOleKeZGHyg',
          description: 'Medium-fidelity prototype walkthrough and live demo',
        },
      ]}
    >
      <div className="not-prose flex flex-wrap gap-2 mb-6 text-sm text-base-content/70">
        <span>R. Blue · A. Gupta · C. Wyrtzen · N. Trigger</span>
        <span className="opacity-40">|</span>
        <span>Team PATS · Dept. of Biomedical Engineering, Duke University</span>
      </div>

      <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content"><strong>BOM Cost</strong></div>
          <div className="stat-value text-2xl text-primary">~$190</div>
          <div className="stat-desc text-base-content">Target sell: $500</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content"><strong>Throughput</strong></div>
          <div className="stat-value text-2xl text-secondary">50×/day</div>
          <div className="stat-desc text-base-content">Uses per day</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content"><strong>Skin Durability</strong></div>
          <div className="stat-value text-2xl text-accent">300+</div>
          <div className="stat-desc text-base-content">Punctures per wrap</div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content"><strong>Operators</strong></div>
          <div className="stat-value text-2xl text-info">1</div>
          <div className="stat-desc text-base-content">No assistant required</div>
        </div>
      </div>

      <h2>Problem</h2>

      <p>
        Arterial line insertion involves puncturing the radial artery and threading a catheter to
        continuously monitor inpatient blood pressure. A study of 357 incoming interns found that
        only <strong>36.7% had any training</strong> in arterial line insertion, averaging just{' '}
        <strong>one attempted insertion</strong> during all of medical school.
      </p>

      <p>
        Common complications from inadequate training include pain, swelling, and thrombosis.
        Major complications occur in ~1% of insertions, affecting an estimated{' '}
        <strong>19,617 patients annually</strong> in the US.
      </p>

      <p>
        Existing Arterial Line Placement Trainers (ALPTs) cost <strong>$700–$3,500</strong> and
        suffer from three key limitations:
      </p>

      <ol>
        <li>
          <strong>Require two operators:</strong> a second person must manually squeeze a bulb to
          simulate the pulse
        </li>
        <li>
          <strong>Reveal prior puncture sites:</strong> visible marks let trainees locate the
          artery by sight, removing the palpation task
        </li>
        <li>
          <strong>High cost:</strong> limits availability to well-funded simulation centers
        </li>
      </ol>

      <hr />

      <h2>Pulse Mate</h2>

      <p>
        Pulse Mate is a medium-fidelity ALPT built around a repurposed manikin arm. A silicone
        skin wrap covers tubing embedded in a tissue-simulating insertion medium above the wrist.
        Simulation blood fills the closed-loop tubing connecting a pump, the artificial artery, and
        a reservoir, creating a pulsatile feel driven entirely by the electronic control system.
      </p>

      <h3>Features</h3>

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
              <strong>Full procedure</strong>
            </td>
            <td>
              Catheter threading and guide wire insertion are possible; blood draws into the
              catheter canal like a real patient
            </td>
          </tr>
          <tr>
            <td>
              <strong>Troubleshooting</strong>
            </td>
            <td>
              Simulates realistic maneuvers taught during training (withdrawal, rotation,
              re-advance)
            </td>
          </tr>
          <tr>
            <td>
              <strong>Touchscreen UI</strong>
            </td>
            <td>
              Adjustable BPM, diastolic pressure, and systolic pressure (unique among ALPTs)
            </td>
          </tr>
          <tr>
            <td>
              <strong>Electronic pulse</strong>
            </td>
            <td>No second operator needed; pulse is generated by the onboard pump system</td>
          </tr>
          <tr>
            <td>
              <strong>Multiple skin tones</strong>
            </td>
            <td>Replaceable silicone wraps available in multiple tones</td>
          </tr>
          <tr>
            <td>
              <strong>Replaceable parts</strong>
            </td>
            <td>Skin wraps last 300+ punctures; internal tubing is also user-replaceable</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>Physician Validation</h2>

      <p>
        Tested with <strong>7 attending physicians and residents</strong> at Duke Hospital,
        advised by Dr. Carlos Falcon (Duke Simulation Specialist) and Dr. Ankeet Udani (Head of
        Duke Hospital Simulation Lab).
      </p>

      <div className="not-prose overflow-x-auto mb-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Question</th>
              <th>Mean ± SD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>How realistic does the arm look?</td>
              <td>5.87 ± 0.83</td>
            </tr>
            <tr>
              <td>How realistic does puncturing the arm feel?</td>
              <td>5.63 ± 1.60</td>
            </tr>
            <tr>
              <td>How realistic does the pulse feel?</td>
              <td>6.14 ± 0.38</td>
            </tr>
            <tr>
              <td>How realistic is the feedback after the artery is punctured?</td>
              <td>6.00 ± 0.93</td>
            </tr>
            <tr>
              <td>How easy was the device to use?</td>
              <td>6.38 ± 0.74</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-base-content/50 mt-1">
          Likert scale 1–7. n = 7 physicians and residents, Duke Hospital.
        </p>
      </div>

      <hr />

      <h2>Market Comparison</h2>

      <div className="not-prose overflow-x-auto mb-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Device</th>
              <th>Cost</th>
              <th>Pulse Control</th>
              <th>User Interface</th>
              <th>Operators</th>
              <th>Durability</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-semibold">
              <td>Pulse Mate</td>
              <td>$$</td>
              <td>Advanced (BPM + pressure)</td>
              <td>Touchscreen</td>
              <td>1</td>
              <td>Advanced (replaceable)</td>
            </tr>
            <tr>
              <td>Life Form Trainer</td>
              <td>$$$</td>
              <td>Elementary</td>
              <td>None</td>
              <td>2</td>
              <td>Elementary</td>
            </tr>
            <tr>
              <td>GTSImulators Trainer</td>
              <td>$$$$$</td>
              <td>Advanced</td>
              <td>None</td>
              <td>1</td>
              <td>Elementary</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr />

      <h2>Market</h2>
      
      
      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content"><strong>Total Available Market</strong></div>
          <div className="text-xl font-bold text-primary">$1.9B</div>
          <div className="text-sm text-base-content/70">
            Medical simulation market (2021); projected $3.2-$7.7B by 2027
          </div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content"><strong>Serviceable Available Market</strong></div>
          <div className="text-xl font-bold text-secondary">~350 facilities</div>
          <div className="text-sm text-base-content/70">
            200+ medical schools and 650+ simulation labs, filtered to simulation-focused
            institutions
          </div>
        </div>
        <div className="stat bg-base-300 rounded-xl p-4 shadow">
          <div className="stat-title text-xs text-base-content"><strong>Initial Target</strong></div>
          <div className="text-xl font-bold text-accent">$31–47K</div>
          <div className="text-sm text-base-content/70">
            2-3 units to 50 regional simulation labs at $500/unit
          </div>
        </div>
      </div>

      <hr />

      <h2>Revision 3</h2>

      <p>
        While this project is no longer active, the team started work on a third revision of the device, which was never completed. The goal was to the goal was to create a more robust and user-friendly version and to move toward fully custom arm phantoms. The team designed a new enclosure, control system, and arm phantom.
      </p>

        <h3 className="">Enclosure</h3>
        <p>Third revision of the enclosure.</p>
        <div
          className="not-prose rounded-xl overflow-hidden bg-neutral shadow-xl"
          style={{ height: '300px', display: 'flex', justifyContent: 'center' }}
        >
          <iframe
            title="Pulse Mate 3D model, revision 3"
            src="/3_2Rotate.html"
            width="1098"
            height="822"
            style={{
              border: 'none',
              display: 'block',
              transform: 'scale(0.45)',
              transformOrigin: 'top center',
              flexShrink: 0,
            }}
          ></iframe>
        </div>
        <h3 className="">Arm Phantom Internal</h3>
        <p>Internal structure of the designed forearm phantom.</p>
        <div className="">
          <ClientStlViewer stlFile="/alptArm.stl" color="#6d7eec" />
        </div>
    </ProjectLayout>
  );
}