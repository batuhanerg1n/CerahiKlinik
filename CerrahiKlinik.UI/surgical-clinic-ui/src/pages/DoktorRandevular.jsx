import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Search, Clock, FileText, CheckCircle2, History } from 'lucide-react';

export default function DoktorRandevular() {
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTumRandevular();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Randevularım</h1>
        <p className="text-sm text-slate-500">Tüm geçmiş ve gelecek muayenelerinizin listesi.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Yükleniyor...</p>
        ) : randevular.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Kayıtlı randevunuz bulunmamaktadır.</p>
        ) : (
          <div className="space-y-3">
            {randevular.map(r => (
              <div key={r.id} className={`p-4 rounded-xl border-l-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition bg-slate-50/50 hover:bg-slate-50
                ${r.durum === 3 ? 'border-l-blue-500' : r.durum === 4 ? 'border-l-rose-500' : 'border-l-emerald-500'}
              `}>
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {r.hastaAd} {r.hastaSoyad}
                    {r.durum === 3 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase font-bold">Tamamlandı</span>}
                    {r.durum === 4 && <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md uppercase font-bold">İptal</span>}
                    {r.durum !== 3 && r.durum !== 4 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase font-bold">Bekliyor</span>}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {new Date(r.tarih).toLocaleDateString('tr-TR')} - {r.saat?.substring(0,5)}</span>
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> {r.islemAd}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}