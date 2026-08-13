import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Stethoscope, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg('');

  try {
    const response = await axiosInstance.post('/Auth/login', {
      email,
      password
    });

    const data = response.data;
    const token = typeof data === 'string' ? data : (data.token || data.accessToken || data.jwt);

    if (token) {
      login(token, {
        email: data.email || email,
        rol: data.rol || data.role || 'Admin',
        ad: data.ad || 'Kullanıcı',
        soyad: data.soyad || ''
      });
      navigate('/dashboard');
    } else {
      setErrorMsg('Giriş başarılı fakat token alınamadı.');
    }
  } catch (err) {
    console.error("Login Hatası:", err);
    setErrorMsg(
      err.response?.data?.message || 'Giriş yapılırken bir hata oluştu.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl mb-3">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Personel Paneli</h1>
          <p className="text-slate-500 text-sm mt-1">SurgicalClinic Yönetim Sistemi</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta Adresi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                placeholder="ornek@klinik.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">
            ← Online Randevu Sayfasına Dön
          </a>
        </div>

      </div>
    </div>
  );
}