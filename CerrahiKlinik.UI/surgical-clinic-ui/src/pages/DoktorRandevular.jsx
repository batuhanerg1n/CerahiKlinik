import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  Search, Clock, FileText, CheckCircle2, XCircle, AlertTriangle,
  ChevronLeft, ChevronRight, User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoktorRandevular() {
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [tamamlaModal, setTamamlaModal] = useState({ isOpen: false, randevuId: null });
  const [doktorNotu, setDoktorNotu] = useState('');

  const [iptalOnayId, setIptalOnayId] = useState(null);

  useEffect(() => {
    fetchTumRandevular();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const fetchTumRandevular = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/DoktorPanel/randevularim');
      setRandevular(res.data?.items || res.data || []);
    } catch (err) {
      console.error('Randevular çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTamamlaSubmit = async () => {
    try {
      if (!tamamlaModal.randevuId) return;
      await axiosInstance.put(
        `/DoktorPanel/randevu/${tamamlaModal.randevuId}/tamamla`,
        { doktorNotu: doktorNotu }
      );
      setTamamlaModal({ isOpen: false, randevuId: null });
      setDoktorNotu('');
      fetchTumRandevular();
    } catch (err) {
      console.error('Randevu tamamlanamadı:', err);
      toast.error('İşlem başarısız oldu.');
    }
  };

  const handleIptalOnayla = async () => {
    const randevuId = iptalOnayId;
    setIptalOnayId(null);
    try {
      await axiosInstance.put(`/DoktorPanel/randevu/${randevuId}/iptal`);
      fetchTumRandevular();
    } catch (err) {
      console.error('Randevu iptal edilemedi:', err);
      toast.error('İşlem başarısız oldu.');
    }
  };

  const filteredRandevular = randevular.filter(r => {
    const aramaMetni = searchQuery.toLowerCase();
    const aramaUyuyor = searchQuery ? (
      r.hastaAd?.toLowerCase().includes(aramaMetni) ||
      r.hastaSoyad?.toLowerCase().includes(aramaMetni) ||
      r.islemAd?.toLowerCase().includes(aramaMetni)
    ) : true;
    const durumUyuyor = statusFilter ? r.durum?.toString() === statusFilter : true;
    return aramaUyuyor && durumUyuyor;
  });

  const totalPages = Math.ceil(filteredRandevular.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRandevular = filteredRandevular.slice(indexOfFirst, indexOfLast);

  const getDurumBadge = (durum) => {
    switch (durum) {
      case 1: return <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md uppercase font-bold">Bekliyor</span>;
      case 2: return <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase font-bold">Onaylandı</span>;
      case 3: return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase font-bold">Tamamlandı</span>;
      case 4: return <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md uppercase font-bold">İptal</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Randevularım</h1>
        <p className="text-sm text-slate-500">Tüm geçmiş ve gelecek muayenelerinizin listesi.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="relative w-full sm:w-1/2">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Hasta adı veya işlem ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer bg-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="1">Beklemede</option>
            <option value="2">Onaylandı</option>
            <option value="3">Tamamlandı</option>
            <option value="4">İptal</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Yükleniyor...</p>
        ) : currentRandevular.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Kritere uygun randevu bulunamadı.</p>
        ) : (
          <div className="space-y-3">
            {currentRandevular.map(r => (
              <div key={r.randevuId} className={`p-4 rounded-xl border-l-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition bg-slate-50/50 hover:bg-slate-50
                ${r.durum === 3 ? 'border-l-blue-500' : r.durum === 4 ? 'border-l-rose-500' : r.durum === 2 ? 'border-l-emerald-500' : 'border-l-amber-500'}
              `}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                    {r.hastaAd?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {r.hastaAd} {r.hastaSoyad}
                      {getDurumBadge(r.durum)}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-1">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(r.tarih).toLocaleDateString('tr-TR')} - {r.saat?.substring(0, 5)}</span>
                      <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {r.islemAd}</span>
                    </div>
                  </div>
                </div>

                {(r.durum === 1 || r.durum === 2) && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setTamamlaModal({ isOpen: true, randevuId: r.randevuId })}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-semibold transition"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Tamamla
                    </button>
                    <button
                      onClick={() => setIptalOnayId(r.randevuId)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-sm font-semibold transition"
                    >
                      <XCircle className="w-4 h-4" /> İptal
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === number
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {tamamlaModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Muayeneyi Tamamla</h3>
              <p className="text-xs text-slate-500 mt-1">Lütfen hastanın sistem kaydı için muayene notunuzu girin.</p>
            </div>
            <div className="p-5">
              <textarea
                rows="4"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Örn: Hastanın genel durumu iyi, reçete yazıldı..."
                value={doktorNotu}
                onChange={(e) => setDoktorNotu(e.target.value)}
              />
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => { setTamamlaModal({ isOpen: false, randevuId: null }); setDoktorNotu(''); }}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleTamamlaSubmit}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                >
                  Kaydet ve Tamamla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {iptalOnayId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIptalOnayId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Randevuyu İptal Et</h3>
              <p className="text-sm text-slate-500 mb-6">
                Bu randevuyu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIptalOnayId(null)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleIptalOnayla}
                  className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm transition"
                >
                  Evet, İptal Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}