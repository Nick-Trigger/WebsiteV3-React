import HorizontalCard from './HorizontalCard';
import { projects, type Project } from '../data/projects';

export const ProjectCards = ({ items }: { items: Project[] }) => {
  return (
    <>
      {items.map((p, i) => (
        <div
          key={p.title}
          className="card-enter"
          style={{ '--card-index': i } as React.CSSProperties}
        >
          {i > 0 && <div className="divider my-0"></div>}
          <HorizontalCard
            title={p.title}
            img={p.img}
            media={p.Media ? <p.Media /> : undefined}
            desc={p.desc}
            url={p.url}
            badge={p.badge}
            badges={p.badges}
            target={p.target}
            featured={p.featured}
          />
        </div>
      ))}
    </>
  );
};

export const FeaturedProjects = () => {
  return <ProjectCards items={projects.filter((p) => p.featured)} />;
};
