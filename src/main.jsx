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
// Phase 2: country / i18n
import { CountryProvider } from "./context/CountryContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <CountryProvider>
      <RouterProvider router={router} />
    </CountryProvider>
  </Provider>,
  // </StrictMode>,
);
