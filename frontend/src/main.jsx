import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ThemeContextProvider from "./context/ThemeContext";
import AuthProvider from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <ThemeContextProvider>
      <AuthProvider>
      <Toaster position="top-right" />
    <App />
      </AuthProvider>
    </ThemeContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
