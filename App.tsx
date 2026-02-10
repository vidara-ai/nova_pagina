
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Configuracoes from './pages/Configuracoes';
import ImovelForm from './pages/ImovelForm';
import Imoveis from './pages/Imoveis';
import Leads from './pages/Leads';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública inicial */}
          <Route path="/" element={<Home />} />
          
          {/* Rota pública para login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/leads" 
            element={
              <PrivateRoute>
                <Leads />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/imoveis" 
            element={
              <PrivateRoute>
                <Imoveis />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/imoveis/novo" 
            element={
              <PrivateRoute>
                <ImovelForm />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/configuracoes" 
            element={
              <PrivateRoute>
                <Configuracoes />
              </PrivateRoute>
            } 
          />
          
          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
