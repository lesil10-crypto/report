import React, { createContext, useContext, useReducer, useCallback } from 'react';

const WordContext = createContext(null);

const initialState = {
  // 현재 검색된 단어 정보
  currentWord: null,
  
  // 추가 컨텐츠
  encyclopedia: null,
  conceptTree: null,
  episode: null,
  examples: {},
  scenario: null,
  quiz: null,
  
  // 이미지
  wordImage: null,
  illustrations: {},
  episodeImage: null,
  
  // 저장된 데이터
  savedWords: [],
  savedExamples: [],
  searchHistory: [],
  
  // 로딩 상태
  loading: {
    word: false,
    encyclopedia: false,
    conceptTree: false,
    episode: false,
    examples: false,
    scenario: false,
    quiz: false,
    wordImage: false,
    illustration: false
  },
  
  // 로딩 진행률
  loadingProgress: {
    percent: 0,
    message: ''
  },
  
  // 에러
  error: null,
  
  // 토스트 메시지
  toast: null
};

function wordReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.value }
      };
    
    case 'SET_LOADING_PROGRESS':
      return {
        ...state,
        loadingProgress: action.payload
      };
    
    case 'SET_CURRENT_WORD':
      return {
        ...state,
        currentWord: action.payload,
        // 새 단어 검색시 이전 데이터 초기화
        encyclopedia: null,
        conceptTree: null,
        episode: null,
        examples: {},
        scenario: null,
        quiz: null,
        wordImage: null,
        illustrations: {},
        episodeImage: null,
        error: null
      };
    
    case 'SET_ENCYCLOPEDIA':
      return { ...state, encyclopedia: action.payload };
    
    case 'SET_CONCEPT_TREE':
      return { ...state, conceptTree: action.payload };
    
    case 'SET_EPISODE':
      return { ...state, episode: action.payload };
    
    case 'SET_EXAMPLES':
      return {
        ...state,
        examples: { ...state.examples, [action.key]: action.payload }
      };
    
    case 'SET_SCENARIO':
      return { ...state, scenario: action.payload };
    
    case 'SET_QUIZ':
      return { ...state, quiz: action.payload };
    
    case 'SET_WORD_IMAGE':
      return { ...state, wordImage: action.payload };
    
    case 'SET_ILLUSTRATION':
      return {
        ...state,
        illustrations: { ...state.illustrations, [action.key]: action.payload }
      };
    
    case 'SET_EPISODE_IMAGE':
      return { ...state, episodeImage: action.payload };
    
    case 'SET_SAVED_WORDS':
      return { ...state, savedWords: action.payload };
    
    case 'ADD_SAVED_WORD':
      return {
        ...state,
        savedWords: [action.payload, ...state.savedWords.filter(w => w.word !== action.payload.word)]
      };
    
    case 'SET_SAVED_EXAMPLES':
      return { ...state, savedExamples: action.payload };
    
    case 'ADD_SAVED_EXAMPLE':
      return {
        ...state,
        savedExamples: [action.payload, ...state.savedExamples]
      };
    
    case 'SET_SEARCH_HISTORY':
      return { ...state, searchHistory: action.payload };
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        searchHistory: [
          { word: action.payload, searchedAt: new Date().toISOString() },
          ...state.searchHistory.filter(h => h.word !== action.payload).slice(0, 49)
        ]
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    
    case 'CLEAR_WORD':
      return {
        ...initialState,
        savedWords: state.savedWords,
        savedExamples: state.savedExamples,
        searchHistory: state.searchHistory
      };
    
    default:
      return state;
  }
}

export function WordProvider({ children }) {
  const [state, dispatch] = useReducer(wordReducer, initialState);
  
  const setLoading = useCallback((key, value) => {
    dispatch({ type: 'SET_LOADING', key, value });
  }, []);
  
  const setLoadingProgress = useCallback((percent, message) => {
    dispatch({ type: 'SET_LOADING_PROGRESS', payload: { percent, message } });
  }, []);
  
  const showToast = useCallback((message, type = 'info') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  }, []);
  
  const value = {
    state,
    dispatch,
    setLoading,
    setLoadingProgress,
    showToast
  };
  
  return (
    <WordContext.Provider value={value}>
      {children}
    </WordContext.Provider>
  );
}

export function useWord() {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error('useWord must be used within a WordProvider');
  }
  return context;
}
