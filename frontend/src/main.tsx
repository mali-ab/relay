import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import './index.css'
import { router } from "./routes/router";

import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);