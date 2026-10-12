//src/main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./route/index";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import "./styles/editor.css";
import { reloadOnceForNewDeploy } from "./utils/lazyRetry.js";
// Phase 2: country / i18n
import { CountryProvider } from "./context/CountryContext.jsx";

// Stale-deploy chunk errors (see utils/lazyRetry.js) — also catch Vite's own
// preload failure event so CSS/modulepreload misses recover the same way.
window.addEventListener("vite:preloadError", (e) => {
  if (reloadOnceForNewDeploy()) e.preventDefault();
});

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <CountryProvider>
      <RouterProvider router={router} />
    </CountryProvider>
  </Provider>,
  // </StrictMode>,
);
