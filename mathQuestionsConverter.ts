// Helper to convert new math questions format to QUESTION_BANK format
import { MATH_QUESTIONS_NEW } from './mathQuestions';

export const convertMathQuestions = () => {
  return MATH_QUESTIONS_NEW.map((q: any, index: number) => {
    const correctAns = String(q.answer).split(' ')[0];
    let wrongOptions = [];
    if (!isNaN(Number(correctAns))) {
      const baseNum = Number(correctAns);
      wrongOptions = [String(baseNum - 1), String(baseNum + 1), String(Math.round(baseNum * 1.5))];
    } else {
      wrongOptions = ['Неверно 1', 'Неверно 2', 'Неверно 3'];
    }
    // Исключаем дубли
    const optionsRu = Array.from(new Set([correctAns, ...wrongOptions])).sort(() => Math.random() - 0.5);
    return {
      id: `m_new_${index + 1}`,
      question: { ru: q.question, kk: q.question },
      options: { ru: optionsRu, kk: optionsRu },
      correctAnswer: { ru: correctAns, kk: correctAns },
      explanation: { ru: q.explanation, kk: q.explanation }
    };
  });
};

export const NEW_MATH_QUESTIONS = convertMathQuestions();
