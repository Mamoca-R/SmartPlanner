import React from 'react';
// Removed Toaster, ThemeProvider, Layout imports as they are handled higher up
import AppRoutes from './routes/AppRoutes';

function App() {
  // AppRoutes now handles Layout application via ProtectedRoute
  return (
    <AppRoutes />
  );
}

export default App;
