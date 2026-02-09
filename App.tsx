
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública para login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rota protegida para o dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
