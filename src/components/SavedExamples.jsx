import React from 'react';
import { X, Star, Volume2 } from 'lucide-react';
import { speakWithBrowser } from '../utils/tts';
import './SavedExamples.css';

function SavedExamples({ examples, onClose, onClickWord }) {
  const handleSpeak = (text) => {
    const cleanText = text.replace(/\*\*/g, '');
    speakWithBrowser(cleanText).catch(console.error);
  };
  
  const renderSentence = (sentence) => {
    const parts = sentence.split(/(\*\*[^*]+\*\*)/);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="highlight-word">{part.slice(2, -2)}</strong>;
      }
      
      const words = part.split(/(\s+)/);
      return words.map((w, j) => {
        if (/^[a-zA-Z]+$/.test(w)) {
          return (
            <span 
              key={`${i}-${j}`} 
              className="clickable-word"
              onClick={() => { onClickWord(w); onClose(); }}
            >
              {w}
            </span>
          );
        }
        return w;
      });
    });
  };
  
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content saved-examples-popup" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h2>
            <Star size={20} />
            저장된 예문
          </h2>
          <button className="popup-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="popup-body">
          {examples.length === 0 ? (
            <div className="empty-list">
              <Star size={48} />
              <p>저장된 예문이 없습니다.</p>
              <p className="hint">예문 옆의 ⭐ 버튼을 눌러 저장하세요.</p>
            </div>
          ) : (
            <ul className="saved-examples-list">
              {examples.map((example, i) => (
                <li key={i} className="saved-example-item">
                  <div className="example-word-badge">{example.word}</div>
                  
                  <p className="example-sentence">
                    {renderSentence(example.sentence)}
                  </p>
                  
                  <p className="example-translation">
                    {example.translation}
                  </p>
                  
                  {example.context && (
                    <span className="example-context">{example.context}</span>
                  )}
                  
                  <div className="example-footer">
                    <span className="example-date">
                      {new Date(example.savedAt).toLocaleDateString('ko-KR')}
                    </span>
                    <button 
                      className="btn btn-sm"
                      onClick={() => handleSpeak(example.sentence)}
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavedExamples;
