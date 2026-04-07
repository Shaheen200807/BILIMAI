
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Subject, Problem, Language, Difficulty } from '../types';

// Use VITE_GEMINI_API_KEY for Vite browser environment
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateProblem = async (
  subject: Subject, 
  lang: Language, 
  difficulty: Difficulty = 'medium',
  count: number = 1
): Promise<Problem> => {
  const languageName = lang === 'ru' ? 'Russian' : 'Kazakh';
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are an expert educator for NIS (Nazarbayev Intellectual Schools) and BIL (BIL-Inovatsiya Lyceums) entrance exams for 6th-grade students.
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
      7. EXPLANATION: Provide a VERY CONCISE explanation (max 1-2 short sentences).`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          subject: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correctAnswer", "explanation", "topic", "difficulty"]
            }
          }
        },
        required: ["id", "title", "subject", "difficulty", "steps"]
      }
    },
    contents: `Generate ${count} ${difficulty} level questions for ${subject} in ${languageName}.`
  });

  if (!response.text) {
    throw new Error("AI failed to generate content");
  }

  try {
    const data = JSON.parse(response.text);
    data.subject = subject;
    data.difficulty = difficulty;
    return data;
  } catch (e) {
    console.error("AI Response Error:", response.text);
    throw new Error("AI data corruption: " + e);
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
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are an expert educator for NIS (Nazarbayev Intellectual Schools) and BIL (BIL-Inovatsiya Lyceums). 
      Your task is to explain why the correct answer is right and why the student's answer was wrong.
      STRICT LANGUAGE RULE: Speak ONLY in ${languageName}.
      Keep the explanation encouraging, simple, and logical for a 10-14 year old student.`,
      temperature: 0.7 
    },
    contents: `Subject: ${subject}.
    Question: "${question}".
    Options: ${options.join(', ')}.
    Correct Answer: "${correctAnswer}".
    Student's Wrong Answer: "${userAnswer}".
    
    Provide a detailed but simple explanation in ${languageName}.`
  });
  
  if (!response.text) {
    return lang === 'ru' ? "Извини, я не смог подготовить объяснение." : "Кешіріңіз, түсіндірме дайындай алмадым.";
  }
  
  return response.text.trim();
};

export const getAIHint = async (problemTitle: string, currentStepText: string, subject: Subject, lang: Language): Promise<string> => {
  const languageName = lang === 'ru' ? 'Russian' : 'Kazakh';
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are BilimAI, a supportive mentor. Speak ONLY in ${languageName}. Never use other languages.`,
      temperature: 0.7 
    },
    contents: `The student is stuck on a ${subject} problem: "${problemTitle}". 
    Current step: "${currentStepText}". 
    Give a helpful hint in ${languageName} WITHOUT giving the answer.`
  });
  
  if (!response.text) {
    return lang === 'ru' ? "Попробуй подумать еще немного!" : "Тағы біраз ойланып көр!";
  }
  
  return response.text.trim();
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const outputAudioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.destination);
      source.start();
    }
  } catch (e) {
    console.error("TTS failed:", e);
  }
};
