
import React, { useState } from 'react';
import { Heart, Star, CheckCircle, Flame, Play, Hand, Clock, Dice1, Target, BarChart3, AlertCircle } from 'lucide-react';
import { Subject, UserStats, Language, Difficulty } from '../types';
import { SUBJECT_INFO, TRANSLATIONS } from '../constants';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: UserStats;
  lang: Language;
  onStartLesson: (subject: Subject, difficulty: Difficulty) => void;
  onStartDaily: () => void;
  onStartExam: (type: 'mini' | 'full') => void;
  onViewChange: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, lang, onStartLesson, onStartDaily, onStartExam, onViewChange }) => {
  const t = TRANSLATIONS[lang];
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Calculate best subject
  const bestSubject = Object.entries(stats.subjectProgress).reduce((a, b) => a[1] > b[1] ? a : b, [Subject.MATH, 0])[0] as Subject;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 pb-20"
    >
      {/* Hero Section - Saturated & Dynamic */}
      <section className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-[40px] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-3xl sm:text-5xl font-black mb-3 tracking-tight flex items-center gap-3"
              >
                {t.welcome} {stats.name} 
                <Hand className="text-yellow-300" size={40} />
              </motion.h1>
              <p className="opacity-80 max-w-md text-lg leading-relaxed font-medium mb-8">{t.subtext}</p>
              
              {/* Mini Stats Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t.hearts, value: stats.hearts, icon: Heart, color: 'bg-red-500/20', iconColor: 'text-red-500' },
                  { label: t.level, value: stats.level, icon: Star, color: 'bg-yellow-500/20', iconColor: 'text-yellow-500' },
                  { label: t.solvedTodayStat, value: stats.solvedToday || 0, icon: CheckCircle, color: 'bg-green-500/20', iconColor: 'text-green-500' },
                  { label: 'STREAK', value: stats.currentStreak, icon: Flame, color: 'bg-orange-500/20', iconColor: 'text-orange-500' }
                ].map((stat, i) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={i} className={`${stat.color} backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center`}>
                      <IconComponent className={`${stat.iconColor} mb-1`} size={24} />
                      <div className="text-[10px] opacity-70 font-black uppercase tracking-widest mb-0.5">{stat.label}</div>
                      <div className="text-xl font-black">{stat.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="hidden lg:flex w-56 h-56 bg-white/10 rounded-full items-center justify-center text-9xl backdrop-blur-md border border-white/20 shadow-inner"
            >
              {stats.avatar}
            </motion.div>
          </div>
          <div className="absolute -right-10 -bottom-10 text-[200px] opacity-5 rotate-12 select-none font-black pointer-events-none">BILIM</div>
        </div>
      </section>

      {/* Quick Actions - New Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={() => onStartLesson(bestSubject, selectedDifficulty)}
          className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-4 hover:bg-blue-50 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="text-blue-600" size={24} />
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-blue-600 uppercase tracking-widest">{t.continue}</div>
            <div className="font-bold text-slate-800">{lang === 'kk' ? SUBJECT_INFO[bestSubject].kk : bestSubject}</div>
          </div>
        </button>
        <button 
          onClick={() => onStartExam('mini')}
          className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-4 hover:bg-purple-50 transition-all group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="text-purple-600" size={24} />
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-purple-600 uppercase tracking-widest">{t.miniExam}</div>
            <div className="font-bold text-slate-800">15 {lang === 'ru' ? 'минут' : 'минут'}</div>
          </div>
        </button>
        <button 
          onClick={() => {
            const subjects = Object.values(Subject);
            const randomSub = subjects[Math.floor(Math.random() * subjects.length)];
            onStartLesson(randomSub, selectedDifficulty);
          }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-4 hover:bg-orange-50 transition-all group"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Dice1 className="text-orange-600" size={24} />
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-orange-600 uppercase tracking-widest">{t.randomQuestion}</div>
            <div className="font-bold text-slate-800">{lang === 'ru' ? 'Испытай удачу' : 'Бағыңды сына'}</div>
          </div>
        </button>
      </section>

      {/* Daily Goal & Streak - New Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
              <Target className="text-orange-500" size={28} />
              {t.dailyGoal}
            </h3>
            <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {stats.solvedToday || 0}/10
            </span>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((stats.solvedToday || 0) / 10) * 100)}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-lg"
            />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            {10 - (stats.solvedToday || 0)} {t.goalProgress}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-black text-white/90 text-xl mb-4 flex items-center gap-2">
              <Flame className="text-yellow-300" size={28} />
              STREAK
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black">{stats.currentStreak}</span>
              <span className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">{t.streakDays}</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 translate-y-4 translate-x-4">
            <Flame className="text-white" size={120} />
          </div>
        </div>
      </section>

      {/* Subjects Section - Larger Cards */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🚀</span> {t.subjects}
          </h2>
          
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedDifficulty === d 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t.difficulty[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.values(Subject).map((sub) => (
            <motion.button
              key={sub}
              whileHover={{ y: -8 }}
              onClick={() => onStartLesson(sub, selectedDifficulty)}
              className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 text-left flex flex-col justify-between min-h-[220px] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div className={`w-20 h-20 rounded-3xl ${SUBJECT_INFO[sub].color} flex items-center justify-center text-5xl shadow-2xl group-hover:rotate-6 transition-transform`}>
                  {SUBJECT_INFO[sub].icon}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.level}</div>
                  <div className="text-2xl font-black text-slate-800">{Math.floor((stats.subjectProgress[sub] || 0) / 10) + 1}</div>
                </div>
              </div>

              <div className="relative z-10 mt-8">
                <h3 className="font-black text-slate-800 text-2xl group-hover:text-blue-600 transition-colors mb-4">
                  {lang === 'kk' ? SUBJECT_INFO[sub].kk : sub}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Progress</span>
                    <span>{stats.subjectProgress[sub] || 0} XP</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (stats.subjectProgress[sub] || 0) % 100)}%` }}
                      className={`h-full ${SUBJECT_INFO[sub].color} rounded-full shadow-sm`}
                    />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Statistics Section - New Section */}
      <section className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <BarChart3 className="text-blue-400" size={32} />
            {t.stats}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center sm:text-left">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.correctAnswers}</div>
              <div className="text-4xl font-black text-green-400">{stats.correctAnswers || 0}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.errors}</div>
              <div className="text-4xl font-black text-red-400">{stats.mistakesCount || 0}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.bestSubject}</div>
              <div className="text-xl font-black text-blue-400 truncate">
                {lang === 'kk' ? SUBJECT_INFO[bestSubject].kk : bestSubject}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weak Topics Analysis */}
      {stats.weakTopics && Object.keys(stats.weakTopics).length > 0 && (
        <section className="bg-red-50 rounded-[40px] p-8 border border-red-100">
          <h2 className="text-xl font-black text-red-800 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={28} />
            {t.weakTopics}
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.weakTopics)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([topic, count]) => (
                <div key={topic} className="bg-white px-5 py-3 rounded-2xl border border-red-200 shadow-sm flex items-center gap-3">
                  <span className="font-bold text-slate-700">{topic}</span>
                  <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-lg">
                    {t.needsImprovement} ({count})
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default Dashboard;
