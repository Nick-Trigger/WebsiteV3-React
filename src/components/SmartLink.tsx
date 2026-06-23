import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SmartLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
}

/**
 * Renders a client-side <Link> for internal route paths and a plain <a> for
 * everything else (external URLs, mailto:/tel:, in-`public/` static files such
 * as PDFs and standalone .html, and bare `#` placeholders).
 */
export default function SmartLink({ to, children, ...rest }: SmartLinkProps) {
  const isRouterLink =
    to.startsWith('/') && !to.startsWith('//') && !/\.[a-z0-9]+($|[?#])/i.test(to);

  if (isRouterLink) {
    const { download: _download, ...linkRest } = rest;
    void _download;
    return (
      <Link to={to} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
}
