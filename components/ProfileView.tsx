
import React from 'react';
import { Heart, Star, CheckCircle, AlertCircle, Trophy, Flame, Settings } from 'lucide-react';
import { UserStats, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProfileViewProps {
  stats: UserStats;
  lang: Language;
  onLogout: () => void;
  onAdminClick?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ stats, lang, onLogout }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in pb-20">
      <div className="bg-white p-8 sm:p-10 rounded-[40px] shadow-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={onLogout} 
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm border border-red-100"
            >
              <span>🚪</span> {t.logout}
            </button>
        </div>

        <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[48px] flex items-center justify-center text-8xl shadow-2xl border-8 border-white flex-shrink-0 relative group">
          <div className="absolute inset-0 bg-white/20 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-black uppercase tracking-widest">Edit</div>
          {stats.avatar}
        </div>
        <div className="text-center md:text-left flex-grow">
          <div className="mb-6">
            <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">{stats.name}</h1>
            <p className="text-slate-400 font-bold text-sm tracking-wide">{stats.email}</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
            <div className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              {t.level} {stats.level}
            </div>
            <div className="bg-slate-100 text-slate-500 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200">
              Student ID: #{stats.email.split('@')[0]}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 p-5 rounded-3xl text-center border border-orange-100 shadow-sm">
              <div className="text-3xl font-black text-orange-600 mb-1">{stats.currentStreak}</div>
              <div className="text-[10px] text-orange-400 font-black uppercase tracking-widest flex items-center justify-center gap-1">
                Streak <Flame className="text-orange-500" size={14} />
              </div>
            </div>
            <div className="bg-blue-50 p-5 rounded-3xl text-center border border-blue-100 shadow-sm">
              <div className="text-3xl font-black text-blue-600 mb-1">{stats.points}</div>
              <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center justify-center gap-1">
                {t.points} <Star className="text-yellow-500" size={14} />
              </div>
            </div>
            <div className="bg-green-50 p-5 rounded-3xl text-center border border-green-100 shadow-sm">
              <div className="text-3xl font-black text-green-600 mb-1">{stats.solvedCount}</div>
              <div className="text-[10px] text-green-400 font-black uppercase tracking-widest flex items-center justify-center gap-1">
                {t.solved} <CheckCircle className="text-green-500" size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Detailed Stats Card */}
        <section className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
            <span className="text-2xl">📈</span> {t.stats}
          </h2>
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.correctAnswers}</span>
              <span className="text-2xl font-black text-green-400">{stats.correctAnswers || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.errors}</span>
              <span className="text-2xl font-black text-red-400">{stats.mistakesCount || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.solvedTodayStat}</span>
              <span className="text-2xl font-black text-blue-400">{stats.solvedToday || 0}</span>
            </div>
          </div>
        </section>

        {/* Weak Topics Card */}
        {stats.weakTopics && Object.keys(stats.weakTopics).length > 0 && (
          <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={28} />
              {t.weakTopics}
            </h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(stats.weakTopics)
                .sort((a, b) => b[1] - a[1])
                .map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 group hover:bg-red-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                        <AlertCircle className="text-red-500" size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">{topic}</h4>
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{t.needsImprovement}</p>
                      </div>
                    </div>
                    <div className="text-red-600 font-black text-xl">{count}</div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>

      <section>
        <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <Trophy className="text-yellow-500" size={32} />
          {t.achievements}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stats.achievements.map((ach) => (
            <div key={ach.id} className={`p-8 rounded-[40px] border-2 flex items-center gap-6 transition-all relative overflow-hidden ${ach.unlocked ? 'bg-white border-blue-100 shadow-xl scale-100' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}`}>
              {ach.unlocked && <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12"></div>}
              <div className={`text-5xl p-5 rounded-3xl flex-shrink-0 shadow-inner relative z-10 ${ach.unlocked ? 'bg-blue-50' : 'bg-slate-200'}`}>
                {ach.icon}
              </div>
              <div className="relative z-10">
                <h4 className="font-black text-slate-800 text-xl leading-tight mb-1">{ach.title[lang]}</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{ach.description[lang]}</p>
                {!ach.unlocked && <div className="mt-3 text-[10px] bg-slate-200 px-3 py-1 rounded-full font-black text-slate-500 uppercase tracking-widest inline-block">{t.locked}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfileView;
