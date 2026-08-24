import React from 'react';

export const NationalOrnamentHeader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full overflow-hidden flex justify-center py-1 select-none ${className}`}>
      <svg className="h-6 w-full max-w-xl text-amber-500" viewBox="0 0 400 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 12 H150 L160 4 L170 20 L180 4 L190 20 L200 12 L210 20 L220 4 L230 20 L240 4 L250 12 H400" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="200" cy="12" r="4" fill="#fbbf24" />
        <circle cx="180" cy="12" r="3" fill="#f59e0b" />
        <circle cx="220" cy="12" r="3" fill="#f59e0b" />
        <path d="M165 12 L175 12 M225 12 L235 12" stroke="#fbbf24" strokeWidth="2" />
      </svg>
    </div>
  );
};

export const NationalCornerPattern: React.FC<{ position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({ position = 'top-left' }) => {
  const rotation = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }[position];

  return (
    <div className={`absolute w-10 h-10 pointer-events-none ${rotation} ${position.includes('top') ? 'top-1' : 'bottom-1'} ${position.includes('left') ? 'left-1' : 'right-1'}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full text-amber-500/60 opacity-80">
        <path d="M0 0 H40 V4 H4 V40 H0 V0Z" fill="currentColor" />
        <path d="M8 8 H24 V12 H12 V24 H8 V8Z" fill="#fbbf24" />
        <circle cx="18" cy="18" r="3" fill="#f59e0b" />
      </svg>
    </div>
  );
};
