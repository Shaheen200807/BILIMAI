import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { Subject, Language } from '../types';
import { SUBJECT_INFO } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  lang: Language;
  onClose: () => void;
}

interface Question {
  id: string;
  subject: Subject;
  question: { ru: string; kk: string };
  options: { ru: string[]; kk: string[] };
  correctAnswer: { ru: string; kk: string };
  explanation: { ru: string; kk: string };
}

const AdminPanel: React.FC<AdminPanelProps> = ({ lang, onClose }) => {
  const [tab, setTab] = useState<'users' | 'questions'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: '',
    subject: Subject.MATH,
    question: { ru: '', kk: '' },
    options: { ru: ['', '', '', ''], kk: ['', '', '', ''] },
    correctAnswer: { ru: '', kk: '' },
    explanation: { ru: '', kk: '' }
  });

  const t = {
    ru: {
      admin: 'Админ-панель',
      users: 'Пользователи',
      questions: 'Вопросы',
      add: 'Добавить',
      edit: 'Редактировать',
      delete: 'Удалить',
      save: 'Сохранить',
      cancel: 'Отмена',
      noUsers: 'Нет пользователей',
      noQuestions: 'Нет вопросов',
      newQuestion: 'Новый вопрос',
      subject: 'Предмет',
      questionText: 'Текст вопроса',
      options: 'Варианты ответов',
      correct: 'Правильный ответ',
      explanation: 'Объяснение',
      added: 'Вопрос добавлен!',
      deleted: 'Вопрос удален!'
    },
    kk: {
      admin: 'Админ-панель',
      users: 'Пользователи',
      questions: 'Сұрақтар',
      add: 'Қосу',
      edit: 'Өндеу',
      delete: 'Жою',
      save: 'Сақтау',
      cancel: 'Бас тарту',
      noUsers: 'Пользователилер жоқ',
      noQuestions: 'Сұрақтар жоқ',
      newQuestion: 'Жаңа сұрақ',
      subject: 'Пәні',
      questionText: 'Сұрақ мәтіні',
      options: 'Жауап нұсқалары',
      correct: 'Дұрыс жауап',
      explanation: 'Түсіндіргіш',
      added: 'Сұрақ қосылды!',
      deleted: 'Сұрақ жойылды!'
    }
  };

  const texts = t[lang];

  const handleAddQuestion = () => {
    if (newQuestion.question.ru && newQuestion.correctAnswer.ru) {
      setQuestions([...questions, { ...newQuestion, id: `q_${Date.now()}` }]);
      setShowNewQuestion(false);
      alert(texts.added);
      setNewQuestion({
        id: '',
        subject: Subject.MATH,
        question: { ru: '', kk: '' },
        options: { ru: ['', '', '', ''], kk: ['', '', '', ''] },
        correctAnswer: { ru: '', kk: '' },
        explanation: { ru: '', kk: '' }
      });
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    alert(texts.deleted);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Users size={28} /> {texts.admin}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setTab('users')}
            className={`flex-1 py-4 font-black uppercase tracking-widest transition-all ${
              tab === 'users'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {texts.users}
          </button>
          <button
            onClick={() => setTab('questions')}
            className={`flex-1 py-4 font-black uppercase tracking-widest transition-all ${
              tab === 'questions'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {texts.questions}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Users Tab */}
          {tab === 'users' && (
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-slate-500 text-center py-8">{texts.noUsers}</p>
              ) : (
                users.map(user => (
                  <div key={user.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-left">
                        <h3 className="font-black text-slate-800">{user.name}</h3>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      {expandedUser === user.id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    <AnimatePresence>
                      {expandedUser === user.id && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="bg-slate-50 p-4 border-t border-slate-200 space-y-2 text-sm"
                        >
                          <p><span className="font-bold">Баллы:</span> {user.points}</p>
                          <p><span className="font-bold">Решено:</span> {user.solvedCount}</p>
                          <p><span className="font-bold">Уровень:</span> {user.level}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Questions Tab */}
          {tab === 'questions' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowNewQuestion(!showNewQuestion)}
                className="w-full bg-blue-600 text-white font-black py-3 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> {texts.newQuestion}
              </button>

              {/* New Question Form */}
              <AnimatePresence>
                {showNewQuestion && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4"
                  >
                    <div>
                      <label className="block font-black mb-2">{texts.subject}</label>
                      <select
                        value={newQuestion.subject}
                        onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value as Subject })}
                        className="w-full p-3 border border-slate-200 rounded-lg"
                      >
                        {Object.values(Subject).map(sub => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-black mb-2">Вопрос (РУ)</label>
                      <textarea
                        value={newQuestion.question.ru}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          question: { ...newQuestion.question, ru: e.target.value }
                        })}
                        className="w-full p-3 border border-slate-200 rounded-lg"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block font-black mb-2">Вопрос (ККЛ)</label>
                      <textarea
                        value={newQuestion.question.kk}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          question: { ...newQuestion.question, kk: e.target.value }
                        })}
                        className="w-full p-3 border border-slate-200 rounded-lg"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block font-black mb-2">{texts.correct}</label>
                      <input
                        type="text"
                        value={newQuestion.correctAnswer.ru}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          correctAnswer: { ...newQuestion.correctAnswer, ru: e.target.value }
                        })}
                        className="w-full p-3 border border-slate-200 rounded-lg mb-2"
                        placeholder="РУ"
                      />
                      <input
                        type="text"
                        value={newQuestion.correctAnswer.kk}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          correctAnswer: { ...newQuestion.correctAnswer, kk: e.target.value }
                        })}
                        className="w-full p-3 border border-slate-200 rounded-lg"
                        placeholder="ККЛ"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddQuestion}
                        className="flex-1 bg-green-600 text-white font-black py-3 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={20} /> {texts.save}
                      </button>
                      <button
                        onClick={() => setShowNewQuestion(false)}
                        className="flex-1 bg-slate-300 text-slate-800 font-black py-3 rounded-lg hover:bg-slate-400 transition-all"
                      >
                        {texts.cancel}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Questions List */}
              {questions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">{texts.noQuestions}</p>
              ) : (
                questions.map(question => (
                  <div key={question.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-left">
                        <h3 className="font-black text-slate-800 mb-1">{question.question.ru.substring(0, 50)}</h3>
                        <p className="text-sm text-slate-500">{question.subject}</p>
                      </div>
                      {expandedQuestion === question.id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    <AnimatePresence>
                      {expandedQuestion === question.id && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="bg-slate-50 p-4 border-t border-slate-200 space-y-3 text-sm"
                        >
                          <div>
                            <p className="font-bold mb-1">Варианты (РУ):</p>
                            <p className="text-slate-600">{question.options.ru.join(', ')}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="w-full bg-red-100 text-red-600 font-black py-2 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                          >
                            <Trash2 size={16} /> {texts.delete}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
