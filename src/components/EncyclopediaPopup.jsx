import React from 'react';
import { X, BookOpen, History, Feather, Sparkles, Loader2 } from 'lucide-react';
import './EncyclopediaPopup.css';

function EncyclopediaPopup({ word, data, loading, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content encyclopedia-popup" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h2>
            <BookOpen size={24} />
            "{word}" 백과사전
          </h2>
          <button className="popup-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="popup-body">
          {loading ? (
            <div className="loading-state">
              <Loader2 size={40} className="loading-spinner" />
              <p>백과사전 정보를 생성하는 중...</p>
            </div>
          ) : data ? (
            <>
              {/* 어원 */}
              {data.etymology && (
                <section className="encyclopedia-section">
                  <h3>
                    <span className="section-icon">🌱</span>
                    어원 (Etymology)
                  </h3>
                  <div className="section-content">
                    <p className="etymology-origin">{data.etymology.origin}</p>
                    {data.etymology.languageOrigin && (
                      <p className="etymology-language">
                        기원 언어: <strong>{data.etymology.languageOrigin}</strong>
                      </p>
                    )}
                    {data.etymology.rootWords && data.etymology.rootWords.length > 0 && (
                      <div className="etymology-roots">
                        <span>어근:</span>
                        {data.etymology.rootWords.map((root, i) => (
                          <span key={i} className="root-word">{root}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}
              
              {/* 역사적 맥락 */}
              {data.historicalContext && (
                <section className="encyclopedia-section">
                  <h3>
                    <History size={18} />
                    역사적 맥락
                  </h3>
                  <div className="section-content">
                    <p>{data.historicalContext.description}</p>
                    
                    {data.historicalContext.historicalExamples && 
                     data.historicalContext.historicalExamples.length > 0 && (
                      <div className="historical-examples">
                        {data.historicalContext.historicalExamples.map((example, i) => (
                          <div key={i} className="historical-example">
                            <span className="example-period">{example.period}</span>
                            <p className="example-event">{example.event}</p>
                            {example.significance && (
                              <p className="example-significance">
                                <em>{example.significance}</em>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}
              
              {/* 문학적 사용 */}
              {data.literaryUsage && (
                <section className="encyclopedia-section">
                  <h3>
                    <Feather size={18} />
                    문학에서의 사용
                  </h3>
                  <div className="section-content">
                    <p>{data.literaryUsage.description}</p>
                    
                    {data.literaryUsage.examples && 
                     data.literaryUsage.examples.length > 0 && (
                      <div className="literary-examples">
                        {data.literaryUsage.examples.map((example, i) => (
                          <blockquote key={i} className="literary-quote">
                            <p className="quote-text">"{example.quote}"</p>
                            <footer>
                              — <cite>{example.author}</cite>, 
                              <span className="work-title">{example.work}</span>
                            </footer>
                            {example.analysis && (
                              <p className="quote-analysis">{example.analysis}</p>
                            )}
                          </blockquote>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}
              
              {/* 문화적 의미 */}
              {data.culturalSignificance && (
                <section className="encyclopedia-section">
                  <h3>
                    <span className="section-icon">🌍</span>
                    문화적 의미
                  </h3>
                  <div className="section-content">
                    <p>{data.culturalSignificance}</p>
                  </div>
                </section>
              )}
              
              {/* 흥미로운 사실 */}
              {data.interestingFacts && data.interestingFacts.length > 0 && (
                <section className="encyclopedia-section">
                  <h3>
                    <Sparkles size={18} />
                    흥미로운 사실
                  </h3>
                  <ul className="interesting-facts">
                    {data.interestingFacts.map((fact, i) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>백과사전 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EncyclopediaPopup;
