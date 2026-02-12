import React from 'react';
import ReactDOM from 'react-dom/client';
import { AnimaProvider } from '@animaapp/playground-react-sdk';
import { ThemeProvider } from './contexts/ThemeContext';
import { MockAuthProvider } from './contexts/MockAuthContext';
import { isMockMode } from './utils/mockMode';
import App from './App';
import './index.css';

// Wrap with mock providers if in mock mode
const AppWithProviders = isMockMode() ? (
  <React.StrictMode>
    <MockAuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </MockAuthProvider>
  </React.StrictMode>
) : (
  <React.StrictMode>
    <AnimaProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AnimaProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('app')!).render(AppWithProviders);
