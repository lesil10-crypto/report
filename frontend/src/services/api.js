import axios from 'axios';

// 환경변수에서 API URL 가져오기 (없으면 상대경로 사용)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // 60초 (AI 생성 시간 고려)
  headers: {
    'Content-Type': 'application/json'
  }
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error || error.message || '오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);

// ==================== 단어 API ====================

export const wordApi = {
  // 단어 검색
  search: (word) => api.get('/word/search', { params: { q: word } }),
  
  // 백과사전
  getEncyclopedia: (word, meaning) => 
    api.get('/word/encyclopedia', { params: { word, meaning } }),
  
  // 개념 트리
  getConceptTree: (word, meaning) => 
    api.get('/word/concept-tree', { params: { word, meaning } }),
  
  // 에피소드
  getEpisode: (word, meaning) => 
    api.get('/word/episode', { params: { word, meaning } }),
  
  // 예문
  getExamples: (word, meaningType, meaning) => 
    api.get('/word/examples', { params: { word, meaningType, meaning } }),
  
  // 시나리오
  getScenario: (word, meaning) => 
    api.get('/word/scenario', { params: { word, meaning } }),
  
  // 퀴즈
  getQuiz: (word, meanings) => 
    api.post('/word/quiz', { word, meanings }),
  
  // 저장
  save: (wordData, userId = 'anonymous') => 
    api.post('/word/save', { userId, wordData }),
  
  // 저장된 단어 목록
  getSaved: (userId = 'anonymous', options = {}) => 
    api.get('/word/saved', { params: { userId, ...options } }),
  
  // 학습 완료 표시
  markLearned: (word, isLearned = true, userId = 'anonymous') => 
    api.patch('/word/learned', { userId, word, isLearned }),
  
  // 삭제
  delete: (word, userId = 'anonymous') => 
    api.delete(`/word/${word}`, { params: { userId } })
};

// ==================== 이미지 API ====================

export const imageApi = {
  // 단어 이미지
  generateWordImage: (word, meaning, isComplex = false) =>
    api.post('/image/word', { word, meaning, isComplex }),
  
  // 의미별 삽화
  generateIllustration: (word, meaning, context = '') =>
    api.post('/image/illustration', { word, meaning, context }),
  
  // 에피소드 이미지
  generateEpisodeImage: (title, storyContext) =>
    api.post('/image/episode', { title, storyContext }),
  
  // 커스텀 이미지
  generate: (prompt, size = '1024x1024', style = 'vivid') =>
    api.post('/image/generate', { prompt, size, style })
};

// ==================== TTS API ====================

export const ttsApi = {
  // 텍스트 음성 변환
  speak: (text, voice, speed) => 
    api.post('/tts/speak', { text, voice, speed }),
  
  // 단어 발음
  getWordPronunciation: (word) => 
    api.get(`/tts/word/${encodeURIComponent(word)}`),
  
  // 예문 음성
  getSentenceSpeech: (sentence) => 
    api.post('/tts/sentence', { sentence }),
  
  // TTS 설정
  getConfig: () => api.get('/tts/config')
};

// ==================== 저장 API ====================

export const storageApi = {
  // 예문 저장
  saveExample: (example, userId = 'anonymous') =>
    api.post('/storage/example', { userId, example }),
  
  // 저장된 예문 목록
  getExamples: (userId = 'anonymous') =>
    api.get('/storage/examples', { params: { userId } }),
  
  // 검색 기록 저장
  saveHistory: (word, userId = 'anonymous') =>
    api.post('/storage/history', { userId, word }),
  
  // 검색 기록 조회
  getHistory: (userId = 'anonymous', limit = 50) =>
    api.get('/storage/history', { params: { userId, limit } })
};

// ==================== 설정 API ====================

export const configApi = {
  get: () => api.get('/config')
};

export default api;
