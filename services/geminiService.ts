
import { Subject, Problem, Language, Difficulty } from '../types';
import { QUESTION_BANK } from '../constants';

// Generate problem from QUESTION_BANK only (no API calls)
export const generateProblem = async (
  subject: Subject, 
  lang: Language, 
  difficulty: Difficulty = 'medium',
  count: number = 1
): Promise<Problem> => {
  try {
    const questions = QUESTION_BANK[subject] || [];
    if (questions.length === 0) {
      throw new Error(`No questions found for subject: ${subject}`);
    }

    const steps = [];
    const selectedIndices = new Set<number>();
    
    for (let i = 0; i < Math.min(count, questions.length); i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * questions.length);
      } while (selectedIndices.has(randomIndex) && selectedIndices.size < questions.length);
      
      selectedIndices.add(randomIndex);
      const q = questions[randomIndex];
      
      steps.push({
        id: q.id,
        question: q.question[lang],
        options: q.options[lang],
        correctAnswer: q.correctAnswer[lang],
        explanation: q.explanation[lang],
        topic: q.topic || subject,
        difficulty: difficulty
      });
    }

    return {
      id: `problem_${Date.now()}`,
      title: subject,
      subject: subject,
      difficulty: difficulty,
      steps: steps
    };
  } catch (error) {
    console.error("Error generating problem:", error);
    throw error;
  }
};

// Get AI Explanation - returns explanation from question
export const getAIExplanation = async (
  question: string, 
  options: string[], 
  correctAnswer: string, 
  userAnswer: string,
  subject: Subject, 
  lang: Language
): Promise<string> => {
  const questions = QUESTION_BANK[subject] || [];
  const matchingQuestion = questions.find(q => 
    q.question[lang].substring(0, 30) === question.substring(0, 30)
  );
  
  if (matchingQuestion) {
    return matchingQuestion.explanation[lang];
  }
  
  return lang === 'ru' 
    ? `Правильный ответ: "${correctAnswer}". Посмотри на объяснение в вопросе.`
    : `Дұрыс жауабы: "${correctAnswer}". Сұрақтағы түсіндіргішті қарап шығ.`;
};

// Get AI Hint
export const getAIHint = async (
  problemTitle: string, 
  currentStepText: string, 
  subject: Subject, 
  lang: Language
): Promise<string> => {
  const hints = {
    ru: [
      "Внимательно прочитай вопрос еще раз.",
      "Подумай о вариантах ответов.",
      "Проверь свои вычисления.",
      "Может быть, нужно использовать другой способ решения?",
      "Что происходит, если...?"
    ],
    kk: [
      "Сұрақты қайта мательно оқи.",
      "Жауап нұсқаларын ойла.",
      "Өзің есептеулеріңді тексер.",
      "Балмасы өзге шешу ысулы колдану?",
      "Егер..."
    ]
  };
  
  const hintList = hints[lang];
  return hintList[Math.floor(Math.random() * hintList.length)];
};

// Text to Speech using Web Audio API (no API key needed)
export const speakText = async (text: string): Promise<void> => {
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.error("TTS failed:", e);
  }
};
