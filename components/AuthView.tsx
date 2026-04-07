
import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface AuthViewProps {
  onAuth: (email: string, password: string, name: string, isNew: boolean) => Promise<void>;
  lang: Language;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuth, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const t = TRANSLATIONS[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert(t.authError);
      return;
    }
    
    if (!isLogin && !trimmedName) {
      alert(t.authError);
      return;
    }

    setLoading(true);
    try {
      await onAuth(trimmedEmail, trimmedPassword, trimmedName, !isLogin);
      // Success - loading state will remain until we're navigated away
    } catch (err) {
      // Error was handled by parent, reset loading after a delay to allow retry
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="bg-white p-8 sm:p-12 rounded-[48px] shadow-2xl shadow-blue-100/50 max-w-md w-full border border-white animate-fade-in relative z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] mx-auto mb-8 flex items-center justify-center text-white shadow-2xl shadow-blue-200 animate-float">
          <Brain size={48} />
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
            {isLogin ? t.login : t.signup}
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">BILIMAI • Future NIS Student</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.enterName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alisher"
                autoComplete="name"
                className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              autoComplete="email"
              className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all mt-4 flex items-center justify-center text-lg uppercase tracking-widest ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white animate-spin rounded-full"></div>
            ) : (
              isLogin ? t.login : t.letsGo
            )}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setLoading(false);
          }}
          className="w-full text-center mt-8 text-xs font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
        >
          {isLogin ? t.noAccount : t.haveAccount}
        </button>
      </div>
    </div>
  );
};

export default AuthView;
