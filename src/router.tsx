import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { olympicLoader } from './services/olympicService';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    loader: olympicLoader,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
