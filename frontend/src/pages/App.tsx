import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./HomePage/index.tsx";
import Settings from "./Settings/index.tsx";

const App = () => {
  const router = createBrowserRouter([
    { path: "/", element: <HomePage /> },
    { path: "/settings", element: <Settings /> },
  ]);
  return <RouterProvider router={router} />;
};

export default App;
