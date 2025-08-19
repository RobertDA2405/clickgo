import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // 👈 debe ser `App.tsx` o `App.jsx`, NO `.vue`
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
