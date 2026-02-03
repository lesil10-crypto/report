import React from 'react';
import { Volume2, BookOpen, Save, Bookmark } from 'lucide-react';
import { speakWithBrowser } from '../utils/tts';
import './WordCard.css';

function WordCard({ 
  wordData, 
  wordImage, 
  onSave, 
  onEncyclopedia, 
  onClickWord,
  onImageClick 
}) {
  if (!wordData) return null;
  
  const { word, pronunciation, partOfSpeech, coreMeanings, additionalMeanings, 
    idioms, synonyms, antonyms } = wordData;
  
  const handleSpeak = () => {
    speakWithBrowser(word).catch(console.error);
  };
  
  const renderClickableWord = (text, isEnglish = true) => {
    if (!isEnglish) return text;
    
    // 영어 단어만 클릭 가능하게
    const words = text.split(/(\s+)/);
    return words.map((w, i) => {
      if (/^[a-zA-Z]+$/.test(w) && w.toLowerCase() !== word.toLowerCase()) {
        return (
          <span 
            key={i} 
            className="clickable-word"
            onClick={() => onClickWord(w)}
          >
            {w}
          </span>
        );
      }
      return w;
    });
  };
  
  return (
    <div className="word-card card">
      <div className="word-card-header">
        <div className="word-main-info">
          <div className="word-title-row">
            <h2 className="word-title">{word}</h2>
            <button 
              className="btn btn-sm speak-btn" 
              onClick={handleSpeak}
              title="발음 듣기"
            >
              <Volume2 size={18} />
            </button>
          </div>
          
          {pronunciation && (
            <p className="word-pronunciation">{pronunciation}</p>
          )}
          
          {partOfSpeech && partOfSpeech.length > 0 && (
            <div className="word-pos">
              {partOfSpeech.map((pos, i) => (
                <span key={i} className="pos-tag">{pos}</span>
              ))}
            </div>
          )}
        </div>
        
        {/* 단어 이미지 */}
        {wordImage && !wordImage.error && (
          <div 
            className="word-image-container"
            onClick={() => onImageClick(wordImage)}
          >
            <img 
              src={wordImage.url || wordImage.base64} 
              alt={word}
              className="word-image"
            />
            <div className="image-overlay">
              <span>클릭하여 확대</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 핵심 의미 */}
      {coreMeanings && coreMeanings.length > 0 && (
        <div className="meanings-section">
          <h3 className="section-title">
            <span className="icon">💡</span> 핵심 의미
          </h3>
          <ul className="meanings-list">
            {coreMeanings.map((meaning, i) => (
              <li key={i} className="meaning-item">
                <span className="meaning-pos">{meaning.partOfSpeech}</span>
                <span className="meaning-text">{meaning.meaning}</span>
                {meaning.example && (
                  <p className="meaning-example">
                    {renderClickableWord(meaning.example)}
                    {meaning.exampleTranslation && (
                      <span className="example-translation">
                        {meaning.exampleTranslation}
                      </span>
                    )}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 부가적 의미 */}
      {additionalMeanings && additionalMeanings.length > 0 && (
        <div className="meanings-section">
          <h3 className="section-title">
            <span className="icon">📝</span> 부가적 의미
          </h3>
          <ul className="meanings-list additional">
            {additionalMeanings.map((meaning, i) => (
              <li key={i} className="meaning-item">
                <span className="meaning-pos">{meaning.partOfSpeech}</span>
                <span className="meaning-text">{meaning.meaning}</span>
                {meaning.usage && (
                  <span className="meaning-usage">({meaning.usage})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 숙어 표현 */}
      {idioms && idioms.length > 0 && (
        <div className="meanings-section">
          <h3 className="section-title">
            <span className="icon">🔗</span> 숙어 표현
          </h3>
          <ul className="idioms-list">
            {idioms.map((idiom, i) => (
              <li key={i} className="idiom-item">
                <span className="idiom-phrase">
                  {renderClickableWord(idiom.phrase)}
                </span>
                <span className="idiom-meaning">{idiom.meaning}</span>
                {idiom.example && (
                  <p className="idiom-example">
                    {renderClickableWord(idiom.example)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 유의어/반의어 */}
      <div className="word-relations">
        {synonyms && synonyms.length > 0 && (
          <div className="relation-group">
            <h4 className="relation-title">유의어</h4>
            <div className="relation-words">
              {synonyms.map((syn, i) => (
                <span 
                  key={i} 
                  className="relation-word synonym"
                  onClick={() => onClickWord(syn.word)}
                >
                  {syn.word}
                  <span className="word-korean">({syn.korean})</span>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {antonyms && antonyms.length > 0 && (
          <div className="relation-group">
            <h4 className="relation-title">반의어</h4>
            <div className="relation-words">
              {antonyms.map((ant, i) => (
                <span 
                  key={i} 
                  className="relation-word antonym"
                  onClick={() => onClickWord(ant.word)}
                >
                  {ant.word}
                  <span className="word-korean">({ant.korean})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 액션 버튼 */}
      <div className="word-card-actions">
        <button className="btn" onClick={onEncyclopedia}>
          <BookOpen size={16} />
          백과사전
        </button>
        <button className="btn btn-primary" onClick={onSave}>
          <Bookmark size={16} />
          단어 저장
        </button>
      </div>
    </div>
  );
}

export default WordCard;
