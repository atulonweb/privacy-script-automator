
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create root using ReactDOM's createRoot API
const container = document.getElementById('root');
const root = createRoot(container!);

// Properly wrap App with React.StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
