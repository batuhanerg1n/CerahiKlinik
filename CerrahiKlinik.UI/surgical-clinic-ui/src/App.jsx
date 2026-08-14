import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// AuthProvider'ı import etmeyi unutmuyoruz! Yolu kendi dosyana göre ayarla:
import { AuthProvider } from './context/AuthContext'; 

import ProtectedRoute from './components/ProtectedRoute'; 
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Randevular from './pages/Randevular';
import Login from './pages/Login';
import PublicHome from './pages/PublicHome'; 

function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PublicHome />} />

          <Route element={<ProtectedRoute />}>
            
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/randevular" element={<Randevular />} />
            </Route>

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRoutes;