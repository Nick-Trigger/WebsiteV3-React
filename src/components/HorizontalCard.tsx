import SmartLink from './SmartLink';
import type { ReactNode } from 'react';

interface HorizontalCardProps {
  title: string;
  img?: string;
  desc: string;
  url: string;
  badge?: string;
  tags?: string[];
  target?: string;
}

export default function HorizontalCard({
  title,
  img,
  media,
  desc,
  url,
  badge,
  tags,
  target,
}: HorizontalCardProps) {
  const tagUrl = url.split('/').slice(0, -1).join('/') + '/tag';

  return (
    <div className="rounded-lg bg-base-100 hover:shadow-xl transition ease-in-out hover:scale-[102%]">
      <SmartLink to={url} target={target}>
        <div className="hero-content flex-col md:flex-row">
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
          <div className="grow w-full">
            <h1 className="text-xl font-bold">
              {title}
              {badge && <div className="badge badge-primary mx-2">{badge}</div>}
            </h1>
            <p className="py-1 text-1xl">{desc}</p>
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
