import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Admin from './Admin';
import Base from './Base';
import ErrorPage from './ErrorPage';
import PlayerView from './PlayerView';

const router = createBrowserRouter( [
  {
    path: "/old",
    element: <Admin />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <Base />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/players",
    element: <PlayerView />,
  },
] );
const App = () => {
  return (
    <RouterProvider router={ router } />
  );
};

export default App;