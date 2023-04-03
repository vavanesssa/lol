import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Admin from './Admin';
import ErrorPage from './ErrorPage';
import PlayerView from './PlayerView';

const router = createBrowserRouter( [
  {
    path: "/",
    element: <Admin />,
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