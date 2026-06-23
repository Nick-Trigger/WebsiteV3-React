import type { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Carousel from './Carousel';
import SmartLink from './SmartLink';

interface ProjectDoc {
  title: string;
  url: string;
  description?: string;
}

interface ProjectLayoutProps {
  title: string;
  description: string;
  heroImage?: string | string[];
  badge?: string;
  tags?: string[];
  githubUrl?: string;
  docs?: ProjectDoc[];
  children: ReactNode;
}

export default function ProjectLayout({
  title,
  description,
  heroImage,
  badge,
  tags = [],
  githubUrl,
  docs = [],
  children,
}: ProjectLayoutProps) {
  const images: string[] = Array.isArray(heroImage)
    ? heroImage
    : heroImage
      ? [heroImage]
      : [];
  const hasCarousel = images.length > 1;

  return (
    <BaseLayout title={`Nicholas Trigger - ${title}`} description={description}>
      {/* Hero */}
      <div className="mb-8">
        {images.length === 1 && (
          <div className="w-full rounded-xl overflow-hidden mb-6 bg-neutral shadow-2xl max-h-72 flex items-center justify-center">
            <img src={images[0]} alt={title} className="w-full object-contain max-h-72" />
          </div>
        )}

        {hasCarousel && <Carousel images={images} title={title} />}

        <div className="flex flex-wrap items-start gap-3 mb-3">
          <h1 className="text-4xl font-bold flex-1">{title}</h1>
          {badge && (
            <span className="badge badge-secondary text-sm self-start mt-2">{badge}</span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="badge badge-outline">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-base-content/80 text-lg mb-4">{description}</p>

        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        )}
      </div>

      <div className="divider my-2"></div>

      {/* Main content (prose-styled) */}
      <div
        className="prose prose-lg max-w-none
          prose-headings:font-bold
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
          prose-table:w-full
          prose-td:py-2 prose-td:px-3
          prose-th:py-2 prose-th:px-3
          prose-code:text-sm
          dark:prose-invert"
      >
        {children}
      </div>

      {/* Documents section */}
      {docs.length > 0 && (
        <>
          <div className="divider my-6"></div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Project Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <SmartLink
                  key={doc.title + doc.url}
                  to={doc.url}
                  target={doc.url.startsWith('http') ? '_blank' : undefined}
                  rel={doc.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="card bg-neutral shadow-md hover:shadow-xl transition-shadow border border-base-300 hover:border-primary no-underline"
                >
                  <div className="card-body p-4 gap-1">
                    <div className="flex items-center gap-2">
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
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span className="font-semibold">{doc.title}</span>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-base-content/70 m-0">{doc.description}</p>
                    )}
                  </div>
                </SmartLink>
              ))}
            </div>
          </div>
        </>
      )}
    </BaseLayout>
  );
}
