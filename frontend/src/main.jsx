import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ThemeContextProvider from "./context/ThemeContext";
import AuthProvider from "./context/AuthContext";
import { AppProvider } from "./context/AppContext.jsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <AuthProvider>
          <AppProvider>
          <Toaster position="top-right" />
          <App />
          </AppProvider>
        </AuthProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </StrictMode>
);
