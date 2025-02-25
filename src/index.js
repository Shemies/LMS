import React from 'react';
import ReactDOM from 'react-dom/client'; // Use the new createRoot API
import App from './App';
import { AuthProvider } from './AuthContext'; // Ensure this path is correct

const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
