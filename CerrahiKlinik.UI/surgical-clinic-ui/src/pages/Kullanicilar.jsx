import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import {
  Plus, Trash2, X, Save, Users, Mail, Shield, User, Eye, EyeOff
} from 'lucide-react';

export default function Kullanicilar() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [rol, setRol] = useState(2);  
  const [sifreGoster, setSifreGoster] = useState(false);

  useEffect(() => {
    fetchKullanicilar();
  }, []);

  const fetchKullanicilar = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/PersonelPanel/kullanicilar');
      setKullanicilar(res.data || []);
    } catch (err) {
      console.error('Kullanıcılar çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAd(''); setSoyad(''); setEmail(''); setSifre(''); setRol(2); setSifreGoster(false);
  };

  const acModal = () => { resetForm(); setModalAcik(true); };
  const kapatModal = () => { setModalAcik(false); resetForm(); };

  const handleKaydet = async () => {
    if (!ad.trim() || !soyad.trim()) { toast.error('Ad ve soyad zorunludur.'); return; }
    if (!email.trim()) { toast.error('Email zorunludur.'); return; }
    if (!sifre.trim() || sifre.length < 4) { toast.error('Şifre en az 4 karakter olmalı.'); return; }

    const payload = {
      ad: ad.trim(),
      soyad: soyad.trim(),
      email: email.trim(),
      sifre: sifre,
      rol: rol
    };

    try {
      setKaydediyor(true);
      await axiosInstance.post('/PersonelPanel/kullanicilar', payload);
      toast.success('Kullanıcı oluşturuldu.');
      kapatModal();
      fetchKullanicilar();
    } catch (err) {
      console.error('Kullanıcı eklenemedi:', err);
      toast.error(err.response?.data?.message || 'Kullanıcı eklenirken hata oluştu.');
    } finally {
      setKaydediyor(false);
    }
  };

  const handleSil = (k) => {
    setConfirmData({
      baslik: 'Kullanıcıyı Sil',
      mesaj: `${k.ad} ${k.soyad} adlı kullanıcıyı silmek istediğinize emin misiniz?`,
      onaylaText: 'Evet, Sil',
      onConfirm: () => kullaniciSil(k.id)
    });
  };

  const kullaniciSil = async (id) => {
    try {
      await axiosInstance.delete(`/PersonelPanel/kullanicilar/${id}`);
      toast.success('Kullanıcı silindi.');
      fetchKullanicilar();
    } catch (err) {
      console.error('Kullanıcı silinemedi:', err);
      toast.error('Kullanıcı silinemedi.');
    }
  };

  const rolBadge = (rolId) => {
    if (rolId === 1) return <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
    return <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><User className="w-3 h-3" /> Personel</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-slate-700" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kullanıcılar</h1>
            <p className="text-sm text-slate-500">Yönetici ve personel hesaplarını yönetin.</p>
          </div>
        </div>
        <button
          onClick={acModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition"
        >
          <Plus className="w-5 h-5" /> Yeni Kullanıcı
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
      ) : kullanicilar.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          Henüz kullanıcı yok.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kullanicilar.map(k => (
            <div key={k.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                    {k.ad?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{k.ad} {k.soyad}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" /> {k.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSil(k)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3">
                {rolBadge(k.rol)}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAcik && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800 text-lg">Yeni Kullanıcı Ekle</h3>
              <button onClick={kapatModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Ad</label>
                  <input type="text" value={ad} onChange={(e) => setAd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Soyad</label>
                  <input type="text" value={soyad} onChange={(e) => setSoyad(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Email (giriş için)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="kullanici@klinik.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Şifre (giriş için)</label>
                <div className="relative">
                  <input
                    type={sifreGoster ? 'text' : 'password'}
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    placeholder="En az 4 karakter"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSifreGoster(!sifreGoster)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {sifreGoster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Rol</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRol(2)}
                    className={`p-3 rounded-xl border-2 text-left transition ${rol === 2 ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-800 text-sm">Personel</span>
                    </div>
                    <p className="text-xs text-slate-500">Randevu ve hasta işlemleri</p>
                  </button>
                  <button type="button" onClick={() => setRol(1)}
                    className={`p-3 rounded-xl border-2 text-left transition ${rol === 1 ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-800 text-sm">Admin</span>
                    </div>
                    <p className="text-xs text-slate-500">Tam yönetim yetkisi</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={kapatModal}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                  Vazgeç
                </button>
                <button onClick={handleKaydet} disabled={kaydediyor}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {kaydediyor ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal data={confirmData} onClose={() => setConfirmData(null)} />
    </div>
  );
}