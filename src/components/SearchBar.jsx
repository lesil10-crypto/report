import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Clock } from 'lucide-react';
import './SearchBar.css';

function SearchBar({ onSearch, isLoading, history = [] }) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  
  // 외부 클릭시 히스토리 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setShowHistory(false);
    }
  };
  
  const handleHistoryClick = (word) => {
    setQuery(word);
    onSearch(word);
    setShowHistory(false);
  };
  
  const handleFocus = () => {
    if (history.length > 0) {
      setShowHistory(true);
    }
  };
  
  const recentHistory = history.slice(0, 10);
  
  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="영어 단어 또는 한글 뜻을 입력하세요..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            disabled={isLoading}
          />
          {isLoading && (
            <Loader2 className="search-loader" size={20} />
          )}
        </div>
        <button 
          type="submit" 
          className="btn btn-primary btn-lg search-button"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? '검색 중...' : '검색'}
        </button>
      </form>
      
      {/* 검색 기록 드롭다운 */}
      {showHistory && recentHistory.length > 0 && (
        <div className="search-history">
          <div className="history-header">
            <Clock size={14} />
            <span>최근 검색</span>
          </div>
          <ul className="history-list">
            {recentHistory.map((item, index) => (
              <li 
                key={`${item.word}-${index}`}
                className="history-item"
                onClick={() => handleHistoryClick(item.word)}
              >
                {item.word}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
