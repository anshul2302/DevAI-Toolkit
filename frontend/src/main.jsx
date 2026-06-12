import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#35363b',
            color: '#e2e3e5',
            border: '1px solid #4d4e57',
          },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
