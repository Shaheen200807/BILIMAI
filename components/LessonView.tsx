
import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Heart, AlertCircle, CheckCircle, Volume2, Clock, Sparkles, Hourglass, Lightbulb, MessageCircle } from 'lucide-react';
import { Problem, Language, Step, AppMode } from '../types';
import { getAIExplanation, speakText, generateProblem } from '../services/geminiService';
import { SUBJECT_INFO, TRANSLATIONS } from '../constants';
import { ChatAI } from './ChatAI';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface LessonViewProps {
  problem: Problem;
  lang: Language;
  userHearts: number;
  mode: AppMode;
  onFinish: (earnedPoints: number, heartsLost: number, mistakesByTopic?: Record<string, number>) => void;
  onExit: () => void;
  onRestart?: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ problem, lang, userHearts, mode, onFinish, onExit, onRestart }) => {
  const [steps, setSteps] = useState<Step[]>(problem.steps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [heartsUsed, setHeartsUsed] = useState(0);
  const [heartsGained, setHeartsGained] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [mistakesByTopic, setMistakesByTopic] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [shake, setShake] = useState(false);
  const [motivationMsg, setMotivationMsg] = useState<string | null>(null);
  const [openChatAI, setOpenChatAI] = useState(false);
  
  // Timer for exam modes
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (mode === 'mini-exam') return 15 * 60;
    if (mode === 'full-exam') return 60 * 60;
    return null;
  });

  // Exam results tracking
  const [examResults, setExamResults] = useState<{ step: Step; selected: string; correct: boolean }[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [triedOptions, setTriedOptions] = useState<string[]>([]);

  const t = TRANSLATIONS[lang];
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleFinish();
    }
  }, [timeLeft]);

  const handleOptionClick = async (option: string) => {
    if (isCorrect === true && mode !== 'full-exam') return; // Already got it right, locked
    
    // If already tried this option before, just select it but don't penalize again
    if (triedOptions.includes(option)) {
      setSelectedOption(option);
      const correct = option === currentStep.correctAnswer;
      setIsCorrect(correct);
      return;
    }

    setSelectedOption(option);
    const correct = option === currentStep.correctAnswer;

    if (mode === 'full-exam') {
      setIsCorrect(correct);
      setTriedOptions(prev => [...prev, option]);
      return;
    }

    setIsCorrect(correct);
    setTriedOptions(prev => [...prev, option]);
    
    if (correct) {
      const randomMotivation = t.motivation[Math.floor(Math.random() * t.motivation.length)];
      setMotivationMsg(randomMotivation);
      setTimeout(() => setMotivationMsg(null), 1500);
      
      // Add hearts on correct answer (max 3 total)
      if (userHearts - heartsUsed + heartsGained < 3) {
        setHeartsGained(prev => prev + 1);
      }
      
      if (currentStepIndex === steps.length - 1) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      setShake(true);
      setTotalMistakes(prev => prev + 1);
      setHeartsUsed(prev => prev + 1);
      
      if (currentStep.topic) {
        setMistakesByTopic(prev => ({
          ...prev,
          [currentStep.topic!]: (prev[currentStep.topic!] || 0) + 1
        }));
      }

      if (userHearts - (heartsUsed + 1) + heartsGained <= 0) {
        setIsGameOver(true);
      }

      setTimeout(() => setShake(false), 500);
    }
  };

  const handleShowExplanation = async () => {
    if (showExplanation || aiExplanation) return;
    
    if (userHearts - (heartsUsed + 1) < 0) {
      alert(t.noHeartsExplanation);
      return;
    }

    setHeartsUsed(prev => prev + 1);
    setShowExplanation(true);

    if (userHearts - (heartsUsed + 1) <= 0) {
      setIsGameOver(true);
    }

    setIsLoadingAi(true);
    try {
      const explanation = await getAIExplanation(
        currentStep.question,
        currentStep.options,
        currentStep.correctAnswer,
        selectedOption || "Help requested",
        problem.subject,
        lang
      );
      setAiExplanation(explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const nextStep = () => {
    if (mode === 'full-exam') {
      setExamResults(prev => [...prev, { step: currentStep, selected: selectedOption!, correct: selectedOption === currentStep.correctAnswer }]);
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setAiExplanation(null);
      setShowExplanation(false);
      setTriedOptions([]);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const earnedPoints = Math.max(0, (steps.length * 10) - (totalMistakes * 5));
    // Calculate net hearts change (negative = lost, positive = gained)
    const netHeartsChange = heartsGained - heartsUsed;
    onFinish(earnedPoints, -netHeartsChange, mistakesByTopic);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGameOver) {
    return (
      <div className="max-w-md mx-auto p-8 text-center flex flex-col items-center justify-center min-h-screen gap-8">
        <div className="text-9xl animate-bounce">💔</div>
        <h2 className="text-4xl font-black text-slate-800">{t.tryAgain}</h2>
        <p className="text-slate-500 text-lg">{lang === 'ru' ? 'Сердца закончились! Но не сдавайся.' : 'Жүректер таусылды! Бірақ берілме.'}</p>
        <button 
          onClick={onRestart || onExit}
          className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          {t.restart}
        </button>
        <button 
          onClick={onExit}
          className="w-full bg-slate-100 text-slate-500 font-black py-5 rounded-3xl hover:bg-slate-200 transition-all"
        >
          {lang === 'ru' ? 'Выйти' : 'Шығу'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col min-h-screen pb-24 relative">
      <AnimatePresence>
        {motivationMsg && (
          <motion.div 
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1.2, y: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[100] text-6xl font-black text-blue-600 drop-shadow-2xl pointer-events-none"
          >
            {motivationMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => setOpenChatAI(true)} 
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm font-black"
            >
              <MessageCircle size={20} /> 
              <span className="hidden sm:inline">{lang === 'ru' ? 'Чат AI' : 'AI Чаты'}</span>
            </button>
            <button onClick={onExit} className="text-slate-400 hover:text-slate-600 transition-colors">
              ✕ {lang === 'ru' ? 'Выйти' : 'Шығу'}
            </button>
          </div>
          {timeLeft !== null && (
            <div className={`px-6 py-2 rounded-2xl font-black text-lg shadow-sm border-2 flex items-center gap-2 ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-100 text-slate-700'}`}>
              <Clock size={20} /> {formatTime(timeLeft)}
            </div>
          )}
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-1">
              <Heart className="text-red-500" size={20} />
              <span className="font-black">{userHearts - heartsUsed + heartsGained}</span>
            </div>
          </div>
        </div>

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-sm"
          />
        </div>
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentStepIndex}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`bg-white rounded-[48px] p-8 sm:p-12 shadow-2xl shadow-blue-100/50 border border-blue-50 flex-grow flex flex-col ${shake ? 'animate-shake' : ''}`}
      >
        <div className="mb-6">
          <span className={`px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg ${SUBJECT_INFO[problem.subject].color}`}>
            {SUBJECT_INFO[problem.subject].icon} {lang === 'kk' ? SUBJECT_INFO[problem.subject].kk : problem.subject}
          </span>
          {currentStep.topic && (
            <span className="ml-3 text-slate-400 text-xs font-bold">#{currentStep.topic}</span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-10 leading-tight">
          {currentStep.question}
        </h2>

        <div className="grid grid-cols-1 gap-4 mb-10">
          {currentStep.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            let stateClass = "border-slate-100 hover:border-blue-200 bg-slate-50/50 text-slate-700";
            
            if (isSelected) {
              if (mode === 'full-exam') {
                stateClass = "border-blue-500 bg-blue-50 text-blue-700 shadow-lg ring-4 ring-blue-100";
              } else {
                stateClass = isCorrect 
                  ? "border-green-500 bg-green-50 text-green-700 shadow-lg ring-4 ring-green-100" 
                  : "border-red-500 bg-red-50 text-red-700 shadow-lg ring-4 ring-red-100";
              }
            }
            
            return (
              <button
                key={idx}
                disabled={isCorrect === true && mode !== 'full-exam'}
                onClick={() => handleOptionClick(option)}
                className={`group relative w-full text-left p-6 rounded-3xl border-2 font-bold text-lg transition-all duration-300 active:scale-[0.98] ${stateClass}`}
              >
                <div className="flex justify-between items-center gap-4">
                  <span className="flex-1">{option}</span>
                  {isSelected && mode !== 'full-exam' && (
                    <span>
                      {isCorrect ? (
                        <Sparkles className="text-green-500" size={24} />
                      ) : (
                        <AlertCircle className="text-red-500" size={24} />
                      )}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 mb-10">
          {selectedOption && !showExplanation && !aiExplanation && mode !== 'full-exam' && (
            <button
              onClick={handleShowExplanation}
              disabled={isLoadingAi}
              className="w-full py-4 bg-orange-50 text-orange-600 border-2 border-orange-100 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
            >
              {isLoadingAi ? (
                <Hourglass className="animate-spin text-orange-600" size={20} />
              ) : (
                <>
                  <Lightbulb className="text-orange-600" size={20} />
                  {t.showExplanationCost}
                </>
              )}
            </button>
          )}
        </div>

        {/* Feedback Section */}
        <AnimatePresence>
          {aiExplanation ? (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mb-6 flex gap-5 items-start shadow-inner"
            >
              <Brain className="text-blue-600 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h4 className="font-black text-blue-800 text-xs mb-2 uppercase tracking-widest">BilimAI {t.explanation}</h4>
                <p className="text-blue-900 text-sm leading-relaxed font-bold italic">"{aiExplanation}"</p>
                <button 
                  onClick={() => speakText(aiExplanation)} 
                  className="inline-flex items-center gap-2 text-[10px] font-black text-blue-500 mt-4 hover:text-blue-700 uppercase tracking-widest"
                >
                  <Volume2 size={14} /> {t.listen}
                </button>
              </div>
            </motion.div>
          ) : showExplanation && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-green-50 border border-green-100 rounded-3xl p-6 mb-6 shadow-inner"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-black text-green-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                  🌟 {t.explanation}
                </h4>
                <button onClick={() => speakText(currentStep.explanation)} className="text-blue-500 hover:text-blue-700 transition-colors">
                  <Volume2 size={20} />
                </button>
              </div>
              <p className="text-green-700 text-sm leading-relaxed font-bold">{currentStep.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Actions */}
      <div className="mt-8">
        {selectedOption && (isCorrect === true || mode !== 'lesson') && (
          <button
            onClick={nextStep}
            className="w-full bg-blue-600 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-95 text-xl"
          >
            <span>{currentStepIndex < steps.length - 1 ? t.next : t.finish}</span>
            <span className="text-3xl">🚀</span>
          </button>
        )}
      </div>

      {/* Chat AI Modal */}
      {openChatAI && <ChatAI lang={lang} onClose={() => setOpenChatAI(false)} />}
    </div>
  );
};

export default LessonView;
