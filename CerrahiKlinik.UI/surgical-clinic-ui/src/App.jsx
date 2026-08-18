import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext'; 

import ProtectedRoute from './components/ProtectedRoute'; 
import Layout from './components/Layout';               
import DoktorLayout from './components/DoktorLayout';   

import Dashboard from './pages/Dashboard';
import Randevular from './pages/Randevular';
import Login from './pages/Login';
import PublicHome from './pages/PublicHome'; 

import DoktorTakvim from './pages/DoktorTakvim';
import DoktorRandevular from './pages/DoktorRandevular';
import Ayarlar from './pages/Ayarlar';

function MainRoutes() {
  const { user } = useAuth(); 
  const role = Number(user?.rol);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PublicHome />} />

        <Route element={<ProtectedRoute />}>
          
          <Route path="/panel" element={
            role === 4 ? <Navigate to="/doktor/takvim" replace /> : <Navigate to="/dashboard" replace />
          } />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/randevular" element={<Randevular />} />
            <Route path="/ayarlar" element={<Ayarlar/>}/>
          </Route>

          <Route path="/doktor" element={<DoktorLayout />}>
            <Route path="takvim" element={<DoktorTakvim />} />
            <Route path="randevular" element={<DoktorRandevular />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <MainRoutes />
    </AuthProvider>
  );
}