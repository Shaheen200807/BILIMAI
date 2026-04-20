import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Loader, Volume2, Copy, Check } from 'lucide-react';
import { Language } from '../types';
import { getAIExplanation, speakText } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAIProps {
  lang: Language;
  onClose: () => void;
}

export const ChatAI: React.FC<ChatAIProps> = ({ lang, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: lang === 'ru' 
        ? '👋 Привет! Я здесь, чтобы объяснить тебе математику с примерами. Что ты хочешь узнать?' 
        : '👋 Сәлем! Мен математиканы мысалдармен түсіндіруге көмектесемін. Не білгің келеді?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const prompt = lang === 'ru'
        ? `Ты опытный учитель математики. Ученик задал вопрос: "${input}"\n\nОтветь подробно, с примерами и пошаговым объяснением. Используй простой язык.`
        : `Сіз математика ұстазысыз. Оқушы сұрақ қойды: "${input}"\n\nЕгжей-тегжейлі жауап беріңіз, мысалдармен және қадамдық түсіндірмемен. Қарай тіл қолданыңыз.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: lang === 'ru' 
          ? '❌ Извини, у меня была ошибка. Попробуй еще раз.' 
          : '❌ Кешіріңіз, қате болды. Қайта байланысыныз.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
      <div className="w-full md:w-2xl h-[80vh] md:h-[70vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-3xl md:rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={28} />
            <div>
              <h2 className="text-xl font-black">
                {lang === 'ru' ? 'AI Помощник' : 'AI Көмекші'}
              </h2>
              <p className="text-blue-100 text-xs">
                {lang === 'ru' ? 'Объяснения с примерами' : 'Мысалдармен түсіндіргіш'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-2 rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 font-black text-sm">
                  AI
                </div>
              )}
              
              <div
                className={`max-w-xs md:max-w-md p-4 rounded-3xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {message.role === 'assistant' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => speakText(message.content)}
                      className="text-slate-500 hover:text-blue-600 transition-colors"
                      title={lang === 'ru' ? 'Слушать' : 'Тыңдау'}
                    >
                      <Volume2 size={16} />
                    </button>
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="text-slate-500 hover:text-blue-600 transition-colors"
                      title={lang === 'ru' ? 'Копировать' : 'Көшіру'}
                    >
                      {copied === message.id ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-300 flex-shrink-0" />
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 font-black text-sm">
                AI
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-3xl">
                <Loader className="animate-spin text-blue-600" size={20} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4 bg-white rounded-b-3xl md:rounded-b-3xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={lang === 'ru' ? 'Твой вопрос...' : 'Сенің сұрағың...'}
              className="flex-1 px-4 py-3 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
