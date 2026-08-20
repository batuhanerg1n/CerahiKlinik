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

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await axiosInstance.post('/Auth/login', { email, password });
      
      const gelenToken = res.data.token || res.data; 

      if (gelenToken && typeof gelenToken === 'string') {
        
        const decodedData = decodeJWT(gelenToken);
        console.log("ÇÖZÜLMÜŞ TOKEN VERİSİ:", decodedData);

        const hamRol = decodedData.role || decodedData.Rol || decodedData.rol;
        let userRole = 3; 

        if (String(hamRol).toLowerCase() === 'doktor' || Number(hamRol) === 4) {
          userRole = 4;
        } else if (String(hamRol).toLowerCase() === 'admin' || Number(hamRol) === 1) {
          userRole = 1;
        } else if (String(hamRol).toLowerCase() === 'personel' || Number(hamRol) === 2) {
          userRole = 2;
        }

        let displayName = 'Doktor';
        if (decodedData.email) {
          const isimKismi = decodedData.email.split('@')[0];
          displayName = isimKismi.charAt(0).toUpperCase() + isimKismi.slice(1);
        }

        const temizUser = {
          ad: displayName,
          rol: userRole 
        };

        login(gelenToken, temizUser);

        if (userRole === 4) {
          navigate('/doktor/takvim', { replace: true });
        } else if (userRole === 2) {
          navigate('/personel/randevular', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }

      } else {
        setErrorMsg("API'den geçerli bir güvenlik anahtarı (Token) alınamadı.");
      }

    } catch (err) {
      console.error("GİRİŞ HATASI:", err);
      setErrorMsg('Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="p-8 border-b border-slate-100 bg-emerald-50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Surgical Clinic</h2>
          <p className="text-sm text-emerald-600 font-medium mt-1">Yönetim Paneline Giriş</p>
        </div>

        <div className="p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">E-posta Adresi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="ahmet@ornek.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Şifre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}