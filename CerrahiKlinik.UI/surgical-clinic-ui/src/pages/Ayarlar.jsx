import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  Plus, Trash2, Tag, Layers, X, Save, Settings as SettingsIcon, Award
} from 'lucide-react';

export default function Ayarlar() {
  const [aktifSekme, setAktifSekme] = useState('islemler');   
  const [islemler, setIslemler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [editId, setEditId] = useState(null);   
  const [ad, setAd] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [fiyatTipi, setFiyatTipi] = useState(1);
  const [fiyat, setFiyat] = useState('');
  const [secenekler, setSecenekler] = useState([{ secenekAd: '', fiyat: '' }]);
  const [kaydediyor, setKaydediyor] = useState(false);

  const [branslar, setBranslar] = useState([]);
  const [yeniBrans, setYeniBrans] = useState('');

  useEffect(() => {
    fetchIslemler();
    fetchBranslar();
  }, []);

  const fetchIslemler = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/PersonelPanel/islemler');
      setIslemler(res.data || []);
    } catch (err) {
      console.error('İşlemler çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAd(''); setAciklama(''); setFiyatTipi(1); setFiyat('');
    setSecenekler([{ secenekAd: '', fiyat: '' }]);
  };

  const acModal = () => { resetForm(); setEditId(null); setModalAcik(true); };

  const acDuzenleModal = (islem) => {
    setEditId(islem.id);
    setAd(islem.ad);
    setAciklama(islem.aciklama || '');
    setFiyatTipi(islem.fiyatTipi);
    setFiyat(islem.fiyatTipi === 1 ? String(islem.fiyat) : '');
    setSecenekler(
      islem.fiyatTipi === 2 && islem.secenekler?.length > 0
        ? islem.secenekler.map(s => ({ id: s.id, secenekAd: s.secenekAd, fiyat: String(s.fiyat) }))
        : [{ secenekAd: '', fiyat: '' }]
    );
    setModalAcik(true);
  };

  const kapatModal = () => { setModalAcik(false); setEditId(null); resetForm(); };

  const secenekEkle = () => setSecenekler([...secenekler, { secenekAd: '', fiyat: '' }]);
  const secenekSil = (index) => setSecenekler(secenekler.filter((_, i) => i !== index));
  const secenekGuncelle = (index, alan, deger) => {
    const yeni = [...secenekler];
    yeni[index][alan] = deger;
    setSecenekler(yeni);
  };

  const handleKaydet = async () => {
    if (!ad.trim()) { alert('İşlem adı zorunludur.'); return; }
    if (fiyatTipi === 1 && (!fiyat || Number(fiyat) <= 0)) {
      alert('Sabit fiyat girmelisiniz.'); return;
    }
    if (fiyatTipi === 2) {
      const gecerli = secenekler.filter(s => s.secenekAd.trim() && Number(s.fiyat) > 0);
      if (gecerli.length === 0) { alert('En az bir seçenek ve fiyatı girmelisiniz.'); return; }
    }

    const payload = {
      ad: ad.trim(),
      aciklama: aciklama.trim(),
      fiyatTipi: fiyatTipi,
      fiyat: fiyatTipi === 1 ? Number(fiyat) : 0,
      secenekler: fiyatTipi === 2
        ? secenekler.filter(s => s.secenekAd.trim() && Number(s.fiyat) > 0)
            .map(s => ({
              id: s.id ?? null,
              secenekAd: s.secenekAd.trim(),
              fiyat: Number(s.fiyat)
            }))
        : []
    };

    try {
      setKaydediyor(true);
      if (editId) {
        await axiosInstance.put(`/PersonelPanel/islemler/${editId}`, payload);
      } else {
        await axiosInstance.post('/PersonelPanel/islemler', payload);
      }
      kapatModal();
      fetchIslemler();
    } catch (err) {
      console.error('İşlem kaydedilemedi:', err);
      alert(err.response?.data?.message || 'İşlem kaydedilirken hata oluştu.');
    } finally {
      setKaydediyor(false);
    }
  };

  const handleSil = async (id) => {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
    try {
      await axiosInstance.delete(`/PersonelPanel/islemler/${id}`);
      fetchIslemler();
    } catch (err) {
      console.error('İşlem silinemedi:', err);
      alert('İşlem silinemedi. Bu işleme bağlı randevular olabilir.');
    }
  };

  const fetchBranslar = async () => {
    try {
      const res = await axiosInstance.get('/Public/branslar');
      setBranslar(res.data || []);
    } catch (err) {
      console.error('Branşlar çekilemedi:', err);
    }
  };

  const handleBransEkle = async () => {
    if (!yeniBrans.trim()) { alert('Branş adı boş olamaz.'); return; }
    try {
      await axiosInstance.post('/PersonelPanel/branslar', { ad: yeniBrans.trim() });
      setYeniBrans('');
      fetchBranslar();
    } catch (err) {
      console.error('Branş eklenemedi:', err);
      alert('Branş eklenemedi.');
    }
  };

  const handleBransSil = async (id) => {
    if (!window.confirm('Bu branşı silmek istediğinize emin misiniz?')) return;
    try {
      await axiosInstance.delete(`/PersonelPanel/branslar/${id}`);
      fetchBranslar();
    } catch (err) {
      console.error('Branş silinemedi:', err);
      alert('Branş silinemedi. Bu branşa bağlı doktorlar olabilir.');
    }
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-slate-700" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ayarlar</h1>
          <p className="text-sm text-slate-500">Klinik işlemlerini, fiyatlarını ve branşları yönetin.</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        <button
          onClick={() => setAktifSekme('islemler')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition ${
            aktifSekme === 'islemler' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-4 h-4" /> İşlemler
        </button>
        <button
          onClick={() => setAktifSekme('branslar')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition ${
            aktifSekme === 'branslar' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" /> Branşlar
        </button>
      </div>

      {aktifSekme === 'islemler' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={acModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition"
            >
              <Plus className="w-5 h-5" /> Yeni İşlem
            </button>
          </div>

          {loading ? (
            <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
          ) : islemler.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
              Henüz işlem eklenmemiş. "Yeni İşlem" butonuyla başlayın.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {islemler.map(islem => (
                <div
                  key={islem.id}
                  onClick={() => acDuzenleModal(islem)}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {islem.fiyatTipi === 2
                        ? <Layers className="w-5 h-5 text-purple-500" />
                        : <Tag className="w-5 h-5 text-emerald-500" />}
                      <h3 className="font-bold text-slate-800 text-lg">{islem.ad}</h3>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSil(islem.id); }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {islem.aciklama && <p className="text-sm text-slate-500 mb-3">{islem.aciklama}</p>}

                  {islem.fiyatTipi === 1 ? (
                    <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
                      <span className="text-xs font-bold text-emerald-700 uppercase">Sabit Fiyat</span>
                      <span className="font-bold text-emerald-700">{formatMoney(islem.fiyat)}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase mb-2">Değişken Fiyat - Seçenekler</p>
                      <div className="space-y-1.5">
                        {islem.secenekler?.map(s => (
                          <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                            <span className="text-slate-700">{s.secenekAd}</span>
                            <span className="font-bold text-slate-800">{formatMoney(s.fiyat)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aktifSekme === 'branslar' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-slate-800">Branş Yönetimi</h2>
          </div>

          <div className="flex gap-2 mb-5">
            <input
              type="text"
              value={yeniBrans}
              onChange={(e) => setYeniBrans(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBransEkle(); }}
              placeholder="Yeni branş adı (örn. Plastik Cerrahi)"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleBransEkle}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Ekle
            </button>
          </div>

          {branslar.length === 0 ? (
            <p className="text-sm text-slate-400">Henüz branş eklenmemiş.</p>
          ) : (
            <div className="space-y-2">
              {branslar.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-100">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" /> {b.ad}
                  </span>
                  <button
                    onClick={() => handleBransSil(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modalAcik && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800 text-lg">{editId ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</h3>
              <button onClick={kapatModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">İşlem Adı</label>
                <input type="text" value={ad} onChange={(e) => setAd(e.target.value)}
                  placeholder="Örn: Meme Büyütme, Muayene..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Açıklama (opsiyonel)</label>
                <input type="text" value={aciklama} onChange={(e) => setAciklama(e.target.value)}
                  placeholder="Kısa açıklama"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Fiyatlandırma Tipi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFiyatTipi(1)}
                    className={`p-3 rounded-xl border-2 text-left transition ${fiyatTipi === 1 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800 text-sm">Sabit Fiyat</span>
                    </div>
                    <p className="text-xs text-slate-500">Tek fiyat (örn. Muayene 500₺)</p>
                  </button>
                  <button type="button" onClick={() => setFiyatTipi(2)}
                    className={`p-3 rounded-xl border-2 text-left transition ${fiyatTipi === 2 ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-800 text-sm">Değişken Fiyat</span>
                    </div>
                    <p className="text-xs text-slate-500">Seçeneğe göre değişir</p>
                  </button>
                </div>
              </div>

              {fiyatTipi === 1 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Fiyat (₺)</label>
                  <input type="number" value={fiyat} onChange={(e) => setFiyat(e.target.value)} placeholder="500"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              )}

              {fiyatTipi === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-600">Seçenekler</label>
                    <button type="button" onClick={secenekEkle}
                      className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800">
                      <Plus className="w-3.5 h-3.5" /> Seçenek Ekle
                    </button>
                  </div>
                  <div className="space-y-2">
                    {secenekler.map((s, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input type="text" value={s.secenekAd}
                          onChange={(e) => secenekGuncelle(index, 'secenekAd', e.target.value)}
                          placeholder="10 cm silikon"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                        <input type="number" value={s.fiyat}
                          onChange={(e) => secenekGuncelle(index, 'fiyat', e.target.value)}
                          placeholder="₺"
                          className="w-28 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                        {secenekler.length > 1 && (
                          <button type="button" onClick={() => secenekSil(index)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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