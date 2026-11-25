import React from 'react';

export const NationalOrnamentHeader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full overflow-hidden flex items-center justify-center py-2 select-none ${className}`} aria-hidden="true">
      <div className="flex items-center gap-2 max-w-xs w-full px-4 opacity-40">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C0684C]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#C0684C]"></div>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C0684C]"></div>
      </div>
    </div>
  );
};

export const NationalCornerPattern: React.FC<{ position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = () => {
  return null;
};
