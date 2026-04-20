// Helper to convert new math questions format to QUESTION_BANK format
import { MATH_QUESTIONS_NEW } from './mathQuestions';

export const convertMathQuestions = () => {
  return MATH_QUESTIONS_NEW.map((q: any, index: number) => {
    // Create some wrong options based on the answer
    const wrongOptions = [];
    const correctAns = String(q.answer).split(' ')[0]; // Get just the number

    // Generate 3 wrong options by modifying the answer
    if (!isNaN(Number(correctAns))) {
      const baseNum = Number(correctAns);
      wrongOptions.push(String(baseNum - 1));
      wrongOptions.push(String(baseNum + 1));
      wrongOptions.push(String(Math.round(baseNum * 1.5)));
    } else {
      // For non-numeric answers, provide plausible alternatives
      wrongOptions.push('Неверно 1', 'Неверно 2', 'Неверно 3');
    }

    // Shuffle options and add correct answer
    const optionsRu = [correctAns, ...wrongOptions].sort(() => Math.random() - 0.5);

    return {
      id: `m_new_${index + 1}`,
      question: { ru: q.question, kk: q.question }, // Same in both languages for now
      options: { ru: optionsRu, kk: optionsRu },
      correctAnswer: { ru: correctAns, kk: correctAns },
      explanation: { ru: q.explanation, kk: q.explanation }
    };
  });
};

export const NEW_MATH_QUESTIONS = convertMathQuestions();
