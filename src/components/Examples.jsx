import React, { useState } from 'react';
import { MessageSquare, Volume2, Star, RefreshCw, Loader2 } from 'lucide-react';
import { wordApi, storageApi } from '../services/api';
import { speakWithBrowser } from '../utils/tts';
import './Examples.css';

function Examples({ 
  word, 
  coreMeanings, 
  additionalMeanings, 
  idioms,
  examples,
  onClickWord,
  dispatch,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('core');
  const [selectedMeaning, setSelectedMeaning] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const getMeanings = () => {
    switch (activeTab) {
      case 'core':
        return coreMeanings || [];
      case 'additional':
        return additionalMeanings || [];
      case 'idiom':
        return idioms || [];
      default:
        return [];
    }
  };
  
  const meanings = getMeanings();
  const currentKey = `${activeTab}_${selectedMeaning}`;
  const currentExamples = examples[currentKey];
  
  const loadExamples = async () => {
    if (!meanings[selectedMeaning]) return;
    
    setLoading(true);
    try {
      const meaning = activeTab === 'idiom' 
        ? meanings[selectedMeaning].phrase 
        : meanings[selectedMeaning].meaning;
      
      const result = await wordApi.getExamples(word, activeTab, meaning);
      dispatch({ type: 'SET_EXAMPLES', key: currentKey, payload: result });
    } catch (error) {
      showToast('예문을 불러오는 데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedMeaning(0);
  };
  
  const handleMeaningChange = (index) => {
    setSelectedMeaning(index);
  };
  
  const handleSpeak = (text) => {
    const cleanText = text.replace(/\*\*/g, '');
    speakWithBrowser(cleanText).catch(console.error);
  };
  
  const handleSaveExample = async (example) => {
    try {
      await storageApi.saveExample({
        word,
        sentence: example.sentence,
        translation: example.translation,
        context: example.context
      });
      dispatch({ 
        type: 'ADD_SAVED_EXAMPLE', 
        payload: { word, ...example, savedAt: new Date().toISOString() } 
      });
      showToast('예문이 저장되었습니다.', 'success');
    } catch (error) {
      showToast('저장에 실패했습니다.', 'error');
    }
  };
  
  const renderSentence = (sentence) => {
    const parts = sentence.split(/(\*\*[^*]+\*\*)/);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldWord = part.slice(2, -2);
        return <strong key={i} className="highlight-word">{boldWord}</strong>;
      }
      
      const words = part.split(/(\s+)/);
      return words.map((w, j) => {
        if (/^[a-zA-Z]+$/.test(w)) {
          return (
            <span key={`${i}-${j}`} className="clickable-word" onClick={() => onClickWord(w)}>
              {w}
            </span>
          );
        }
        return w;
      });
    });
  };
  
  return (
    <div className="examples card">
      <div className="examples-header">
        <h3 className="card-title">
          <MessageSquare size={20} />
          AI 실시간 예문
        </h3>
        
        <button 
          className="btn btn-sm"
          onClick={loadExamples}
          disabled={loading || !meanings[selectedMeaning]}
        >
          {loading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
          새 예문 생성
        </button>
      </div>
      
      <div className="examples-tabs">
        <button 
          className={`tab ${activeTab === 'core' ? 'active' : ''}`}
          onClick={() => handleTabChange('core')}
        >
          핵심 의미 ({coreMeanings?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'additional' ? 'active' : ''}`}
          onClick={() => handleTabChange('additional')}
        >
          부가 의미 ({additionalMeanings?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'idiom' ? 'active' : ''}`}
          onClick={() => handleTabChange('idiom')}
        >
          숙어 ({idioms?.length || 0})
        </button>
      </div>
      
      {meanings.length > 0 && (
        <div className="meaning-selector">
          {meanings.map((m, i) => (
            <button
              key={i}
              className={`meaning-btn ${selectedMeaning === i ? 'active' : ''}`}
              onClick={() => handleMeaningChange(i)}
            >
              {activeTab === 'idiom' ? m.phrase : m.meaning}
            </button>
          ))}
        </div>
      )}
      
      <div className="examples-list">
        {loading ? (
          <div className="examples-loading">
            <Loader2 size={32} className="spin" />
            <p>예문을 생성하는 중...</p>
          </div>
        ) : currentExamples?.examples ? (
          currentExamples.examples.map((example, i) => (
            <div key={i} className={`example-item difficulty-${example.difficulty}`}>
              <div className="example-header">
                <span className={`difficulty-badge ${example.difficulty}`}>
                  {example.difficulty === 'easy' ? '쉬움' : 
                   example.difficulty === 'medium' ? '보통' : '어려움'}
                </span>
                {example.context && (
                  <span className="context-badge">{example.context}</span>
                )}
              </div>
              
              <p className="example-sentence">{renderSentence(example.sentence)}</p>
              <p className="example-translation">{example.translation}</p>
              
              <div className="example-actions">
                <button className="btn btn-sm" onClick={() => handleSpeak(example.sentence)} title="발음 듣기">
                  <Volume2 size={14} />
                </button>
                <button className="btn btn-sm" onClick={() => handleSaveExample(example)} title="예문 저장">
                  <Star size={14} />
                </button>
              </div>
            </div>
          ))
        ) : meanings.length > 0 ? (
          <div className="examples-empty">
            <p>예문을 불러오려면 "새 예문 생성" 버튼을 클릭하세요.</p>
          </div>
        ) : (
          <div className="examples-empty">
            <p>선택된 의미가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Examples;
