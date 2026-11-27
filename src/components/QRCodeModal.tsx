import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Download } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface QRCodeModalProps {
  isOpen: boolean;
  lang: Language;
  tableNumber: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  lang,
  tableNumber,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = translations[lang] || translations.qr;
  const [copied, setCopied] = useState(false);

  const currentOrigin = window.location.origin;
  const qrUrl = `${currentOrigin}?table=${encodeURIComponent(tableNumber)}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    qrUrl
  )}&color=2E1E17&bgcolor=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrImageSrc;
    link.download = `Table-${tableNumber}-QR.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E1E17]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#FAF5EF] text-[#2E1E17] rounded-3xl border border-[#EAE0D4] shadow-[0_10px_40px_rgba(46,30,23,0.25)] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-white text-[#2E1E17] p-4 border-b border-[#EAE0D4] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#C0684C]" />
            <h3 className="font-serif font-bold text-lg text-[#2E1E17]">
              {t.qrModalTitle || (lang === 'qr' ? 'Ústelińizdiń QR-kodı' : 'Stolingizning QR-kodi')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close || 'Jabıw'}
            className="p-1.5 rounded-full bg-[#F1EAE0] text-[#2E1E17] hover:bg-[#EAE0D4] transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-4">
          {/* Table Badge */}
          <div className="inline-flex items-center gap-2 bg-[#F1EAE0] px-4 py-1.5 rounded-full border border-[#EAE0D4]">
            <span className="font-serif font-bold text-[#2E1E17] text-sm">
              {t.tableNumber} {tableNumber}
            </span>
            <span className="text-[10px] bg-[#C0684C] text-white font-extrabold px-2 py-0.5 rounded-full">
              {t.tableDetected || (lang === 'qr' ? 'Anıqlanǵan' : 'Aniqlangan')}
            </span>
          </div>

          <p className="text-xs text-[#8D6B58] leading-relaxed px-2">
            {t.qrModalSub ||
              (lang === 'qr' 
                ? 'Dostlarıńız usı QR-kodtı skanerlew arqalı siz otırǵan ústel menyusına tikeley kire aladı.'
                : 'Do\'stlaringiz ushbu QR-kodni skanerlash orqali siz o\'tirgan stol menyusiga to\'g\'ridan-to\'g\'ri kira oladi.')}
          </p>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl border border-[#EAE0D4] shadow-md inline-block mx-auto relative group">
            <img
              src={qrImageSrc}
              alt={`QR Code for Table ${tableNumber}`}
              width="192"
              height="192"
              className="w-48 h-48 object-contain mx-auto rounded"
            />
          </div>

          {/* Direct URL text display */}
          <div className="bg-white p-2.5 rounded-xl border border-[#EAE0D4] text-[11px] font-mono text-[#8D6B58] truncate">
            {qrUrl}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label={t.copyLink || (lang === 'qr' ? 'Siltemeni kóshiriw' : 'Havolani nusxalash')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border border-emerald-400'
                  : 'bg-white hover:bg-[#FAF5EF] text-[#2E1E17] border border-[#EAE0D4] shadow-2xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" aria-hidden="true" />
                  <span>{t.linkCopied || (lang === 'qr' ? 'Kóshirildi!' : 'Nusxalandi!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#C0684C]" aria-hidden="true" />
                  <span>{t.copyLink || (lang === 'qr' ? 'Siltemeni kóshiriw' : 'Havolani nusxalash')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              aria-label={t.downloadQr || (lang === 'qr' ? 'QR-kodtı saqlaw' : 'QR-kodni saqlash')}
              className="py-2.5 px-3 rounded-xl bg-[#C0684C] hover:bg-[#A8553A] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
              title={t.downloadQr || (lang === 'qr' ? 'QR-kodtı saqlaw' : 'QR-kodni saqlash')}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-[#EAE0D4] text-center">
          <button
            onClick={onClose}
            className="w-full bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] py-2 rounded-xl text-xs font-bold transition border border-[#E6DDD2] cursor-pointer"
          >
            {t.close || 'Jabıw'}
          </button>
        </div>
      </div>
    </div>
  );
};
