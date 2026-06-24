import { Head } from 'vite-react-ssg';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_AUTHOR } from '../config';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
}

/**
 * Per-page document head. vite-react-ssg extracts <Head> contents into the
 * prerendered HTML so titles/meta are present without client JS.
 */
export default function Seo({
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  image = '/social_img.png',
}: SeoProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="author" content={SITE_AUTHOR} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
