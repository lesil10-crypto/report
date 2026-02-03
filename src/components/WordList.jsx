import React, { useState, useMemo } from 'react';
import { X, Search, Calendar, SortAsc, Tag, Check, Trash2 } from 'lucide-react';
import { wordApi } from '../services/api';
import './WordList.css';

function WordList({ words, history, onClose, onSelect, dispatch, showToast }) {
  const [activeTab, setActiveTab] = useState('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('savedAt');
  const [filterPos, setFilterPos] = useState('all');
  
  const filteredWords = useMemo(() => {
    let result = [...words];
    
    // 검색 필터
    if (searchQuery) {
      result = result.filter(w => 
        w.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 품사 필터
    if (filterPos !== 'all') {
      result = result.filter(w => 
        w.partOfSpeech?.includes(filterPos)
      );
    }
    
    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'word':
          return a.word.localeCompare(b.word);
        case 'savedAt':
        default:
          return new Date(b.savedAt) - new Date(a.savedAt);
      }
    });
    
    return result;
  }, [words, searchQuery, sortBy, filterPos]);
  
  const handleToggleLearned = async (word, currentStatus) => {
    try {
      await wordApi.markLearned(word, !currentStatus);
      // 상태 업데이트
      dispatch({
        type: 'SET_SAVED_WORDS',
        payload: words.map(w => 
          w.word === word ? { ...w, isLearned: !currentStatus } : w
        )
      });
      showToast(
        !currentStatus ? '학습 완료로 표시되었습니다.' : '학습 중으로 변경되었습니다.',
        'success'
      );
    } catch (error) {
      showToast('상태 변경에 실패했습니다.', 'error');
    }
  };
  
  const handleDelete = async (word) => {
    if (!confirm(`"${word}"를 삭제하시겠습니까?`)) return;
    
    try {
      await wordApi.delete(word);
      dispatch({
        type: 'SET_SAVED_WORDS',
        payload: words.filter(w => w.word !== word)
      });
      showToast('단어가 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };
  
  // 품사 목록 추출
  const allPos = useMemo(() => {
    const posSet = new Set();
    words.forEach(w => {
      w.partOfSpeech?.forEach(pos => posSet.add(pos));
    });
    return Array.from(posSet);
  }, [words]);
  
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content word-list-popup" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h2>단어 목록</h2>
          <button className="popup-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        {/* 탭 */}
        <div className="word-list-tabs">
          <button 
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            저장된 단어 ({words.length})
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            검색 기록 ({history.length})
          </button>
        </div>
        
        {activeTab === 'saved' && (
          <>
            {/* 필터/정렬 */}
            <div className="word-list-controls">
              <div className="search-filter">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="단어 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="control-buttons">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="savedAt">최신순</option>
                  <option value="word">알파벳순</option>
                </select>
                
                <select value={filterPos} onChange={(e) => setFilterPos(e.target.value)}>
                  <option value="all">모든 품사</option>
                  {allPos.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* 단어 목록 */}
            <div className="word-list-body">
              {filteredWords.length === 0 ? (
                <div className="empty-list">
                  <p>저장된 단어가 없습니다.</p>
                </div>
              ) : (
                <ul className="word-items">
                  {filteredWords.map((item) => (
                    <li key={item.word} className={`word-item ${item.isLearned ? 'learned' : ''}`}>
                      <div className="word-item-main" onClick={() => { onSelect(item.word); onClose(); }}>
                        <span className="word-text">{item.word}</span>
                        <span className="word-meaning">
                          {item.coreMeanings?.[0]?.meaning || ''}
                        </span>
                      </div>
                      
                      <div className="word-item-meta">
                        {item.partOfSpeech?.map(pos => (
                          <span key={pos} className="pos-tag">{pos}</span>
                        ))}
                      </div>
                      
                      <div className="word-item-actions">
                        <button
                          className={`action-btn ${item.isLearned ? 'learned' : ''}`}
                          onClick={() => handleToggleLearned(item.word, item.isLearned)}
                          title={item.isLearned ? '학습 중으로 변경' : '학습 완료로 표시'}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(item.word)}
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'history' && (
          <div className="word-list-body">
            {history.length === 0 ? (
              <div className="empty-list">
                <p>검색 기록이 없습니다.</p>
              </div>
            ) : (
              <ul className="word-items history">
                {history.map((item, i) => (
                  <li 
                    key={`${item.word}-${i}`} 
                    className="word-item history-item"
                    onClick={() => { onSelect(item.word); onClose(); }}
                  >
                    <span className="word-text">{item.word}</span>
                    <span className="word-date">
                      {new Date(item.searchedAt).toLocaleDateString('ko-KR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WordList;
