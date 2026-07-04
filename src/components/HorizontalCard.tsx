import SmartLink from './SmartLink';

interface HorizontalCardProps {
  title: string;
  img?: string;
  media?: React.ReactNode;
  desc: string;
  url: string;
  /** A single badge; use `badges` for several. Rendered after the description. */
  badge?: string;
  badges?: string[];
  tags?: string[];
  target?: string;
  /** Featured items get a star next to the title. */
  featured?: boolean;
}

export default function HorizontalCard({
  title,
  img,
  media,
  desc,
  url,
  badge,
  badges,
  tags,
  target,
  featured,
}: HorizontalCardProps) {
  const tagUrl = url.split('/').slice(0, -1).join('/') + '/tag';
  // With media the row can get tall, so pin the text to the top instead of
  // centering it (only on md+, where the layout is a row).
  const hasMedia = Boolean(media || img);
  const badgeList = badges ?? (badge ? [badge] : []);

  return (
    <div className="rounded-lg bg-base-100 hover:shadow-xl transition ease-in-out hover:scale-[102%]">
      <SmartLink to={url} target={target}>
        <div
          className={`hero-content flex-col md:flex-row ${hasMedia ? 'md:items-start' : ''}`}
        >
          {media ? (
            <div className="w-full md:max-w-[13rem] md:min-w-[13rem] aspect-[13/9] rounded-lg overflow-hidden bg-neutral-content">
              {media}
            </div>
          ) : (
            img && (
              <img
                src={img}
                width={750}
                height={422}
                alt={title}
                className="object-scale-down md:max-w-[13rem] md:min-w-[13rem] md:max-h-[9rem] rounded-lg bg-neutral-content"
              />
            )
          )}
          <div className="grow w-full ">
            <h1 className="text-xl font-bold">
              {featured && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-label="Featured project"
                  className="inline-block w-5 h-5 text-warning mr-1.5 -mt-1"
                >
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
              {title}
            </h1>
            <p className="py-1 text-1xl mt-auto">{desc}</p>
            {badgeList.length > 0 && (
              <div className="flex flex-wrap gap-2 py-1">
                {badgeList.map((b) => (
                  <div key={b} className="badge badge-primary">
                    {b}
                  </div>
                ))}
              </div>
            )}
            {tags && (
              <div className="card-actions justify-end">
                {tags.map((tag) => (
                  <SmartLink key={tag} to={`${tagUrl}/${tag}`} className="badge badge-outline">
                    {tag}
                  </SmartLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </SmartLink>
    </div>
  );
}
