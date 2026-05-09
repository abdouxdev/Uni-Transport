import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
            <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium rounded-xl border border-border shadow-md bg-surface text-foreground' }} />
          </AuthProvider>
        </ThemeProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
)
