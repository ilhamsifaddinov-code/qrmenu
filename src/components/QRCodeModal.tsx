import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Download, Share2 } from 'lucide-react';
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

  // Construct current URL with table query parameter
  const currentOrigin = window.location.origin;
  const qrUrl = `${currentOrigin}?table=${encodeURIComponent(tableNumber)}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    qrUrl
  )}&color=000000&bgcolor=ffffff`;

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#18181b] text-zinc-100 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-zinc-900 text-zinc-100 p-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-lg text-amber-300">
              {t.qrModalTitle || 'Stolıńızdıń QR-kodı'}
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
        <div className="p-6 text-center space-y-4">
          {/* Table Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 px-4 py-1.5 rounded-full border border-amber-500/40">
            <span className="font-serif font-bold text-amber-300 text-sm">
              {t.tableNumber} {tableNumber}
            </span>
            <span className="text-[10px] bg-amber-500 text-zinc-950 font-extrabold px-2 py-0.5 rounded-full">
              {t.tableDetected || 'Anıqlanǵan'}
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed px-2">
            {t.qrModalSub ||
              'Dostlarıńız usı QR-kodtı skanerlew arqalı siz otırǵan stol menyusına tikeley kire aladı.'}
          </p>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl border-4 border-amber-500/50 shadow-2xl inline-block mx-auto relative group">
            <img
              src={qrImageSrc}
              alt={`QR Code for Table ${tableNumber}`}
              className="w-48 h-48 object-contain mx-auto rounded"
            />
          </div>

          {/* Direct URL text display */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400 truncate">
            {qrUrl}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                copied
                  ? 'bg-emerald-600 text-white border border-emerald-400'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{t.linkCopied || 'Kóshirildi!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>{t.copyLink || 'Siltemeni kóshiriw'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQr}
              className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition"
              title={t.downloadQr || 'QR-kodtı saqlaw'}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-amber-500/20 text-center">
          <button
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 rounded-xl text-xs font-bold transition"
          >
            {t.close || 'Jabıw'}
          </button>
        </div>
      </div>
    </div>
  );
};
