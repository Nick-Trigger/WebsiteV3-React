import { Link, useLocation } from 'react-router-dom';

const cvSections = [
  ['profile', 'Profile'],
  ['education', 'Education'],
  ['engineering-experience', 'Engineering Experience'],
  ['research-experience', 'Research Experience'],
  ['patents', 'Patents'],
  ['leadership', 'Leadership'],
  ['certifications', 'Certifications'],
  ['skills', 'Skills'],
] as const;

export default function SidebarMenu() {
  const { pathname } = useLocation();

  const active = (test: boolean) =>
    `py-3 my-0.5 text-base${test ? ' bg-primary text-white' : ''}`;

  const onCv = /^\/cv/.test(pathname);

  return (
    <ul className="menu grow shrink menu-md overflow-y-auto flex flex-col items-start w-full items-stretch">
      <li>
        <Link className={active(pathname === '/')} to="/">
          Home
        </Link>
      </li>
      <li>
        <Link className={active(/^\/projects/.test(pathname))} to="/projects">
          Projects
        </Link>
      </li>
      <li>
        <Link className={active(onCv)} to="/cv">
          CV
        </Link>
        {onCv && (
          <ul className="pl-2 border-l border-base-content/20 ml-3">
            {cvSections.map(([id, label]) => (
              <li key={id}>
                {/* Plain anchor so the browser scrolls natively to the section */}
                <a className="py-1.5 text-sm" href={`/cv#${id}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    </ul>
  );
}
