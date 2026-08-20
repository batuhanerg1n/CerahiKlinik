import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  Plus, Search, X, Save, Users, Phone, Calendar, User, Edit3
} from 'lucide-react';

export default function Hastalar() {
  const [hastalar, setHastalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalAcik, setModalAcik] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [editId, setEditId] = useState(null);
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [dogumTarihi, setDogumTarihi] = useState('');
  const [notlar, setNotlar] = useState('');

  useEffect(() => {
    fetchHastalar();
  }, []);

  const fetchHastalar = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/PersonelPanel/hastalar');
      setHastalar(res.data || []);
    } catch (err) {
      console.error('Hastalar çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAd(''); setSoyad(''); setTelefon(''); setDogumTarihi(''); setNotlar('');
  };

  const acModal = () => { resetForm(); setEditId(null); setModalAcik(true); };

  const acDuzenleModal = (h) => {
    setEditId(h.id);
    setAd(h.ad || '');
    setSoyad(h.soyad || '');
    setTelefon(h.telefon || '');
    setDogumTarihi(h.dogumTarihi ? h.dogumTarihi.split('T')[0] : '');
    setNotlar(h.notlar || '');
    setModalAcik(true);
  };

  const kapatModal = () => { setModalAcik(false); setEditId(null); resetForm(); };

  const handleKaydet = async () => {
    if (!ad.trim() || !soyad.trim()) { toast.error('Ad ve soyad zorunludur.'); return; }
    if (!telefon.trim()) { toast.error('Telefon zorunludur.'); return; }

    const payload = {
      id: editId || 0,
      ad: ad.trim(),
      soyad: soyad.trim(),
      telefon: telefon.trim(),
      dogumTarihi: dogumTarihi ? `${dogumTarihi}T00:00:00` : null,
      notlar: notlar.trim()
    };

    try {
      setKaydediyor(true);
      await axiosInstance.post('/PersonelPanel/hastalar', payload);
      toast.success(editId ? 'Hasta güncellendi.' : 'Hasta eklendi.');
      kapatModal();
      fetchHastalar();
    } catch (err) {
      console.error('Hasta kaydedilemedi:', err);
      toast.error('Hasta kaydedilirken hata oluştu.');
    } finally {
      setKaydediyor(false);
    }
  };

  const filtered = hastalar.filter(h => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.ad?.toLowerCase().includes(q) ||
      h.soyad?.toLowerCase().includes(q) ||
      h.telefon?.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-slate-700" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hastalar</h1>
            <p className="text-sm text-slate-500">Hasta kayıtlarını görüntüleyin ve yönetin.</p>
          </div>
        </div>
        <button
          onClick={acModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition"
        >
          <Plus className="w-5 h-5" /> Yeni Hasta
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Hasta adı veya telefon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          {searchQuery ? 'Aramayla eşleşen hasta yok.' : 'Henüz hasta kaydı yok.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(h => (
            <div
              key={h.id}
              onClick={() => acDuzenleModal(h)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {h.ad?.charAt(0) || <User className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{h.ad} {h.soyad}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {h.telefon}
                  </p>
                </div>
                <Edit3 className="w-4 h-4 text-slate-300 ml-auto" />
              </div>
              {h.dogumTarihi && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(h.dogumTarihi).toLocaleDateString('tr-TR')}
                </p>
              )}
              {h.notlar && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{h.notlar}</p>}
            </div>
          ))}
        </div>
      )}

      {modalAcik && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800 text-lg">{editId ? 'Hastayı Düzenle' : 'Yeni Hasta Ekle'}</h3>
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
                <label className="block text-sm font-semibold text-slate-600 mb-1">Telefon</label>
                <input type="text" value={telefon} onChange={(e) => setTelefon(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Doğum Tarihi</label>
                <input type="date" value={dogumTarihi} onChange={(e) => setDogumTarihi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Notlar (opsiyonel)</label>
                <textarea rows="3" value={notlar} onChange={(e) => setNotlar(e.target.value)}
                  placeholder="Hasta ile ilgili notlar..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
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
    </div>
  );
}