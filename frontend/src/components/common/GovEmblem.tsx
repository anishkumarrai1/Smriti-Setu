import React from 'react';

export const AshokaEmblem: React.FC<{ className?: string }> = ({ className = 'w-12 h-16' }) => (
  <svg className={className} viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ashoka Lion Capital Emblem Representation */}
    <g fill="#1A202C">
      {/* Crown / Top Lions Motif */}
      <path d="M50 10C42 10 35 15 35 22C35 26 38 29 42 30C36 32 30 38 30 46C30 52 35 56 42 58C36 60 32 66 32 72C32 78 38 82 46 84V88H54V84C62 82 68 78 68 72C68 66 64 60 58 58C65 56 70 52 70 46C70 38 64 32 58 30C62 29 65 26 65 22C65 15 58 10 50 10Z" />
      {/* Abacus & Wheel (Ashoka Chakra) */}
      <rect x="25" y="88" width="50" height="12" rx="2" fill="#004085" />
      <circle cx="50" cy="94" r="5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      {/* Pedestal */}
      <path d="M20 102H80L75 114H25L20 102Z" />
      <rect x="15" y="114" width="70" height="6" rx="1" fill="#1A202C" />
      {/* Satyameva Jayate Inscription */}
      <text x="50" y="132" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="serif" fill="#1A202C">
        सत्यमेव जयते
      </text>
    </g>
  </svg>
);

export const DigitalIndiaBadge: React.FC<{ className?: string }> = ({ className = 'h-12' }) => (
  <div className={`flex items-center gap-2 bg-gradient-to-r from-orange-500 via-white to-green-600 p-1.5 rounded-xl border border-slate-300 shadow-xs ${className}`}>
    <div className="bg-govNavy-dark text-white p-1 rounded-lg font-bold text-xs flex flex-col items-center">
      <span className="text-[9px] text-amber-300 uppercase">Celebrating</span>
      <span className="text-sm font-extrabold leading-none">11</span>
      <span className="text-[8px] text-slate-200 uppercase">Years of</span>
    </div>
    <div className="flex flex-col text-slate-900 leading-tight">
      <span className="font-extrabold text-sm text-govNavy-dark">Digital India</span>
      <span className="text-[9px] font-semibold text-slate-700">Power To Empower</span>
    </div>
  </div>
);

export const HealthHelplineBadge: React.FC<{ className?: string }> = ({ className = 'h-11' }) => (
  <div className={`hidden sm:flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-300 shadow-xs ${className}`}>
    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-extrabold text-xs">
      14567
    </div>
    <div className="flex flex-col text-xs leading-none">
      <span className="font-bold text-slate-900">Healthcare Helpline</span>
      <span className="text-[10px] text-red-600 font-extrabold">Call 14567 / 14416 (Toll Free)</span>
    </div>
  </div>
);

export const IndianFlagBadge: React.FC = () => (
  <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-md overflow-hidden h-7 px-1">
    <div className="w-4 h-full flex flex-col">
      <div className="h-1/3 bg-govSaffron" />
      <div className="h-1/3 bg-white flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full border border-blue-900" />
      </div>
      <div className="h-1/3 bg-govGreen" />
    </div>
    <span className="text-[10px] font-bold text-slate-800">GOVT OF INDIA</span>
  </div>
);
