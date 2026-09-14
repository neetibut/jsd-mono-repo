import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Layout } from "./views/Layout";
import Home from "./views/Home";
import Owner from "./views/Owner";
import { AuthProvider } from "./contexts/AuthProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/owner", element: <Owner /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
