import type { ReactNode } from 'react';

interface TimeLineProps {
  title: string;
  subtitle?: string;
  buttonLink?: string;
  separator?: ReactNode;
  children?: ReactNode;
}

export default function TimeLine({ title, subtitle, buttonLink, separator, children }: TimeLineProps) {

  return (
    <div className="flex">
      <div className="education__time">
        <span className="w-4 h-4 bg-primary block rounded-full mt-1"></span>
        <span className="education__line bg-primary block h-full w-[2px] translate-x-[7px]"></span>
      </div>
      <div className="experience__data bd-grid px-5">
        <h3 className="font-semibold mb-1">{title}</h3>
        <span className="font-light text-sm">
          {buttonLink && <a href={buttonLink} className="ml-2 text-secondary hover:underline">{`\u00A0🔗 View Project\u00A0`}</a>}
          {separator && <span className="ml-2">{`\u00A0${separator}\u00A0`}</span>}
          {subtitle && <span className="ml-2">{`\u00A0${subtitle}\u00A0`}</span>}
        </span>
        {children && <div className="my-2 text-justify">{children}</div>}
      </div>
    </div>
  );
}
