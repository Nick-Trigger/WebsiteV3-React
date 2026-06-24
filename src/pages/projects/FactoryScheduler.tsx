import ProjectLayout from '../../components/ProjectLayout';

export default function FactoryScheduler() {
  return (
    <ProjectLayout
      title="Factory Scheduling & KPI Reporting API"
      description="A constraint-based production scheduling service. It accepts a job-shop scheduling problem as JSON, returns a feasible schedule that minimizes total tardiness, and reports KPIs. A React frontend renders the result as an interactive Gantt chart."
      heroImage={['/favicon.svg']}
      badge="Full-Stack"
      tags={['Python', 'FastAPI', 'OR-Tools CP-SAT', 'React', 'TypeScript', 'Vite']}
      githubUrl="https://github.com/Nick-Trigger/Factory-Scheduling-and-KPI-Reporting-API-with-Frontend"
    >
      <h2>Overview</h2>

      <p>
        The Factory Scheduling & KPI Reporting service solves{' '}
        <strong>job-shop production scheduling</strong> as a constraint optimization problem. A
        client <code>POST</code>s a scheduling problem as JSON (products, routes, resources,
        working windows, and due dates), and the service returns a feasible schedule that minimizes
        total tardiness, along with a set of operational KPIs. A React frontend visualizes the
        result as an inline-SVG Gantt chart with per-product color coding.
      </p>

      <p>
        The system is built for extensibility. New client input/output formats, new objective
        functions, and new constraints each plug in as localized changes to a single file, without
        touching the solver core.
      </p>

      <hr />

      <h2>Tech Stack</h2>

      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Technologies</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Backend</strong>
            </td>
            <td>Python 3.12, FastAPI, OR-Tools CP-SAT solver, managed with <code>uv</code></td>
          </tr>
          <tr>
            <td>
              <strong>Frontend</strong>
            </td>
            <td>React 19 + TypeScript (React Compiler), built with Vite</td>
          </tr>
          <tr>
            <td>
              <strong>Styling</strong>
            </td>
            <td>TailwindCSS v4 + daisyUI v5</td>
          </tr>
          <tr>
            <td>
              <strong>Visualization</strong>
            </td>
            <td>Hand-rolled inline-SVG Gantt with per-product color coding</td>
          </tr>
          <tr>
            <td>
              <strong>CI</strong>
            </td>
            <td>GitHub Actions runs the test suite on every push and PR</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>The Scheduling Problem</h2>

      <p>
        The core engine is built on <strong>OR-Tools CP-SAT</strong>, chosen for its native
        support for interval variables, no-overlap constraints, and optional intervals. This made
        it a far better fit than a MIP or a hand-rolled heuristic.
      </p>

      <p>Key modeling decisions:</p>

      <ul>
        <li>
          <strong>Optional intervals.</strong> Each operation gets one optional interval per{' '}
          <code>(resource, working window)</code> pair, with conditional containment enforced via{' '}
          <code>only_enforce_if</code>.
        </li>
        <li>
          <strong>Resource selection.</strong> <code>add_exactly_one</code> over per-resource
          presence booleans.
        </li>
        <li>
          <strong>No-overlap.</strong> <code>add_no_overlap</code> per resource across all windows.
        </li>
        <li>
          <strong>Family-dependent changeovers.</strong> The standard disjunctive pattern: one
          boolean per unordered pair selects ordering, and the setup constraint for the chosen
          direction is enforced.
        </li>
        <li>
          <strong>Tardiness.</strong> <code>tardiness &gt;= last_op.end - due</code>, lower-bounded
          at zero, summed, and minimized.
        </li>
        <li>
          <strong>Determinism.</strong> A single search worker and a fixed random seed yield
          byte-identical output across runs.
        </li>
      </ul>

      <hr />

      <h2>Architecture</h2>

      <p>
        The system enforces a strict separation between <strong>canonical</strong> types
        (client-agnostic, used by the solver, KPIs, and validation) and <strong>adapter</strong>{' '}
        types (client-specific JSON shapes). Everything downstream of the adapter speaks the same
        vocabulary, regardless of which client sent the request.
      </p>

      <p>
        A <code>POST /schedule</code> request flows through six stages:
      </p>

      <ol>
        <li>
          <strong>Parse.</strong> The client adapter validates the JSON shape (Pydantic) and
          translates it into the canonical <code>SchedulingProblem</code>.
        </li>
        <li>
          <strong>Diagnose.</strong> Pre-solve structural checks flag common infeasibility causes
          (missing capabilities, windows too short, demand exceeding capacity, impossible
          deadlines) and short-circuit to a <code>422</code> with concrete reasons.
        </li>
        <li>
          <strong>Solve.</strong> CP-SAT builds the model by walking the constraint registry,
          applying the selected objective, and solving. It returns a canonical <code>Solution</code>
          .
        </li>
        <li>
          <strong>Compute KPIs.</strong> Tardiness, changeover count and minutes, makespan, and
          per-resource utilization.
        </li>
        <li>
          <strong>Validate.</strong> The validator re-walks the constraint registry, independently
          re-checking each invariant against the final solution to catch solver bugs.
        </li>
        <li>
          <strong>Format.</strong> The adapter translates the canonical solution and KPIs back into
          the client's response shape.
        </li>
      </ol>

      <p>
        Three plug-in registries follow the same pattern: <code>adapters/</code> (one file per wire
        format), <code>objectives/</code> (one file per objective function), and{' '}
        <code>constraints/</code> (one file per hard constraint). Adding a client, objective, or
        constraint is a localized change.
      </p>

      <hr />

      <h2>KPIs Reported</h2>

      <ul>
        <li>
          <strong>Tardiness.</strong> Total minutes late across all products.
        </li>
        <li>
          <strong>Changeover count & minutes.</strong> Family-boundary setups on each resource.
        </li>
        <li>
          <strong>Makespan.</strong> Latest end minus earliest start.
        </li>
        <li>
          <strong>Per-resource utilization.</strong> Processing minutes over horizon-clipped
          calendar minutes.
        </li>
      </ul>

      <hr />

      <h2>Frontend</h2>

      <p>
        The React frontend lets a user load the spec's example problem or upload a custom JSON
        payload, then renders the returned schedule as an inline-SVG Gantt chart with per-product
        color coding. The backend is fully usable on its own, via <code>curl</code>, Postman, or
        the auto-generated Swagger UI, without ever running the frontend.
      </p>

      <hr />

      <h2>Robustness</h2>

      <p>The service distinguishes three failure modes by response shape:</p>

      <ul>
        <li>
          <strong>
            <code>422</code> infeasible.
          </strong>{' '}
          The problem genuinely cannot be solved. The <code>why</code> field lists concrete,
          actionable reasons.
        </li>
        <li>
          <strong>
            <code>400</code> bad request.
          </strong>{' '}
          Client-side input errors, such as an unknown objective mode.
        </li>
        <li>
          <strong>
            <code>500</code> invariant error.
          </strong>{' '}
          A post-solve validation failure, representing a solver or model bug rather than user
          input.
        </li>
      </ul>

      <p>
        The test suite, run automatically in CI, covers a validation invariant test, a KPI math
        test, and an infeasibility test, mirroring the three tests required by the project spec.
      </p>
    </ProjectLayout>
  );
}
