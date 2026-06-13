import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";

// 1. Automatically detect if we are running locally or in production
const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// 2. Attach it to the global window object so your Axios clients can read it easily
window.__API_URL__ = BASE_URL;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);