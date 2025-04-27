import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx'; // Import ThemeProvider
import { AuthProvider } from './context/AuthContext.tsx';   // Import AuthProvider
import { Toaster } from 'sonner';                           // Import Toaster

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* Wrap with AuthProvider */}
        <ThemeProvider> {/* Wrap with ThemeProvider */}
          <App />
          <Toaster richColors position="top-right" /> {/* Add Toaster */}
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
