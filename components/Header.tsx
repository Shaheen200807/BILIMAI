
import React from 'react';
import { Heart, Flame } from 'lucide-react';
import { UserStats, Language } from '../types';

interface HeaderProps {
  stats: UserStats;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onViewChange: (view: any) => void;
}

const Header: React.FC<HeaderProps> = ({ stats, lang, onLanguageChange, onViewChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-sm p-4 flex items-center justify-between border-b border-blue-50">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onViewChange('dashboard')}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-200 group-hover:scale-110 group-hover:rotate-3 transition-all">
          B
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl text-slate-800 hidden sm:block tracking-tighter leading-none">BILIMAI</span>
          <span className="text-[10px] font-black text-blue-600 hidden sm:block uppercase tracking-widest">EduQuest</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
          <button 
            onClick={() => onLanguageChange('ru')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${lang === 'ru' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            RU
          </button>
          <button 
            onClick={() => onLanguageChange('kk')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${lang === 'kk' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            KK
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 shadow-sm hidden sm:flex hover:scale-105 transition-transform">
            <Flame className="text-orange-600 mr-2" size={18} />
            <span className="font-black text-orange-600 text-sm">{stats.currentStreak}</span>
          </div>

          <div className="flex items-center bg-red-50 px-4 py-2 rounded-2xl border border-red-100 shadow-sm hover:scale-105 transition-transform">
            <Heart className="text-red-600 mr-2" size={18} />
            <span className="font-black text-red-600 text-sm">{stats.hearts}</span>
          </div>
          
          <button 
            onClick={() => onViewChange('profile')}
            className="flex items-center gap-3 p-1 pr-4 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white">
              {stats.avatar}
            </div>
            <div className="flex flex-col items-start hidden sm:flex">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">XP</span>
              <span className="text-sm font-black text-slate-800 leading-none">{stats.points}</span>
            </div>
          </button>

          <button 
            onClick={() => onViewChange('parent')}
            className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xl hover:bg-white hover:shadow-lg transition-all hidden sm:flex"
            title="Родителям"
          >
            👤
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
