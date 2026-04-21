import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './debug/logs';
import './styles/toolkit.css';
import './styles/base.css';
import './styles/glass.css';
import './glasses-main';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
