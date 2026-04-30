import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AppProviders } from '@/app/providers/AppProviders';
import '@/styles/globals.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <AppProviders>
          <App />
          <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />
        </AppProviders>
      </BrowserRouter>
    </StrictMode>,
  );
}
