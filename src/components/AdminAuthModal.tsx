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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#18181b] text-zinc-100 rounded-3xl border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-zinc-900 text-zinc-100 p-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-lg text-amber-300">
              {getTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            {getSub()}
          </p>

          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="******"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-500/40 bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 outline-none"
                autoFocus
                required
              />
            </div>
            {error && (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-1 bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{getErrorText()}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-bold text-xs transition"
            >
              {t.close || 'Jabıw'}
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 py-2.5 rounded-xl font-serif font-extrabold text-xs shadow-[0_0_15px_rgba(245,158,11,0.35)] transition"
            >
              Kiriw / Вход
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
