import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { CollectionProvider } from './context/CollectionContext'
import UserProvider from './context/UserContext'
import ErrorBoundary from './components/ErrorBoundary'
import { TooltipProvider } from './components/ui/tooltip'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true,v7_relativeSplatPath: true }}>
        <ThemeProvider defaultTheme="system" storageKey="cleanbag-theme">
          <AuthProvider>
            <CollectionProvider>
              <UserProvider>
                <TooltipProvider>
                <App/>
                </TooltipProvider>
              </UserProvider>
            </CollectionProvider>
            <Toaster position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)