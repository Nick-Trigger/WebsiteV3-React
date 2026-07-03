import BaseLayout from '../components/BaseLayout';
import {FeaturedProjects, MainProjects} from '../components/ProjectComponets'

export default function Projects() {
  return (
    <BaseLayout title="Nicholas Trigger - Projects">
      <div>
        <div className="text-3xl w-full font-bold mb-5">Featured Projects</div>
      </div>

      <FeaturedProjects />

      <div>
        <div className="text-3xl w-full font-bold mb-5 mt-10">All Projects</div>
      </div>

      <MainProjects />

    </BaseLayout>
  );
}