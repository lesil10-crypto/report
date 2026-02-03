import React, { useState, useEffect, useCallback } from 'react';
import { useWord } from './contexts/WordContext';
import { wordApi, imageApi, storageApi } from './services/api';

// Components
import SearchBar from './components/SearchBar';
import WordCard from './components/WordCard';
import EncyclopediaPopup from './components/EncyclopediaPopup';
import ConceptTree from './components/ConceptTree';
import Episode from './components/Episode';
import Examples from './components/Examples';
import Scenario from './components/Scenario';
import Quiz from './components/Quiz';
import WordList from './components/WordList';
import SavedExamples from './components/SavedExamples';
import LoadingBar from './components/LoadingBar';
import Toast from './components/Toast';
import ImagePopup from './components/ImagePopup';

import './styles/App.css';

function App() {
  const { state, dispatch, setLoading, setLoadingProgress, showToast } = useWord();
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [showWordList, setShowWordList] = useState(false);
  const [showSavedExamples, setShowSavedExamples] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // 초기 데이터 로드
  useEffect(() => {
    loadSavedData();
  }, []);
  
  const loadSavedData = async () => {
    try {
      const [wordsRes, examplesRes, historyRes] = await Promise.all([
        wordApi.getSaved(),
        storageApi.getExamples(),
        storageApi.getHistory()
      ]);
      
      dispatch({ type: 'SET_SAVED_WORDS', payload: wordsRes.words || [] });
      dispatch({ type: 'SET_SAVED_EXAMPLES', payload: examplesRes.examples || [] });
      dispatch({ type: 'SET_SEARCH_HISTORY', payload: historyRes.history || [] });
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    }
  };
  
  // 단어 검색
  const handleSearch = useCallback(async (word) => {
    if (!word.trim()) return;
    
    setLoading('word', true);
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // 1. 기본 정보 검색 (20%)
      setLoadingProgress(10, '단어 정보를 검색하는 중...');
      const wordInfo = await wordApi.search(word);
      
      if (wordInfo.error) {
        dispatch({ type: 'SET_ERROR', payload: wordInfo.message });
        showToast(wordInfo.message, 'error');
        return;
      }
      
      dispatch({ type: 'SET_CURRENT_WORD', payload: wordInfo });
      dispatch({ type: 'ADD_TO_HISTORY', payload: word.toLowerCase() });
      
      // 검색 기록 저장
      storageApi.saveHistory(word).catch(console.error);
      
      setLoadingProgress(30, '핵심 이미지를 생성하는 중...');
      
      // 2. 핵심 이미지 생성 (병렬)
      const coreMeaning = wordInfo.coreMeanings?.[0]?.meaning || '';
      const isComplex = isComplexConcept(word);
      
      imageApi.generateWordImage(word, coreMeaning, isComplex)
        .then(result => {
          if (!result.error) {
            dispatch({ type: 'SET_WORD_IMAGE', payload: result });
          }
        })
        .catch(console.error);
      
      setLoadingProgress(50, '에피소드를 생성하는 중...');
      
      // 3. 에피소드 생성
      wordApi.getEpisode(word, coreMeaning)
        .then(result => {
          dispatch({ type: 'SET_EPISODE', payload: result });
          
          // 에피소드 이미지 생성
          if (result.title && result.story) {
            imageApi.generateEpisodeImage(result.title, result.story.slice(0, 200))
              .then(imgResult => {
                if (!imgResult.error) {
                  dispatch({ type: 'SET_EPISODE_IMAGE', payload: imgResult });
                }
              })
              .catch(console.error);
          }
        })
        .catch(console.error);
      
      setLoadingProgress(70, '개념 트리를 생성하는 중...');
      
      // 4. 개념 트리 생성
      wordApi.getConceptTree(word, coreMeaning)
        .then(result => {
          dispatch({ type: 'SET_CONCEPT_TREE', payload: result });
        })
        .catch(console.error);
      
      setLoadingProgress(90, '완료 중...');
      
      // 5. 예문 생성 (첫 번째 핵심 의미)
      if (wordInfo.coreMeanings?.[0]) {
        wordApi.getExamples(word, 'core', wordInfo.coreMeanings[0].meaning)
          .then(result => {
            dispatch({ type: 'SET_EXAMPLES', key: 'core_0', payload: result });
          })
          .catch(console.error);
      }
      
      setLoadingProgress(100, '완료!');
      showToast(`"${word}" 검색 완료`, 'success');
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      showToast(error.message, 'error');
    } finally {
      setLoading('word', false);
      setTimeout(() => setLoadingProgress(0, ''), 500);
    }
  }, [dispatch, setLoading, setLoadingProgress, showToast]);
  
  // 복잡한 개념 판별 (다이어그램 스타일 이미지용)
  const isComplexConcept = (word) => {
    const complexWords = ['brain', 'heart', 'cell', 'atom', 'molecule', 'system', 
      'structure', 'organ', 'network', 'circuit', 'mechanism', 'process'];
    return complexWords.some(w => word.toLowerCase().includes(w));
  };
  
  // 백과사전 로드
  const handleLoadEncyclopedia = useCallback(async () => {
    if (!state.currentWord || state.encyclopedia) {
      setShowEncyclopedia(true);
      return;
    }
    
    setLoading('encyclopedia', true);
    try {
      const coreMeaning = state.currentWord.coreMeanings?.[0]?.meaning || '';
      const result = await wordApi.getEncyclopedia(state.currentWord.word, coreMeaning);
      dispatch({ type: 'SET_ENCYCLOPEDIA', payload: result });
      setShowEncyclopedia(true);
    } catch (error) {
      showToast('백과사전을 불러오는 데 실패했습니다.', 'error');
    } finally {
      setLoading('encyclopedia', false);
    }
  }, [state.currentWord, state.encyclopedia, dispatch, setLoading, showToast]);
  
  // 단어 저장
  const handleSaveWord = useCallback(async () => {
    if (!state.currentWord) return;
    
    try {
      await wordApi.save(state.currentWord);
      dispatch({ type: 'ADD_SAVED_WORD', payload: state.currentWord });
      showToast('단어가 저장되었습니다.', 'success');
    } catch (error) {
      showToast('저장에 실패했습니다.', 'error');
    }
  }, [state.currentWord, dispatch, showToast]);
  
  // 클릭 투 서치
  const handleClickWord = useCallback((word) => {
    handleSearch(word);
  }, [handleSearch]);
  
  // 이미지 클릭 (팝업)
  const handleImageClick = useCallback((imageData) => {
    setSelectedImage(imageData);
  }, []);
  
  const isLoading = Object.values(state.loading).some(v => v);
  
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">📚</span>
          AI 영어 단어장
        </h1>
        <div className="header-actions">
          <button 
            className="btn"
            onClick={() => setShowWordList(true)}
          >
            📋 단어 목록
          </button>
          <button 
            className="btn"
            onClick={() => setShowSavedExamples(true)}
          >
            ⭐ 저장된 예문
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <SearchBar 
          onSearch={handleSearch} 
          isLoading={state.loading.word}
          history={state.searchHistory}
        />
        
        {isLoading && state.loadingProgress.percent > 0 && (
          <LoadingBar 
            percent={state.loadingProgress.percent}
            message={state.loadingProgress.message}
          />
        )}
        
        {state.error && (
          <div className="error-message">
            <span>❌</span> {state.error}
          </div>
        )}
        
        {state.currentWord && (
          <div className="content-grid">
            {/* 메인 단어 카드 */}
            <WordCard 
              wordData={state.currentWord}
              wordImage={state.wordImage}
              onSave={handleSaveWord}
              onEncyclopedia={handleLoadEncyclopedia}
              onClickWord={handleClickWord}
              onImageClick={handleImageClick}
            />
            
            {/* 개념 트리 */}
            {state.conceptTree && (
              <ConceptTree 
                data={state.conceptTree}
                onClickWord={handleClickWord}
              />
            )}
            
            {/* 에피소드 */}
            {state.episode && (
              <Episode 
                data={state.episode}
                image={state.episodeImage}
                onImageClick={handleImageClick}
              />
            )}
            
            {/* 예문 섹션 */}
            <Examples 
              word={state.currentWord.word}
              coreMeanings={state.currentWord.coreMeanings}
              additionalMeanings={state.currentWord.additionalMeanings}
              idioms={state.currentWord.idioms}
              examples={state.examples}
              onClickWord={handleClickWord}
              dispatch={dispatch}
              showToast={showToast}
            />
            
            {/* 시나리오 학습 */}
            <Scenario 
              word={state.currentWord.word}
              meaning={state.currentWord.coreMeanings?.[0]?.meaning}
              data={state.scenario}
              dispatch={dispatch}
              setLoading={setLoading}
            />
            
            {/* 퀴즈 */}
            <Quiz 
              word={state.currentWord.word}
              meanings={[
                ...(state.currentWord.coreMeanings?.map(m => m.meaning) || []),
                ...(state.currentWord.additionalMeanings?.map(m => m.meaning) || [])
              ]}
              data={state.quiz}
              dispatch={dispatch}
              setLoading={setLoading}
              showToast={showToast}
            />
          </div>
        )}
        
        {!state.currentWord && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>영어 단어를 검색해보세요</h2>
            <p>AI가 단어의 의미, 예문, 이미지를 생성해드립니다.</p>
          </div>
        )}
      </main>
      
      {/* 모달/팝업 */}
      {showEncyclopedia && (
        <EncyclopediaPopup 
          word={state.currentWord?.word}
          data={state.encyclopedia}
          loading={state.loading.encyclopedia}
          onClose={() => setShowEncyclopedia(false)}
        />
      )}
      
      {showWordList && (
        <WordList 
          words={state.savedWords}
          history={state.searchHistory}
          onClose={() => setShowWordList(false)}
          onSelect={handleClickWord}
          dispatch={dispatch}
          showToast={showToast}
        />
      )}
      
      {showSavedExamples && (
        <SavedExamples 
          examples={state.savedExamples}
          onClose={() => setShowSavedExamples(false)}
          onClickWord={handleClickWord}
        />
      )}
      
      {selectedImage && (
        <ImagePopup 
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
      
      {/* 토스트 메시지 */}
      {state.toast && (
        <Toast 
          message={state.toast.message}
          type={state.toast.type}
        />
      )}
    </div>
  );
}

export default App;
