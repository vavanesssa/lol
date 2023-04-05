import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Admin from './Admin';
import ErrorPage from './ErrorPage';

const router = createBrowserRouter( [
  {
    path: "/",
    element: <Admin />,
    errorElement: <ErrorPage />,
  },
] );
const App = () => {
  return (
    <RouterProvider router={ router } />
  );
};

export default App;