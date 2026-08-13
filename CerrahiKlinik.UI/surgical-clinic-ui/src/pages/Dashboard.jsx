import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, LogOut, Stethoscope, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import RandevuModal from './RandevuModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const[isModalOpen, setIsModalOpen] =useState(false)
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchRandevular();
  }, []);

 const fetchRandevular = async (search = '') => {
  try {
    setLoading(true);
    const response = await axiosInstance.get('/PersonelPanel/randevular/search', {
      params: {
        query: search,
        pageIndex: 1,
        pageSize: 50
      }
    });

    console.log("Gelen Randevu Verisi:", response.data);

    const data = response.data?.items || response.data?.data || response.data || [];
    setRandevular(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Randevular yüklenirken hata oluştu:', err);
  } finally {
    setLoading(false);
  }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchRandevular(value);
  };

  const handleDurumGuncelle = async (id, yeniDurum) => {
    try {
      setActionLoadingId(id);
      await axiosInstance.put(`/PersonelPanel/randevular/${id}/durum`, null, {
        params: { drum: yeniDurum } 
      });
      
      fetchRandevular(searchQuery);
    } catch (err) {
      console.error('Durum güncellenirken hata oluştu:', err);
      alert('Randevu durumu güncellenemedi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getDurumBadge = (durum) => {
    switch (durum) {
      case 1:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Onaylandı</span>;
      case 2:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">İptal Edildi</span>;
      case 3:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Tamamlandı</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Beklemede</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">SurgicalClinic Panel</h1>
            <p className="text-xs text-slate-500">Hoş geldiniz, {user?.ad || user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>
      </header>

      <main className="max-w-7xl w-full mx-auto p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Toplam Randevu</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{randevular.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Aktif Hastalar</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {new Set(randevular.map((r) => r.hastaTelefon || r.hastaAd)).size}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Sistem Rolü</p>
              <h3 className="text-lg font-bold text-slate-800 mt-1 capitalize">{user?.rol || 'Admin'}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">Randevu Listesi</h2>
            
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Hasta adı veya telefon ara..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
              >
                + Yeni Randevu
              </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Hasta</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Doktor</th>
                  <th className="p-4">Tarih / Saat</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-slate-500">Yükleniyor...</td>
                  </tr>
                ) : randevular.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-slate-500">Randevu bulunamadı.</td>
                  </tr>
                ) : (
                  randevular.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-medium text-slate-900">{r.hastaAd} {r.hastaSoyad}</td>
                      <td className="p-4">{r.hastaTelefon}</td>
                      <td className="p-4">{r.doktorAdSoyad || r.doktorAd || r.doktorId}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{r.tarih?.substring(0, 10)} - {r.saat?.substring(0, 5)}</span>
                        </div>
                      </td>
                      <td className="p-4">{getDurumBadge(r.durum)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleDurumGuncelle(r.id, 1)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition"
                        >
                          Onayla
                        </button>
                        <button
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleDurumGuncelle(r.id, 2)}
                          className="px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                        >
                          İptal Et
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>
      <RandevuModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchRandevular()} 
      />
    </div>
  );
}