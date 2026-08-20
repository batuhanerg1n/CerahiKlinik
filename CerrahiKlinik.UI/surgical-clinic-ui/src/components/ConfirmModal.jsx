import React from 'react';
import { AlertTriangle } from 'lucide-react';


export default function ConfirmModal({ data, onClose }) {
  if (!data) return null;

  const {
    baslik = 'Emin misiniz?',
    mesaj = 'Bu işlemi yapmak istediğinize emin misiniz?',
    onaylaText = 'Evet, Devam Et',
    vazgecText = 'Vazgeç',
    onConfirm
  } = data;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{baslik}</h3>
          <p className="text-sm text-slate-500 mb-6">{mesaj}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              {vazgecText}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm transition"
            >
              {onaylaText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}