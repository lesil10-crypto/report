import React from 'react';
import { GitBranch, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import './ConceptTree.css';

function ConceptTree({ data, onClickWord }) {
  if (!data) return null;
  
  const extractWord = (text) => {
    // "English(한국어)" 형식에서 영어 단어 추출
    const match = text.match(/^([a-zA-Z\s]+)/);
    return match ? match[1].trim() : text;
  };
  
  const handleWordClick = (wordText) => {
    const englishWord = extractWord(wordText);
    if (englishWord && onClickWord) {
      onClickWord(englishWord);
    }
  };
  
  return (
    <div className="concept-tree card">
      <h3 className="card-title">
        <GitBranch size={20} />
        개념 트리
      </h3>
      
      <div className="tree-container">
        {/* 상위 개념 */}
        {data.superordinates && data.superordinates.length > 0 && (
          <div className="tree-section superordinates">
            <div className="section-label">
              <ChevronUp size={16} />
              상위 개념
            </div>
            {data.superordinates.map((level, levelIndex) => (
              <div 
                key={levelIndex} 
                className="tree-level"
                style={{ '--level': levelIndex }}
              >
                {level.concepts && level.concepts.map((concept, i) => (
                  <span 
                    key={i}
                    className="tree-node superordinate"
                    onClick={() => handleWordClick(concept)}
                  >
                    <Plus size={12} className="node-icon" />
                    {concept}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {/* 현재 단어 */}
        <div className="tree-center">
          <span className="tree-node current">
            {data.word}
          </span>
        </div>
        
        {/* 하위 개념 */}
        {data.subordinates && data.subordinates.length > 0 && (
          <div className="tree-section subordinates">
            <div className="section-label">
              <ChevronDown size={16} />
              하위 개념
            </div>
            {data.subordinates.map((level, levelIndex) => (
              <div 
                key={levelIndex} 
                className="tree-level"
                style={{ '--level': levelIndex }}
              >
                {level.concepts && level.concepts.map((concept, i) => (
                  <span 
                    key={i}
                    className="tree-node subordinate"
                    onClick={() => handleWordClick(concept)}
                  >
                    <Plus size={12} className="node-icon" />
                    {concept}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {/* 관련 개념 */}
        {data.relatedConcepts && data.relatedConcepts.length > 0 && (
          <div className="tree-section related">
            <div className="section-label">
              🔗 관련 개념
            </div>
            <div className="tree-level">
              {data.relatedConcepts.map((concept, i) => (
                <span 
                  key={i}
                  className="tree-node related"
                  onClick={() => handleWordClick(concept)}
                >
                  <Plus size={12} className="node-icon" />
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConceptTree;
