import React, { useState } from 'react';
import { X, Lock, ShieldAlert, KeyRound } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface AdminAuthModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSuccess: () => void;
  adminPassword?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  lang,
  onClose,
  onSuccess,
  adminPassword = '123456'
}) => {
  if (!isOpen) return null;

  const t = translations[lang] || translations.qr;
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  const getTitle = () => {
    switch (lang) {
      case 'qr':
        return 'Admin Paneline Kiriw';
      case 'uz':
        return 'Admin Panelga Kirish';
      case 'ru':
        return 'Вход в Панель Администратора';
      case 'en':
        return 'Admin Panel Access';
    }
  };

  const getSub = () => {
    switch (lang) {
      case 'qr':
        return 'Admin paneline kiriw ushın minnetli hálde admin parolin kiritiń:';
      case 'uz':
        return 'Admin paneliga kirish uchun admin parolini kiriting:';
      case 'ru':
        return 'Для доступа к панели администратора введите пароль:';
      case 'en':
        return 'Enter admin password to access the management panel:';
    }
  };

  const getErrorText = () => {
    switch (lang) {
      case 'qr':
        return 'Parol qáte! Qaytadan urınıp kóriń.';
      case 'uz':
        return 'Parol noto\'g\'ri! Qaytadan urinib ko\'ring.';
      case 'ru':
        return 'Неверный пароль! Попробуйте еще раз.';
      case 'en':
        return 'Incorrect password! Please try again.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E1E17]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#FAF5EF] text-[#2E1E17] rounded-3xl border border-[#EAE0D4] shadow-[0_10px_40px_rgba(46,30,23,0.25)] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-white text-[#2E1E17] p-4 border-b border-[#EAE0D4] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#EAE0D4] bg-[#FAF5EF] p-0.5 shrink-0 shadow-2xs">
              <img src="/logo.png" alt="Cake Bumer" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#2E1E17]">
              {getTitle()}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Jabıw"
            className="p-1.5 rounded-full bg-[#F1EAE0] text-[#2E1E17] hover:bg-[#EAE0D4] transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#8D6B58] leading-relaxed">
            {getSub()}
          </p>

          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#C0684C] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="******"
                aria-label="Admin paroli"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE0D4] bg-white text-sm text-[#2E1E17] placeholder-[#8D6B58]/60 focus:ring-1 focus:ring-[#C0684C] focus:border-[#C0684C] outline-none"
                autoFocus
                required
              />
            </div>
            {error && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5 bg-red-50 p-2.5 rounded-xl border border-red-200">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{getErrorText()}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] py-2.5 rounded-xl font-bold text-xs transition border border-[#E6DDD2] cursor-pointer"
            >
              {t.close || 'Jabıw'}
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#C0684C] hover:bg-[#A8553A] text-white py-2.5 rounded-xl font-serif font-extrabold text-xs shadow-sm transition cursor-pointer"
            >
              {lang === 'qr' ? 'Kiriw' : 'Kirish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
