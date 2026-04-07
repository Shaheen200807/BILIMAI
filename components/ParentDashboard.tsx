
import React from 'react';
import { Flame } from 'lucide-react';
import { UserStats, Subject, Language } from '../types';
import { TRANSLATIONS, SUBJECT_INFO } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ParentDashboardProps {
  stats: UserStats;
  lang: Language;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ stats, lang }) => {
  const t = TRANSLATIONS[lang];
  
  // Формируем данные для графика из реальной статистики пользователя
  const data = Object.values(Subject).map(sub => ({
    name: lang === 'kk' ? (SUBJECT_INFO[sub].kk.substring(0, 3) + '.') : sub.substring(0, 3) + '.',
    fullName: lang === 'kk' ? SUBJECT_INFO[sub].kk : sub,
    value: stats.subjectProgress?.[sub] || 0,
    color: SUBJECT_INFO[sub].color.replace('bg-', '#').replace('blue-500', '3b82f6').replace('purple-500', 'a855f7').replace('green-500', '22c55e').replace('orange-500', 'f97316'),
    id: sub
  }));

  // Находим самый слабый предмет для рекомендации
  const sortedByProgress = [...data].sort((a, b) => a.value - b.value);
  const weakestSubject = sortedByProgress[0];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t.parentTitle}</h1>
          <p className="text-slate-500 font-medium">{t.parentSub}</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl border border-blue-100 font-bold shadow-sm">
          {lang === 'ru' ? 'Активность: Высокая' : 'Белсенділік: Жоғары'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 text-lg">{t.skills} ({lang === 'ru' ? 'решено задач' : 'есептер'})</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={45}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color === entry.id ? '#3b82f6' : entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-6">
          <h3 className="font-bold text-slate-800 text-lg">{t.stats}</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                Streak
                <Flame className="text-orange-500" size={16} />
              </span>
              <span className="font-black text-orange-600">{stats.currentStreak}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500">{t.solved}</span>
              <span className="font-black text-slate-800">{stats.solvedCount}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500">{t.points}</span>
              <span className="font-black text-blue-600">{stats.points}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500">{t.level}</span>
              <span className="font-black text-slate-800">{stats.level}</span>
            </div>
          </div>

          <div className="mt-auto">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{t.weakTopics}</h4>
            <div className="flex flex-wrap gap-2">
              {stats.weakTopics && Object.keys(stats.weakTopics).length > 0 ? (
                Object.entries(stats.weakTopics).slice(0, 3).map(([topic]) => (
                  <span key={topic} className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase tracking-tight">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-400 italic">Нет данных</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🧠</span> {t.recommendation} BILIMAI
        </h3>
        <p className="opacity-90 mb-6 leading-relaxed font-medium">
          {lang === 'ru' 
            ? `Ваш ребенок делает успехи! Сейчас меньше всего внимания уделяется предмету "${weakestSubject.fullName}". Рекомендуем сфокусироваться на нем, чтобы подготовка к НИШ была сбалансированной.`
            : `Балаңыз жақсы нәтиже көрсетуде! Қазіргі уақытта "${weakestSubject.fullName}" пәніне аз көңіл бөлінуде. Зияткерлік мектепке дайындық сапалы болуы үшін осы пәнге мән беруді ұсынамыз.`}
        </p>
        <button 
          className="bg-white text-blue-600 px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-black/10 active:scale-95"
          onClick={() => alert(lang === 'ru' ? 'План успешно сформирован и отправлен ребенку!' : 'Жоспар сәтті құрылды және балаға жіберілді!')}
        >
          {lang === 'ru' ? 'Сформировать план обучения' : 'Оқу жоспарын құру'}
        </button>
      </div>
    </div>
  );
};

export default ParentDashboard;
