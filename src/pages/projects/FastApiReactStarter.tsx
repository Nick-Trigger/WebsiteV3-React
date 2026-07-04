import ProjectLayout from '../../components/ProjectLayout';
import SmartLink from '../../components/SmartLink';

export default function FastApiReactStarter() {
  return (
    <ProjectLayout
      title="FastAPI + React Starter Template"
      description="A batteries-included starter template for full-stack web apps: FastAPI backend with SQLAlchemy and Alembic, React 19 + TypeScript frontend, Dockerized PostgreSQL, and a one-command Windows dev workflow."
      badge="Template"
      tags={['Python', 'FastAPI', 'SQLAlchemy', 'Alembic', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'PowerShell']}
      githubUrl="https://github.com/Nick-Trigger/FastAPI_and_React_Starter_Template"
    >
      <h2>Overview</h2>

      <p>
        Starting a new full-stack project usually means an afternoon of plumbing: wiring CORS,
        getting migrations to find your models, teaching your settings loader about{' '}
        <code>.env</code> files, and remembering the exact incantation to boot three services at
        once. This template packages all of that as a GitHub template repository — click{' '}
        <strong>"Use this template"</strong>, rename a placeholder, and start writing features.
      </p>

      <h3>What's included</h3>

      <ul>
        <li>
          <strong>Backend.</strong> Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic migrations,
          managed with <code>uv</code>.
        </li>
        <li>
          <strong>Frontend.</strong> React 19 + TypeScript with the React Compiler, built with
          Vite.
        </li>
        <li>
          <strong>Database.</strong> PostgreSQL 16 in Docker via <code>docker-compose</code>.
        </li>
        <li>
          <strong>Wired up out of the box.</strong> CORS configured, Alembic reads the DB URL from{' '}
          <code>.env</code>, settings load via <code>pydantic-settings</code>, and OpenAPI docs are
          auto-generated.
        </li>
        <li>
          <strong>One-command dev workflow.</strong> <code>dev.ps1</code> spins up Postgres and
          opens the backend and frontend in Windows Terminal tabs; <code>reset_db.ps1</code> wipes
          and rebuilds the local database in one shot.
        </li>
      </ul>

      <hr />

      <h2>Project Structure</h2>

      <p>
        The backend keeps a strict separation of concerns: <code>models.py</code> for ORM models,{' '}
        <code>schemas.py</code> for Pydantic request/response shapes, <code>routers/</code> for
        endpoints, and <code>config.py</code> for env-driven settings. The frontend is a standard
        Vite + React workspace. Docker Compose, the dev scripts, and a shared{' '}
        <code>.env.example</code> live at the root.
      </p>

      <hr />

      <h2>Design Decisions</h2>

      <ul>
        <li>
          <strong>Credentials never live in committed files.</strong> The{' '}
          <code>sqlalchemy.url</code> field in <code>alembic.ini</code> is intentionally blank;{' '}
          <code>alembic/env.py</code> injects <code>DATABASE_URL</code> from <code>.env</code>{' '}
          before any engine is created.
        </li>
        <li>
          <strong>Migrations can't silently miss tables.</strong> <code>alembic/env.py</code>{' '}
          imports <code>app.models</code> so every model class registers itself with{' '}
          <code>Base.metadata</code>, which is what autogenerate scans.
        </li>
        <li>
          <strong>React Compiler by default.</strong> Components are auto-memoized at build time;
          the ESLint plugin flags Rules-of-React violations.
        </li>
        <li>
          <strong>Disposable local database.</strong> <code>reset_db.ps1</code> drops the Postgres
          volume and re-applies every migration from scratch — the escape hatch for bad seed data
          or a half-applied migration.
        </li>
      </ul>

      <hr />

      <h2>Developer Experience</h2>

      <p>
        A single <code>.\dev.ps1</code> boots the whole stack: Postgres detached on port 5432, the
        FastAPI backend (with Swagger UI at <code>/docs</code>) and the Vite frontend each in their
        own Windows Terminal tab. The README documents first-time setup, common tasks (adding
        dependencies, creating migrations, running <code>pytest</code>), a renaming checklist for
        rebranding the <code>planner</code> placeholder, and a troubleshooting section covering the
        Windows papercuts that actually bite — stale PATHs, Pylance interpreter selection, and
        Notepad's infamous <code>.env.txt</code>.
      </p>

      <p>
        I used this template to build <SmartLink to="/projects/web-planner">Web Planner</SmartLink>, a personal
        calendar and task-planning app.
      </p>
    </ProjectLayout>
  );
}
