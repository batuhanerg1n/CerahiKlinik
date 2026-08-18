import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Calendar, Clock, User, Phone, CheckCircle, Stethoscope, Activity } from 'lucide-react';

const MESAI_SAATLERI = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

export default function PublicHome() {
  const [doktorlar, setDoktorlar] = useState([]);
  const [islemler, setIslemler] = useState([]);
  const [doluSaatler, setDoluSaatler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    hastaAd: '',
    hastaSoyad: '',
    hastaTelefon: '',
    doktorId: '',
    islemId: '',
    islemSecenekId: '',
    tarih: '',
    saat: '',
    hastaNotu: ''
  });
  
  const [minTarih, setMinTarih] = useState('');
  
  useEffect(() => {
    const bugun = new Date();
    const yyyy = bugun.getFullYear();
    const mm = String(bugun.getMonth() + 1).padStart(2, '0');
    const dd = String(bugun.getDate()).padStart(2, '0');
    setMinTarih(`${yyyy}-${mm}-${dd}`);
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doktorRes, islemRes] = await Promise.all([
          axiosInstance.get('/Public/doktorlar'),
          axiosInstance.get('/Public/islem')
        ]);
        setDoktorlar(doktorRes.data);
        setIslemler(islemRes.data);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
      }
    };
    fetchData();
  }, []);

 useEffect(() => {
    const fetchDoluSaatler = async () => {
      if (!formData.doktorId || !formData.tarih) {
        setDoluSaatler([]);
        return;
      }

      try {
        
        const response = await axiosInstance.get('/Public/dolu-saatler', {
          params: {
            doktorId: parseInt(formData.doktorId),
            tarih: formData.tarih
          }
        }); 
        
        if (Array.isArray(response.data)) {
          const doluList = response.data.map(saat => saat.substring(0, 5)); 
          setDoluSaatler(doluList);
        }
      } catch (err) {
        console.warn('Dolu saatler çekilemedi.', err);
      }
    };

    fetchDoluSaatler();
  }, [formData.doktorId, formData.tarih]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'islemId') {
      setFormData({ ...formData, islemId: value, islemSecenekId: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const seciliIslem = islemler.find(i => i.id === parseInt(formData.islemId));
  const seciliSecenek = seciliIslem?.secenekler?.find(s => s.id === parseInt(formData.islemSecenekId));
  const gosterilecekFiyat = seciliIslem
    ? (seciliIslem.fiyatTipi === 2 ? (seciliSecenek?.fiyat ?? null) : seciliIslem.fiyat)
    : null;
  const formatMoney = (amount) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.saat) {
      setErrorMsg('Lütfen uygun bir randevu saati seçiniz.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        doktorId: parseInt(formData.doktorId),
        islemId: parseInt(formData.islemId),
        islemSecenekId: formData.islemSecenekId ? parseInt(formData.islemSecenekId) : null,   // 👈 EKLE
        tarih: `${formData.tarih}T00:00:00.000Z`,
        saat: `${formData.saat}:00`
      };

      const response = await axiosInstance.post('/Public/online-randevu', payload);
      setSuccessMsg(response.data.message || 'Randevunuz başarıyla oluşturuldu!');
      
      setDoluSaatler(prev => [...prev, formData.saat]);

      setFormData({
        hastaAd: '',
        hastaSoyad: '',
        hastaTelefon: '',
        doktorId: '',
        islemId: '',
        islemSeceneklerId:'',
        tarih: '',
        saat: '',
        hastaNotu: ''
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Randevu oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const checkSaatDisabled = (saat) => {
    if (doluSaatler.includes(saat)) return { disabled: true, text: '(DOLU)' };

    if (formData.tarih === minTarih) {
      const suAn = new Date();
      const mevcutSaat = suAn.getHours();
      const mevcutDakika = suAn.getMinutes();

      const [saatStr, dakikaStr] = saat.split(':');
      const optionSaati = parseInt(saatStr, 10);
      const optionDakikasi = parseInt(dakikaStr, 10);

      if (optionSaati < mevcutSaat || (optionSaati === mevcutSaat && optionDakikasi <= mevcutDakika)) {
        return { disabled: true, text: '(GEÇTİ)' };
      }
    }
    return { disabled: false, text: '' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
    
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Stethoscope className="w-7 h-7" />
            <span>SurgicalClinic</span>
          </div>
          <a
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition"
          >
            Personel Girişi
          </a>
        </div>
      </header>

      
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Online Randevu Oluştur</h1>
          <p className="text-slate-600">Lütfen aşağıdaki bilgileri eksiksiz doldurarak randevunuzu planlayın.</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Kişisel Bilgiler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adınız</label>
                <input
                  type="text"
                  name="hastaAd"
                  required
                  value={formData.hastaAd}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Batuhan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Soyadınız</label>
                <input
                  type="text"
                  name="hastaSoyad"
                  required
                  value={formData.hastaSoyad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Erğin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  name="hastaTelefon"
                  required
                  value={formData.hastaTelefon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="05551112233"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

         
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Hekim ve İşlem Seçimi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doktor Seçin</label>
                <select
                  name="doktorId"
                  required
                  value={formData.doktorId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Hekim Seçiniz --</option>
                  {doktorlar.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.unvan} {d.ad} {d.soyad}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yapılacak İşlem / Muayene</label>
                <select
                  name="islemId"
                  required
                  value={formData.islemId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- İşlem Seçiniz --</option>
                  {islemler.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.ad} {i.fiyatTipi === 2 ? '(Seçenekli)' : `(${formatMoney(i.fiyat)})`}
                    </option>
                  ))}
                </select>
                {seciliIslem?.fiyatTipi === 2 && (
                  <select
                    name="islemSecenekId"
                    required
                    value={formData.islemSecenekId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mt-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">-- Seçenek Belirleyiniz --</option>
                    {seciliIslem.secenekler.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.secenekAd} - {formatMoney(s.fiyat)}
                      </option>
                    ))}
                  </select>
                )}

                {gosterilecekFiyat !== null && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-700">Tahmini Ücret</span>
                    <span className="text-lg font-bold text-blue-800">{formatMoney(gosterilecekFiyat)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Tarih ve Saat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
                <input
                  type="date"
                  name="tarih"
                  required
                  min={minTarih}
                  value={formData.tarih}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Saat {formData.doktorId && formData.tarih ? '' : '(Önce Hekim ve Tarih Seçiniz)'}
                </label>
                <select
                  name="saat"
                  required
                  disabled={!formData.doktorId || !formData.tarih}
                  value={formData.saat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Saat Seçiniz --</option>
                  {MESAI_SAATLERI.map((saat) => {
                    const status = checkSaatDisabled(saat);
                    return (
                      <option key={saat} value={saat} disabled={status.disabled}>
                        {saat} {status.text}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Soru / Notunuz (Opsiyonel)</label>
            <textarea
              name="hastaNotu"
              rows="3"
              value={formData.hastaNotu}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Kısaca şikayetinizi veya notunuzu belirtebilirsiniz..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Randevu Oluşturuluyor...' : 'Randevuyu Onayla'}
          </button>
        </form>
      </main>
    </div>
  );
}