import React, { useState } from 'react';
import { Users, Play, Loader2, Volume2 } from 'lucide-react';
import { wordApi } from '../services/api';
import { speakWithBrowser } from '../utils/tts';
import './Scenario.css';

function Scenario({ word, meaning, data, dispatch, setLoading }) {
  const [loading, setLocalLoading] = useState(false);
  
  const loadScenario = async () => {
    if (!word || !meaning) return;
    
    setLocalLoading(true);
    setLoading('scenario', true);
    
    try {
      const result = await wordApi.getScenario(word, meaning);
      dispatch({ type: 'SET_SCENARIO', payload: result });
    } catch (error) {
      console.error('시나리오 로드 실패:', error);
    } finally {
      setLocalLoading(false);
      setLoading('scenario', false);
    }
  };
  
  const handleSpeak = (text) => {
    speakWithBrowser(text).catch(console.error);
  };
  
  if (!data && !loading) {
    return (
      <div className="scenario card">
        <h3 className="card-title">
          <Users size={20} />
          AI 시나리오 학습
        </h3>
        <div className="scenario-prompt">
          <p>단어가 사용되는 실제 대화 시나리오를 생성합니다.</p>
          <button 
            className="btn btn-primary"
            onClick={loadScenario}
            disabled={!word || !meaning}
          >
            <Play size={16} />
            시나리오 생성
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="scenario card">
      <h3 className="card-title">
        <Users size={20} />
        AI 시나리오 학습
      </h3>
      
      {loading ? (
        <div className="scenario-loading">
          <Loader2 size={32} className="spin" />
          <p>시나리오를 생성하는 중...</p>
        </div>
      ) : data?.scenario ? (
        <div className="scenario-content">
          <div className="scenario-header">
            <h4>{data.scenario.title}</h4>
            <p className="scenario-setting">{data.scenario.setting}</p>
            
            {data.scenario.characters && (
              <div className="scenario-characters">
                <span className="characters-label">등장인물:</span>
                {data.scenario.characters.map((char, i) => (
                  <span key={i} className="character-badge">{char}</span>
                ))}
              </div>
            )}
          </div>
          
          <div className="dialogue-container">
            {data.scenario.dialogue?.map((line, i) => (
              <div key={i} className="dialogue-line">
                <div className="dialogue-speaker">
                  <span className="speaker-name">{line.speaker}</span>
                  <button 
                    className="speak-btn"
                    onClick={() => handleSpeak(line.line)}
                    title="발음 듣기"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>
                <div className="dialogue-content">
                  <p className="dialogue-text">{line.line}</p>
                  <p className="dialogue-translation">{line.translation}</p>
                  {line.note && (
                    <p className="dialogue-note">💡 {line.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {data.scenario.vocabularyHighlight && (
            <div className="vocabulary-highlight">
              <strong>📝 단어 활용 포인트:</strong>
              <p>{data.scenario.vocabularyHighlight}</p>
            </div>
          )}
          
          <button 
            className="btn"
            onClick={loadScenario}
          >
            <Play size={16} />
            새 시나리오 생성
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default Scenario;
