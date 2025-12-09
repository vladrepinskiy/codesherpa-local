import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setup } from "goober";
import "./index.css";
import { App } from "./App.tsx";
import { useTheme } from "./hooks/useTheme";

setup(
  React.createElement,
  undefined,
  useTheme,
  (props: Record<string, any>) => {
    for (const key in props) {
      if (key.startsWith("$")) {
        delete props[key];
      }
    }
  }
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
