import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './styles/global.css';

// vite-react-ssg builds the router from `routes` and prerenders each path.
export const createRoot = ViteReactSSG({ routes });
