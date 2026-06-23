import type { RouteRecord } from 'vite-react-ssg';

import Home from './pages/Home';
import Projects from './pages/Projects';
import Cv from './pages/Cv';
import NotFound from './pages/NotFound';

import Arm from './pages/projects/Arm';
import ArmApplication from './pages/projects/ArmApplication';
import Clabsi from './pages/projects/Clabsi';
import ClabsiDhf from './pages/projects/ClabsiDhf';
import ClabsiPoster from './pages/projects/ClabsiPoster';
import Dog from './pages/projects/Dog';
import DogPosters from './pages/projects/DogPosters';
import ChipTester from './pages/projects/ChipTester';
import Ecg from './pages/projects/Ecg';
import FactoryScheduler from './pages/projects/FactoryScheduler';
import PetCtSim from './pages/projects/PetCtSim';

export const routes: RouteRecord[] = [
  { path: '/', element: <Home /> },
  { path: 'projects', element: <Projects /> },
  { path: 'cv', element: <Cv /> },

  { path: 'projects/arm', element: <Arm /> },
  { path: 'projects/arm/application', element: <ArmApplication /> },
  { path: 'projects/clabsi', element: <Clabsi /> },
  { path: 'projects/clabsi/dhf', element: <ClabsiDhf /> },
  { path: 'projects/clabsi/poster', element: <ClabsiPoster /> },
  { path: 'projects/dog', element: <Dog /> },
  { path: 'projects/dog/posters', element: <DogPosters /> },
  { path: 'projects/chip-tester', element: <ChipTester /> },
  { path: 'projects/ecg', element: <Ecg /> },
  { path: 'projects/factory-scheduler', element: <FactoryScheduler /> },
  { path: 'projects/pet-ct-sim', element: <PetCtSim /> },

  // Prerendered so GitHub Pages can serve it as 404.html (see scripts/postbuild.mjs).
  { path: '404', element: <NotFound /> },
  // Client-side catch-all for any other unknown path.
  { path: '*', element: <NotFound /> },
];
