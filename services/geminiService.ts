
import { Subject, Problem, Language, Difficulty } from '../types';

// Use OpenRouter API
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const generateProblem = async (
  subject: Subject, 
  lang: Language, 
  difficulty: Difficulty = 'medium',
  count: number = 1
): Promise<Problem> => {
  const languageName = lang === 'ru' ? 'Russian' : 'Kazakh';
  
  const systemPrompt = `You are an expert educator for NIS (Nazarbayev Intellectual Schools) and BIL (BIL-Inovatsiya Lyceums) entrance exams for 6th-grade students.
Your goal is to generate high-quality, challenging questions that strictly match the NIS/BIL format.

CRITICAL RULES:
1. NO SIMPLE SCHOOL EXERCISES. Questions must test logic, analysis, speed, and attention.
2. DIFFICULTY LEVELS:
   - 'easy': Basic thinking, but not primitive. Requires logic.
   - 'medium': Minimum 2-step solution, hidden conditions, deep analysis.
   - 'hard': Logical traps, non-standard "out-of-the-box" thinking.
3. SUBJECT SPECIFICS:
   - MATH: NO simple arithmetic (e.g., 1/2 + 1/3). Use word problems, fractions in context, percentages, equations, comparisons of values, and strategic choices.
   - LOGIC: Use worst-case scenarios, patterns, sequences, spatial reasoning (figures), and logical exclusions.
   - READING LITERACY: Short texts with questions on meaning/inference. No direct, obvious answers.
   - CRITICAL THINKING: Situational analysis and choosing the correct logical conclusion.
4. OPTIONS: Exactly 4 options. Distractors must be plausible and based on common mistakes.
5. LANGUAGE: Generate content EXCLUSIVELY in ${languageName}. DO NOT use Russian if the language is Kazakh.
6. SELF-CORRECTION: Before returning, verify if the question is too easy for NIS/BIL level. If so, automatically make it more complex.
7. EXPLANATION: Provide a VERY CONCISE explanation (max 1-2 short sentences).

RETURN ONLY VALID JSON, no markdown or extra text.`;

  const userPrompt = `Generate ${count} ${difficulty} level questions for ${subject} in ${languageName}.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "id": "problem_${Date.now()}",
  "title": "Problem title in ${languageName}",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "steps": [
    {
      "id": "step_1",
      "question": "Question text in ${languageName}",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Correct option text",
      "explanation": "Brief explanation in ${languageName}",
      "topic": "Topic name",
      "difficulty": "${difficulty}"
    }
  ]
}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content from API");
    }

    // Extract JSON from content (in case there's markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;
    const problemData = JSON.parse(jsonContent);
    
    problemData.subject = subject;
    problemData.difficulty = difficulty;
    return problemData;
  } catch (e) {
    console.error("API Error:", e);
    throw new Error("Failed to generate problem: " + e);
  }
};

export const getAIExplanation = async (
  question: string, 
  options: string[], 
  correctAnswer: string, 
  userAnswer: string,
  subject: Subject, 
  lang: Language
): Promise<string> => {
  const languageName = lang === 'ru' ? 'Russian' : 'Kazakh';
  
  const systemPrompt = `You are an expert educator for NIS (Nazarbayev Intellectual Schools) and BIL (BIL-Inovatsiya Lyceums). 
Your task is to explain why the correct answer is right and why the student's answer was wrong.
STRICT LANGUAGE RULE: Speak ONLY in ${languageName}.
Keep the explanation encouraging, simple, and logical for a 10-14 year old student.`;

  const userPrompt = `Subject: ${subject}.
Question: "${question}".
Options: ${options.join(', ')}.
Correct Answer: "${correctAnswer}".
Student's Wrong Answer: "${userAnswer}".

Provide a detailed but simple explanation in ${languageName}.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content;
    
    if (!explanation) {
      return lang === 'ru' ? "Извини, я не смог подготовить объяснение." : "Кешіріңіз, түсіндірме дайындай алмадым.";
    }
    
    return explanation.trim();
  } catch (e) {
    console.error("API Error:", e);
    return lang === 'ru' ? "Извини, я не смог подготовить объяснение." : "Кешіріңіз, түсіндірме дайындай алмадым.";
  }
};

export const getAIHint = async (problemTitle: string, currentStepText: string, subject: Subject, lang: Language): Promise<string> => {
  const languageName = lang === 'ru' ? 'Russian' : 'Kazakh';
  
  const systemPrompt = `You are BilimAI, a supportive mentor. Speak ONLY in ${languageName}. Never use other languages.`;
  
  const userPrompt = `The student is stuck on a ${subject} problem: "${problemTitle}". 
Current step: "${currentStepText}". 
Give a helpful hint in ${languageName} WITHOUT giving the answer.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const hint = data.choices?.[0]?.message?.content;
    
    if (!hint) {
      return lang === 'ru' ? "Попробуй подумать еще немного!" : "Тағы біраз ойланып көр!";
    }
    
    return hint.trim();
  } catch (e) {
    console.error("API Error:", e);
    return lang === 'ru' ? "Попробуй подумать еще немного!" : "Тағы біраз ойланып көр!";
  }
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const speakText = async (text: string): Promise<void> => {
  try {
    // Using Web Speech API as fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.error("TTS failed:", e);
  }
};
