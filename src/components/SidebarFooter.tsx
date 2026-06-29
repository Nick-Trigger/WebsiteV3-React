import ThemeToggle from './ThemeToggle';

export default function SidebarFooter() {
  return (
    <>
      <ThemeToggle />

      <div className="rounded-lg md:flex md:justify-center my-3 pb-3 pt-3 bg-base-300">
        <ul>
          <li className="text-center">
            <a href="tel:3614463005" aria-label="Phone" title="phone">
              <span className="text-lg">+1 (361) 446 3005</span>
            </a>
          </li>

          <li className="text-center">
            <a href="mailto:nicktrig124@gmail.com" aria-label="Email" title="Email">
              <span className="text-lg">nicktrig124@gmail.com</span>
            </a>
          </li>

          <li className="text-center">
            <div className="social-icons px-4 pb-2 pt-4 flex self-center justify-center sticky bottom-0">
              <a
                href="https://github.com/Nick-Trigger"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-3"
                aria-label="Github"
                title="Github"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  style={{ fill: 'currentColor' }}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/nick-trigger"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-3"
                aria-label="Linkedin"
                title="Linkedin"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  style={{ fill: 'currentColor' }}
                >
                  <circle cx="4.983" cy="5.009" r="2.188"></circle>
                  <path d="M9.237 8.855v12.139h3.769v-6.003c0-1.584.298-3.118 2.262-3.118 1.937 0 1.961 1.811 1.961 3.218v5.904H21v-6.657c0-3.27-.704-5.783-4.526-5.783-1.835 0-3.065 1.007-3.568 1.96h-.051v-1.66H9.237zm-6.142 0H6.87v12.139H3.095z"></path>
                </svg>
              </a>
              <a
                href="https://orcid.org/0000-0001-6891-0746"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-3"
                aria-label="ORCID"
                title="ORCID"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 512 512"
                  style={{ fill: 'currentColor' }}
                >
                  <path d="M294.75 188.19h-45.92V342h47.47c67.62 0 83.12-51.34 83.12-76.91 0-41.64-26.54-76.9-84.67-76.9zM256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-80.79 360.76h-29.84v-207.5h29.84zm-14.92-231.14a19.57 19.57 0 1 1 19.57-19.57 19.64 19.64 0 0 1-19.57 19.57zM300 369h-81V161.26h80.6c76.73 0 110.44 54.83 110.44 103.85C410 318.39 368.38 369 300 369z"></path>
                </svg>
              </a>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}
