import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API 클라이언트 초기화
let openai = null;
let anthropic = null;
let genAI = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
if (process.env.GOOGLE_AI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}

const provider = process.env.TEXT_PROVIDER || 'google';
const model = process.env.TEXT_MODEL || 'gemini-3-flash';

/**
 * 프롬프트를 실행하여 텍스트를 생성합니다.
 */
export async function generateText(systemPrompt, userPrompt, jsonMode = true) {
  try {
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(systemPrompt, userPrompt, jsonMode);
      case 'anthropic':
        return await generateWithAnthropic(systemPrompt, userPrompt, jsonMode);
      case 'google':
        return await generateWithGoogle(systemPrompt, userPrompt, jsonMode);
      default:
        throw new Error(`지원하지 않는 텍스트 제공자: ${provider}`);
    }
  } catch (error) {
    console.error('텍스트 생성 오류:', error);
    throw error;
  }
}

async function generateWithOpenAI(systemPrompt, userPrompt, jsonMode) {
  if (!openai) throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: jsonMode ? { type: 'json_object' } : undefined,
    temperature: 0.7,
    max_tokens: 4096
  });
  
  const content = response.choices[0].message.content;
  return jsonMode ? JSON.parse(content) : content;
}

async function generateWithAnthropic(systemPrompt, userPrompt, jsonMode) {
  if (!anthropic) throw new Error('Anthropic API 키가 설정되지 않았습니다.');
  
  const fullPrompt = jsonMode 
    ? `${userPrompt}\n\n반드시 유효한 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.`
    : userPrompt;
  
  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: fullPrompt }]
  });
  
  const content = response.content[0].text;
  
  if (jsonMode) {
    // JSON 블록 추출
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('유효한 JSON 응답을 받지 못했습니다.');
  }
  
  return content;
}

async function generateWithGoogle(systemPrompt, userPrompt, jsonMode) {
  if (!genAI) throw new Error('Google AI API 키가 설정되지 않았습니다.');
  
  const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-3-flash' });
  
  const fullPrompt = jsonMode
    ? `${systemPrompt}\n\n${userPrompt}\n\n반드시 유효한 JSON 형식으로만 응답하세요.`
    : `${systemPrompt}\n\n${userPrompt}`;
  
  const result = await geminiModel.generateContent(fullPrompt);
  const content = result.response.text();
  
  if (jsonMode) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('유효한 JSON 응답을 받지 못했습니다.');
  }
  
  return content;
}

/**
 * 단어 기본 정보 생성
 */
export async function generateWordInfo(word) {
  const systemPrompt = `당신은 영어 교육 전문가입니다. 영어 단어에 대한 정확하고 풍부한 정보를 제공합니다. 
모든 응답은 한국어로 작성하되, 영어 단어와 예문은 영어로 유지합니다.`;

  const userPrompt = `"${word}" 단어에 대한 상세 정보를 JSON 형식으로 제공해주세요.

다음 형식을 정확히 따라주세요:
{
  "word": "검색한 단어",
  "pronunciation": "발음 기호 (IPA)",
  "partOfSpeech": ["품사 배열"],
  "coreMeanings": [
    {
      "meaning": "핵심 의미 (한국어)",
      "partOfSpeech": "품사",
      "example": "예문 (영어)",
      "exampleTranslation": "예문 번역 (한국어)"
    }
  ],
  "additionalMeanings": [
    {
      "meaning": "부가적 의미",
      "partOfSpeech": "품사",
      "usage": "사용 맥락"
    }
  ],
  "idioms": [
    {
      "phrase": "숙어 표현",
      "meaning": "숙어 의미",
      "example": "숙어 예문"
    }
  ],
  "synonyms": [
    { "word": "유의어", "korean": "한국어 뜻" }
  ],
  "antonyms": [
    { "word": "반의어", "korean": "한국어 뜻" }
  ]
}

단어가 존재하지 않거나 찾을 수 없는 경우:
{
  "error": true,
  "message": "정보를 찾을 수 없습니다."
}`;

  return await generateText(systemPrompt, userPrompt, true);
}

/**
 * 백과사전식 상세 설명 생성
 */
export async function generateEncyclopedia(word, coreMeaning) {
  const systemPrompt = `당신은 언어학자이자 역사학자입니다. 단어에 대한 깊이 있고 풍부한 백과사전식 설명을 제공합니다.
학술적이면서도 읽기 쉬운 문체로 작성합니다.`;

  const userPrompt = `"${word}" (${coreMeaning}) 단어에 대한 백과사전식 상세 설명을 JSON 형식으로 작성해주세요.

분량: 각 섹션당 3-5문단 (기존 대비 3배 분량)

{
  "etymology": {
    "origin": "어원 설명 (언어적 기원, 변천 과정)",
    "rootWords": ["어근 단어들"],
    "languageOrigin": "기원 언어 (라틴어, 그리스어 등)"
  },
  "historicalContext": {
    "description": "역사적 맥락과 사례 (상세히)",
    "historicalExamples": [
      {
        "period": "시대",
        "event": "역사적 사건/사용 사례",
        "significance": "의미/중요성"
      }
    ]
  },
  "literaryUsage": {
    "description": "문학 작품에서의 사용",
    "examples": [
      {
        "work": "작품명",
        "author": "작가",
        "quote": "인용문 (영어)",
        "analysis": "분석/해설"
      }
    ]
  },
  "culturalSignificance": "문화적 의미와 현대적 용법",
  "interestingFacts": ["흥미로운 사실들"]
}`;

  return await generateText(systemPrompt, userPrompt, true);
}

/**
 * 개념 트리 생성
 */
export async function generateConceptTree(word, coreMeaning) {
  const systemPrompt = `당신은 개념 분류 전문가입니다. 단어의 상위 개념과 하위 개념을 체계적으로 분류합니다.`;

  const userPrompt = `"${word}" (${coreMeaning}) 단어의 개념 트리를 JSON 형식으로 작성해주세요.

모든 단어는 "English(한국어)" 형식으로 작성합니다.

{
  "word": "${word}",
  "superordinates": [
    {
      "level": 1,
      "concepts": ["상위 개념들 (가장 넓은 범주)"]
    },
    {
      "level": 2,
      "concepts": ["중간 상위 개념들"]
    }
  ],
  "subordinates": [
    {
      "level": 1,
      "concepts": ["직접 하위 개념들"]
    },
    {
      "level": 2,
      "concepts": ["더 세부적인 하위 개념들"]
    }
  ],
  "relatedConcepts": ["관련 개념들 (같은 레벨)"]
}`;

  return await generateText(systemPrompt, userPrompt, true);
}

/**
 * 재미있는 에피소드 생성
 */
export async function generateEpisode(word, coreMeaning) {
  const systemPrompt = `당신은 창의적인 이야기꾼입니다. 영어 단어를 쉽게 기억할 수 있도록 재미있고 기억에 남는 짧은 이야기를 만듭니다.
이야기는 단어의 의미와 연결되어 있어야 하며, 유머러스하거나 감동적이어야 합니다.`;

  const userPrompt = `"${word}" (${coreMeaning}) 단어를 쉽게 기억할 수 있는 짧은 에피소드를 JSON 형식으로 작성해주세요.

{
  "title": "에피소드 제목",
  "story": "이야기 내용 (3-5문단, 재미있고 기억하기 쉽게)",
  "memoryTip": "기억법 팁 (단어와 이야기를 연결하는 방법)",
  "moralOrLesson": "교훈 또는 핵심 포인트"
}`;

  return await generateText(systemPrompt, userPrompt, true);
}

/**
 * AI 실시간 예문 생성
 */
export async function generateExamples(word, meaningType, meaning) {
  const systemPrompt = `당신은 영어 교육 전문가입니다. 현대적이고 실용적인 영어 예문을 생성합니다.
예문은 다양한 상황과 난이도를 포함해야 합니다.`;

  const userPrompt = `"${word}" 단어의 "${meaning}" 의미에 대한 5개의 예문을 JSON 형식으로 생성해주세요.

의미 유형: ${meaningType} (core: 핵심 의미, additional: 부가 의미, idiom: 숙어)

{
  "examples": [
    {
      "id": 1,
      "sentence": "영어 예문 (검색 단어는 **bold**로 표시)",
      "translation": "한국어 번역",
      "difficulty": "easy|medium|hard",
      "context": "상황/맥락 (일상, 비즈니스, 학술 등)"
    }
  ]
}

예문 작성 규칙:
1. 현대적이고 자연스러운 표현 사용
2. 다양한 문장 구조와 시제 활용
3. 실제 대화나 글에서 사용할 수 있는 실용적인 문장
4. 검색 단어는 **단어** 형식으로 볼드 표시`;

  return await generateText(systemPrompt, userPrompt, true);
}

/**
 * AI 시나리오 학습 - 상황별 대화
 */
export async function generateScenario(word, coreMeaning) {
  const systemPrompt = `당신은 영어 회화 전문가입니다. 실제 상황에서 단어가 어떻게 사용되는지 보여주는 자연스러운 대화를 생성합니다.`;

  const userPrompt = `"${word}" (${coreMeaning}) 단어가 사용되는 실제 대화 시나리오를 JSON 형식으로 생성해주세요.

{
  "scenario": {
    "title": "시나리오 제목",
    "setting": "상황 설명",
    "characters": ["등장인물"],
    "dialogue": [
      {
        "speaker": "화자",
        "line": "대사 (영어)",
        "translation": "번역 (한국어)",
        "note": "해설/설명 (선택적)"
      }
    ],
    "vocabularyHighlight": "대화에서 단어가 사용된 방식 설명"
  }
}`;

  return await generateText(systemPrompt, userPrompt, true);
}

/**
 * 빈칸 채우기 퀴즈 생성
 */
export async function generateQuiz(word, meanings) {
  const systemPrompt = `당신은 영어 테스트 출제 전문가입니다. 단어의 정확한 용법을 테스트하는 빈칸 채우기 퀴즈를 만듭니다.`;

  const userPrompt = `"${word}" 단어에 대한 빈칸 채우기 퀴즈 5문제를 JSON 형식으로 생성해주세요.

단어의 의미들: ${meanings.join(', ')}

{
  "quizzes": [
    {
      "id": 1,
      "question": "문장 (빈칸은 _____ 로 표시)",
      "answer": "정답",
      "hint": "힌트",
      "explanation": "해설",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  return await generateText(systemPrompt, userPrompt, true);
}

export default {
  generateText,
  generateWordInfo,
  generateEncyclopedia,
  generateConceptTree,
  generateEpisode,
  generateExamples,
  generateScenario,
  generateQuiz
};
