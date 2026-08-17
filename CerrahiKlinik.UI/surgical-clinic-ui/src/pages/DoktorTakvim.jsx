import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  Calendar as CalendarIcon, Clock, User, 
  FileText, CheckCircle2, ChevronLeft, ChevronRight, History 
} from 'lucide-react';

export default function DoktorTakvim() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [takvimRandevulari, setTakvimRandevulari] = useState([]);
  const [gunlukRandevular, setGunlukRandevular] = useState([]);
  const [loading, setLoading] = useState(false);

  const [tamamlaModal, setTamamlaModal] = useState({ isOpen: false, randevuId: null });
  const [doktorNotu, setDoktorNotu] = useState('');
  
  const [gecmisModal, setGecmisModal] = useState({ isOpen: false, hastaId: null, veriler: [] });
  const [gecmisLoading, setGecmisLoading] = useState(false);

  useEffect(() => {
    fetchTakvim();
  }, [currentMonth]);

  useEffect(() => {
    fetchGunlukRandevular();
  }, [selectedDate]);

  const fetchTakvim = async () => {
    try {
      const ay = currentMonth.getMonth() + 1;
      const yil = currentMonth.getFullYear();
      const res = await axiosInstance.get('/DoktorPanel/takvim', { params: { ay, yil } });
      setTakvimRandevulari(res.data?.items || res.data || []);
    } catch (err) {
      console.error('Takvim verisi çekilemedi:', err);
    }
  };

  const fetchGunlukRandevular = async () => {
    try {
      setLoading(true);
      const tarihStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      const res = await axiosInstance.get('/DoktorPanel/randevularim', { params: { tarih: tarihStr } });
      setGunlukRandevular(res.data?.items || res.data || []);
    } catch (err) {
      console.error('Günlük randevular çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGecmisGor = async (hastaId) => {
    try {
      setGecmisModal({ isOpen: true, hastaId, veriler: [] });
      setGecmisLoading(true);
      const res = await axiosInstance.get(`/DoktorPanel/hasta-gecmisi/${hastaId}`);
      setGecmisModal({ isOpen: true, hastaId, veriler: res.data || [] });
    } catch (err) {
      console.error('Hasta geçmişi çekilemedi:', err);
    } finally {
      setGecmisLoading(false);
    }
  };

  const handleTamamlaSubmit = async () => {
    try {
      if (!tamamlaModal.randevuId) {
        alert("Randevu ID bulunamadı!");
        return;
      }

      await axiosInstance.put(
        `/DoktorPanel/randevu/${tamamlaModal.randevuId}/tamamla`, 
        JSON.stringify(doktorNotu), 
        { 
          headers: { 
            'Content-Type': 'application/json' 
          } 
        }
      );
      
      setTamamlaModal({ isOpen: false, randevuId: null });
      setDoktorNotu('');
      fetchGunlukRandevular(); 
      fetchTakvim();
      alert("Muayene başarıyla tamamlandı!");
    } catch (err) {
      console.error('Randevu tamamlanamadı:', err);
      alert('İşlem başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const startDayOffset = firstDay === 0 ? 6 : firstDay - 1; 

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToday = () => {
    const bugun = new Date();
    setCurrentMonth(bugun);
    setSelectedDate(bugun);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doktor Paneli</h1>
          <p className="text-sm text-slate-500">Kendi takviminizi ve muayenelerinizi yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Takvim Kutusu */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {currentMonth.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
              <button onClick={goToday} className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50">Bugün</button>
              <button onClick={nextMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center mb-2 text-xs font-bold text-slate-400">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => <div key={day}>{day}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isSelected = day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth();
              
              const hasRandevu = takvimRandevulari.some(r => {
                const rDate = new Date(r.tarih);
                return rDate.getDate() === day && rDate.getMonth() === currentMonth.getMonth();
              });

              return (
                <button 
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                  className={`aspect-square p-2 rounded-xl border flex flex-col items-center justify-center relative transition-all
                    ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-sm' : 'border-slate-100 hover:border-emerald-200 text-slate-700'}
                  `}
                >
                  <span>{day}</span>
                  {hasRandevu && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Günlük Randevular Listesi */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-emerald-500"/>
            <h3 className="font-bold text-slate-700">
              {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
            </h3>
          </div>

          {loading ? (
            <p className="text-center text-slate-500 py-10">Randevular yükleniyor...</p>
          ) : gunlukRandevular.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
              Bu tarihte planlanmış muayeneniz bulunmamaktadır.
            </div>
          ) : (
            gunlukRandevular.map(r => {
              // Konsolda gördüğümüz 'randevuId' anahtarını öncelikli olarak yakalıyoruz
              const currentRandevuId = r.randevuId || r.id || r.Id || r.ID;

              return (
                <div key={currentRandevuId} className={`bg-white rounded-xl border-l-4 shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all
                  ${r.durum === 3 ? 'border-l-blue-500 opacity-75' : r.durum === 4 ? 'border-l-rose-500 opacity-50' : 'border-l-emerald-500'}
                `}>
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg">
                      {r.hastaAd?.charAt(0) || 'H'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        {r.hastaAd} {r.hastaSoyad}
                        {r.durum === 3 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase font-bold">Tamamlandı</span>}
                        {r.durum === 4 && <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md uppercase font-bold">İptal</span>}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {r.saat?.substring(0,5)}</span>
                        <span className="flex items-center gap-1"><FileText className="w-4 h-4"/> {r.islemAd}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleGecmisGor(r.hastaId || r.HastaId)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold transition"
                    >
                      <History className="w-4 h-4" /> Geçmiş
                    </button>
                    
                    {r.durum !== 3 && r.durum !== 4 && (
                      <button 
                        onClick={() => {
                          setTamamlaModal({ isOpen: true, randevuId: currentRandevuId });
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-semibold transition"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Tamamla
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Hasta Geçmişi Modal */}
      {gecmisModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-emerald-500"/> Hasta Geçmişi</h3>
              <button onClick={() => setGecmisModal({ isOpen: false, hastaId: null, veriler: [] })} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {gecmisLoading ? (
                <p className="text-center text-slate-500">Geçmiş kayıtlar taranıyor...</p>
              ) : gecmisModal.veriler.length === 0 ? (
                <p className="text-center text-slate-500">Hastanın geçmiş muayene kaydı bulunmuyor.</p>
              ) : (
                gecmisModal.veriler.map((gecmis, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-700">{new Date(gecmis.tarih).toLocaleDateString('tr-TR')}</p>
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">{gecmis.islemAd}</span>
                    </div>
                    <p className="text-sm text-slate-600 italic">
                      <span className="font-semibold not-italic">Doktor Notu:</span> {gecmis.doktorNotu || "Not girilmemiş."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Muayeneyi Tamamla Modal */}
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
                  onClick={() => setTamamlaModal({ isOpen: false, randevuId: null })}
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

    </div>
  );
}