import SmartLink from './SmartLink';

interface ExperienceCardProps {
  title: string;
  img?: string;
  desc: string;
  employer: string;
  url: string;
  badge?: string;
  tags?: string[];
  target?: string;
}

export default function ExperienceCard({
  title,
  img,
  desc,
  employer,
  url,
  badge,
  tags,
  target,
}: ExperienceCardProps) {
  const tagUrl = url.split('/').slice(0, -1).join('/') + '/tag';

  return (
    <div className="rounded-lg bg-base-100 hover:shadow-xl transition ease-in-out hover:scale-[102%]">
      <SmartLink to={url} target={target}>
        <div className="hero-content flex-col md:flex-row">
          {img && (
            <img
              src={img}
              width={750}
              height={422}
              alt={employer}
              className="fit-content max-w-full md:max-w-[13rem] rounded-lg bg-white"
            />
          )}
          <div className="grow w-full">
            <h1 className="text-xl font-bold">
              {title}
              {badge && <div className="badge badge-secondary mx-2">{badge}</div>}
            </h1>
            <p className="py-1 text-1xl">{employer}</p>
            <div className="flex">
              <div className="w-[15%]"></div>
              <p className="py-1 text-1xl">{desc}</p>
            </div>
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
