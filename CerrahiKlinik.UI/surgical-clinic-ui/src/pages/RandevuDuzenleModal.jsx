import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { X, Calendar, Activity, Save } from 'lucide-react';

const MESAI_SAATLERI = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"
];

export default function RandevuDuzenleModal({ randevu, onClose, onSuccess }) {
  const [doktorlar, setDoktorlar] = useState([]);
  const [islemler, setIslemler] = useState([]);
  const [kaydediyor, setKaydediyor] = useState(false);

  const [doktorId, setDoktorId] = useState('');
  const [islemId, setIslemId] = useState('');
  const [islemSecenekId, setIslemSecenekId] = useState('');
  const [tarih, setTarih] = useState('');
  const [saat, setSaat] = useState('');
  const [hastaNotu, setHastaNotu] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, iRes] = await Promise.all([
          axiosInstance.get('/Public/doktorlar'),
          axiosInstance.get('/Public/islem')
        ]);
        setDoktorlar(dRes.data || []);
        setIslemler(iRes.data || []);
      } catch (err) {
        console.error('Veri çekilemedi:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!randevu) return;
    setDoktorId(String(randevu.doktorId || ''));
    setIslemId(String(randevu.islemId || ''));
    setIslemSecenekId(randevu.islemSecenekId ? String(randevu.islemSecenekId) : '');
    setTarih(randevu.tarih ? randevu.tarih.split('T')[0] : '');
    setSaat(randevu.saat ? randevu.saat.substring(0, 5) : '');
    setHastaNotu(randevu.hastaNotu || '');
  }, [randevu]);

  const seciliIslem = islemler.find(i => i.id === parseInt(islemId));
  const seciliSecenek = seciliIslem?.secenekler?.find(s => s.id === parseInt(islemSecenekId));
  const gosterilecekFiyat = seciliIslem
    ? (seciliIslem.fiyatTipi === 2 ? (seciliSecenek?.fiyat ?? null) : seciliIslem.fiyat)
    : null;

  const formatMoney = (a) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(a || 0);

  const handleIslemChange = (val) => {
    setIslemId(val);
    setIslemSecenekId('');
  };

  const handleKaydet = async () => {
    if (!doktorId || !islemId || !tarih || !saat) {
      toast.error('Doktor, işlem, tarih ve saat zorunludur.');
      return;
    }
    if (seciliIslem?.fiyatTipi === 2 && !islemSecenekId) {
      toast.error('Lütfen bir seçenek belirleyin.');
      return;
    }

    const payload = {
      doktorId: parseInt(doktorId),
      islemId: parseInt(islemId),
      islemSecenekId: islemSecenekId ? parseInt(islemSecenekId) : null,
      tarih: `${tarih}T00:00:00.000Z`,
      saat: `${saat}:00`,
      hastaNotu: hastaNotu
    };

    try {
      setKaydediyor(true);
      await axiosInstance.put(`/PersonelPanel/randevular/${randevu.id}`, payload);
      toast.success('Randevu güncellendi.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Randevu güncellenemedi:', err);
      toast.error(err.response?.data?.message || 'Randevu güncellenirken hata oluştu.');
    } finally {
      setKaydediyor(false);
    }
  };

  if (!randevu) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Randevu Düzenle</h3>
            <p className="text-xs text-slate-500 mt-0.5">{randevu.hastaAd} {randevu.hastaSoyad}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Hekim ve İşlem
            </h4>
            <div className="space-y-3">
              <select value={doktorId} onChange={(e) => setDoktorId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">-- Hekim Seçiniz --</option>
                {doktorlar.map(d => <option key={d.id} value={d.id}>{d.unvan} {d.ad} {d.soyad}</option>)}
              </select>

              <select value={islemId} onChange={(e) => handleIslemChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">-- İşlem Seçiniz --</option>
                {islemler.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.ad} {i.fiyatTipi === 2 ? '(Seçenekli)' : `(${formatMoney(i.fiyat)})`}
                  </option>
                ))}
              </select>

              {seciliIslem?.fiyatTipi === 2 && (
                <select value={islemSecenekId} onChange={(e) => setIslemSecenekId(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="">-- Seçenek Belirleyiniz --</option>
                  {seciliIslem.secenekler.map(s => (
                    <option key={s.id} value={s.id}>{s.secenekAd} - {formatMoney(s.fiyat)}</option>
                  ))}
                </select>
              )}

              {gosterilecekFiyat !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-700">Tahmini Ücret</span>
                  <span className="text-lg font-bold text-blue-800">{formatMoney(gosterilecekFiyat)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Tarih ve Saat
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <select value={saat} onChange={(e) => setSaat(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">-- Saat --</option>
                {MESAI_SAATLERI.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Not</label>
            <textarea rows="2" value={hastaNotu} onChange={(e) => setHastaNotu(e.target.value)}
              placeholder="Randevu notu..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
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
  );
}