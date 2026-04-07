
import React, { useState, useEffect, useCallback } from 'react';
import { Brain } from 'lucide-react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import ParentDashboard from './components/ParentDashboard';
import AuthView from './components/AuthView';
import ProfileView from './components/ProfileView';
import { UserStats, View, Subject, Problem, Language, AppMode, Difficulty } from './types';
import { INITIAL_ACHIEVEMENTS, TRANSLATIONS, QUESTION_BANK } from './constants';
import { generateProblem } from './services/geminiService';
import { signUp, signIn, signOut, getUserStats, updateUserStats, saveLessonHistory, getCurrentSession } from './services/supabaseService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('bilimai_lang') as Language) || 'ru';
  });
  
  const [view, setView] = useState<View>('auth');
  const [mode, setMode] = useState<AppMode>('lesson');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (session?.user) {
          setUserId(session.user.id);
          const userStats = await getUserStats(session.user.id);
          if (userStats) {
            setStats(userStats);
            setView('dashboard');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Sync current stats to database whenever they change
  useEffect(() => {
    if (stats && userId) {
      updateUserStats(userId, stats).catch(err => console.error('Failed to sync stats:', err));
    }
  }, [stats, userId]);

  useEffect(() => {
    localStorage.setItem('bilimai_lang', lang);
  }, [lang]);

  const handleAuth = async (email: string, password: string, name: string, isNew: boolean) => {
    const t = TRANSLATIONS[lang];
    
    try {
      if (isNew) {
        // Sign up
        const result = await signUp(email, password, name);
        if (result.success && result.userId) {
          setUserId(result.userId);
          const userStats = await getUserStats(result.userId);
          if (userStats) {
            setStats(userStats);
            setView('dashboard');
          }
        }
      } else {
        // Sign in
        const result = await signIn(email, password);
        if (result.success && result.userId) {
          setUserId(result.userId);
          const userStats = await getUserStats(result.userId);
          if (userStats) {
            setStats(userStats);
            setView('dashboard');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMsg = (error?.message || error?.error_description || error?.toString() || '').toLowerCase();
      
      if (isNew) {
        // Sign up errors
        if (errorMsg.includes('already registered') || errorMsg.includes('User already exists') || errorMsg.includes('duplicate')) {
          alert(lang === 'ru' ? "Такой email уже зарегистрирован!" : "Бұл email тіркеліп қойған!");
        } else if (errorMsg.includes('password') && errorMsg.includes('too')) {
          alert(lang === 'ru' ? "Пароль должен быть минимум 6 символов" : "Құпия сөз кем дегенде 6 таңба болуы керек");
        } else if (errorMsg.includes('invalid') || errorMsg.includes('email')) {
          alert(lang === 'ru' ? "Некорректный email адрес" : "Email мекенжайы дұрыс емес");
        } else {
          alert(lang === 'ru' ? `Ошибка регистрации: ${error?.message || 'попробуй еще раз'}` : `Тіркелу қатесі: ${error?.message || 'қайта байқап көр'}`);
        }
      } else {
        // Sign in errors
        if (errorMsg.includes('invalid') || errorMsg.includes('wrong') || errorMsg.includes('denied')) {
          alert(t.wrongPassword);
        } else if (errorMsg.includes('not found')) {
          alert(t.userNotFound);
        } else {
          alert(lang === 'ru' ? `Ошибка входа: ${error?.message || 'проверь email и пароль'}` : `Кіру қатесі: ${error?.message || 'email және құпия сөзді тексеру'}`);
        }
      }
    }
  };

  const handleLogout = async () => {
    const confirmMsg = lang === 'ru' ? 'Вы точно хотите выйти?' : 'Шынымен шыққыңыз келе ме?';
    if (window.confirm(confirmMsg)) {
      await signOut();
      setStats(null);
      setUserId(null);
      setView('auth');
    }
  };

  const checkAchievements = (newStats: UserStats): any[] => {
    return newStats.achievements.map(ach => {
      if (ach.unlocked) return ach;
      let isUnlocked = false;
      if (ach.type === 'points' && newStats.points >= ach.requirement) isUnlocked = true;
      if (ach.type === 'solved' && newStats.solvedCount >= ach.requirement) isUnlocked = true;
      if (ach.type === 'streak' && newStats.currentStreak >= ach.requirement) isUnlocked = true;
      return isUnlocked ? { ...ach, unlocked: true } : ach;
    });
  };

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const startLesson = async (subject: Subject, difficulty: Difficulty = 'medium') => {
    if (!stats || stats.hearts <= 0) {
      alert(lang === 'ru' ? "Восстанови сердца в профиле! ❤️" : "Профильде жүректі толтыр! ❤️");
      return;
    }
    
    setIsGenerating(true);
    setMode('lesson');
    try {
      const problem = await generateProblem(subject, lang, difficulty, 10);
      setCurrentProblem(problem);
      setView('lesson');
    } catch (e) {
      alert("AI Error: " + e);
    } finally {
      setIsGenerating(false);
    }
  };

  const startDailyPractice = async () => {
    if (!stats || stats.hearts <= 0) {
      alert(lang === 'ru' ? "Восстанови сердца в профиле! ❤️" : "Профильде жүректі толтыр! ❤️");
      return;
    }
    setIsGenerating(true);
    setMode('daily');
    try {
      const subjects = Object.values(Subject);
      const allSteps = [];
      for (const sub of subjects) {
        const prob = await generateProblem(sub, lang, 'medium', 3);
        allSteps.push(...prob.steps);
      }
      const shuffledSteps = allSteps.sort(() => 0.5 - Math.random()).slice(0, 10);
      
      const problem: Problem = {
        id: 'daily-' + Date.now(),
        title: TRANSLATIONS[lang].dailyPractice,
        subject: Subject.MATH, // Mixed
        difficulty: 'medium',
        steps: shuffledSteps
      };
      setCurrentProblem(problem);
      setView('lesson');
    } catch (e) {
      alert("AI Error: " + e);
    } finally {
      setIsGenerating(false);
    }
  };

  const startExam = async (examType: 'mini' | 'full') => {
    setIsGenerating(true);
    setMode(examType === 'mini' ? 'mini-exam' : 'full-exam');
    try {
      const count = examType === 'mini' ? 10 : 40;
      const subjects = Object.values(Subject);
      const stepsPerSubject = count / subjects.length;
      
      const allSteps = [];
      for (const sub of subjects) {
        const prob = await generateProblem(sub, lang, 'hard', stepsPerSubject);
        allSteps.push(...prob.steps);
      }
      
      const problem: Problem = {
        id: examType + '-exam-' + Date.now(),
        title: examType === 'mini' ? TRANSLATIONS[lang].miniExam : TRANSLATIONS[lang].fullExam,
        subject: Subject.MATH, // Mixed
        difficulty: 'hard',
        steps: allSteps.sort(() => 0.5 - Math.random())
      };
      setCurrentProblem(problem);
      setView('lesson');
    } catch (e) {
      alert("AI Error: " + e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLessonFinish = (earnedPoints: number, heartsLost: number, mistakesByTopic?: Record<string, number>) => {
    if (!stats || !currentProblem || !userId) return;
    
    setStats(prev => {
      if (!prev) return null;
      const newPoints = Math.max(0, prev.points + earnedPoints);
      const newHearts = Math.max(0, prev.hearts - heartsLost);
      const newSolvedCount = prev.solvedCount + 1;
      const newLevel = Math.floor(newPoints / 500) + 1;
      
      const newSubProg = { ...(prev.subjectProgress || {}) };
      const sub = currentProblem.subject;
      newSubProg[sub] = (newSubProg[sub] || 0) + 1;

      const newWeakTopics = { ...(prev.weakTopics || {}) };
      let totalMistakes = 0;
      if (mistakesByTopic) {
        Object.entries(mistakesByTopic).forEach(([topic, count]) => {
          newWeakTopics[topic] = (newWeakTopics[topic] || 0) + count;
          totalMistakes += count;
        });
      }

      const totalQuestions = currentProblem.steps.length;
      const correctInThisLesson = Math.max(0, totalQuestions - totalMistakes);
      
      let tempStats = { 
        ...prev, 
        points: newPoints, 
        hearts: newHearts, 
        solvedCount: newSolvedCount, 
        solvedToday: (prev.solvedToday || 0) + 1,
        correctAnswers: (prev.correctAnswers || 0) + correctInThisLesson,
        mistakesCount: (prev.mistakesCount || 0) + totalMistakes,
        level: newLevel,
        subjectProgress: newSubProg,
        weakTopics: newWeakTopics,
        lastActivityDate: new Date().toDateString()
      };
      tempStats.achievements = checkAchievements(tempStats);
      
      // Save lesson history
      saveLessonHistory(userId, currentProblem.subject, currentProblem.difficulty, correctInThisLesson, totalQuestions, earnedPoints)
        .catch(err => console.error('Failed to save lesson history:', err));
      
      return tempStats;
    });
    setView('dashboard');
    setCurrentProblem(null);
  };

  const t = TRANSLATIONS[lang];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="text-blue-600" size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{t.loading}</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 flex flex-col bg-slate-50">
      {stats && <Header stats={stats} lang={lang} onLanguageChange={setLang} onViewChange={setView} />}
      
      <main className="container mx-auto flex-grow px-4">
        {isGenerating && (
          <div className="fixed inset-0 z-[60] bg-white/95 flex flex-col items-center justify-center p-10 text-center backdrop-blur-md animate-fade-in">
            <div className="w-24 h-24 mb-6 relative">
               <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Brain className="text-blue-600" size={48} />
               </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">{t.loading}</h2>
          </div>
        )}

        {view === 'auth' && !stats && <AuthView onAuth={handleAuth} lang={lang} />}
        
        {stats && view === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            lang={lang} 
            onStartLesson={startLesson} 
            onStartDaily={startDailyPractice}
            onStartExam={startExam}
            onViewChange={setView} 
          />
        )}

        {stats && view === 'profile' && (
          <ProfileView stats={stats} lang={lang} onLogout={handleLogout} />
        )}

        {stats && view === 'lesson' && currentProblem && (
          <LessonView 
            problem={currentProblem} 
            lang={lang}
            userHearts={stats.hearts}
            mode={mode}
            onFinish={handleLessonFinish}
            onExit={() => {
              setView('dashboard');
              setCurrentProblem(null);
            }}
            onRestart={() => {
              if (mode === 'lesson' && currentProblem) {
                startLesson(currentProblem.subject, currentProblem.difficulty);
              } else if (mode === 'daily') {
                startDailyPractice();
              } else if (mode === 'mini-exam') {
                startExam('mini');
              } else if (mode === 'full-exam') {
                startExam('full');
              }
            }}
          />
        )}

        {stats && view === 'parent' && <ParentDashboard stats={stats} lang={lang} />}
      </main>
    </div>
  );
};

export default App;
