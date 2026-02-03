import React, { useState } from 'react';
import { HelpCircle, Play, Check, X, Loader2, RotateCcw } from 'lucide-react';
import { wordApi } from '../services/api';
import './Quiz.css';

function Quiz({ word, meanings, data, dispatch, setLoading, showToast }) {
  const [loading, setLocalLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  
  const loadQuiz = async () => {
    if (!word || !meanings || meanings.length === 0) return;
    
    setLocalLoading(true);
    setLoading('quiz', true);
    setAnswers({});
    setShowResults({});
    
    try {
      const result = await wordApi.getQuiz(word, meanings);
      dispatch({ type: 'SET_QUIZ', payload: result });
    } catch (error) {
      showToast('퀴즈를 생성하는 데 실패했습니다.', 'error');
    } finally {
      setLocalLoading(false);
      setLoading('quiz', false);
    }
  };
  
  const handleInputChange = (quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  };
  
  const checkAnswer = (quiz) => {
    const userAnswer = (answers[quiz.id] || '').toLowerCase().trim();
    const correctAnswer = quiz.answer.toLowerCase().trim();
    
    setShowResults(prev => ({
      ...prev,
      [quiz.id]: {
        isCorrect: userAnswer === correctAnswer,
        userAnswer,
        correctAnswer
      }
    }));
  };
  
  const resetQuiz = () => {
    setAnswers({});
    setShowResults({});
  };
  
  if (!data && !loading) {
    return (
      <div className="quiz card">
        <h3 className="card-title">
          <HelpCircle size={20} />
          빈칸 채우기 퀴즈
        </h3>
        <div className="quiz-prompt">
          <p>단어의 정확한 용법을 테스트하는 퀴즈입니다.</p>
          <button 
            className="btn btn-primary"
            onClick={loadQuiz}
            disabled={!word || !meanings?.length}
          >
            <Play size={16} />
            퀴즈 시작
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="quiz card">
      <div className="quiz-header">
        <h3 className="card-title">
          <HelpCircle size={20} />
          빈칸 채우기 퀴즈
        </h3>
        <div className="quiz-actions">
          <button className="btn btn-sm" onClick={resetQuiz}>
            <RotateCcw size={14} />
            초기화
          </button>
          <button className="btn btn-sm" onClick={loadQuiz}>
            새 퀴즈
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="quiz-loading">
          <Loader2 size={32} className="spin" />
          <p>퀴즈를 생성하는 중...</p>
        </div>
      ) : data?.quizzes ? (
        <div className="quiz-list">
          {data.quizzes.map((quiz, i) => (
            <div 
              key={quiz.id} 
              className={`quiz-item ${showResults[quiz.id] ? 
                (showResults[quiz.id].isCorrect ? 'correct' : 'incorrect') : ''}`}
            >
              <div className="quiz-question">
                <span className="quiz-number">{i + 1}</span>
                <span className={`difficulty-badge ${quiz.difficulty}`}>
                  {quiz.difficulty === 'easy' ? '쉬움' : 
                   quiz.difficulty === 'medium' ? '보통' : '어려움'}
                </span>
              </div>
              
              <p className="quiz-text">{quiz.question}</p>
              
              {quiz.hint && (
                <p className="quiz-hint">💡 힌트: {quiz.hint}</p>
              )}
              
              <div className="quiz-input-row">
                <input
                  type="text"
                  className="input quiz-input"
                  placeholder="답을 입력하세요"
                  value={answers[quiz.id] || ''}
                  onChange={(e) => handleInputChange(quiz.id, e.target.value)}
                  disabled={showResults[quiz.id]}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => checkAnswer(quiz)}
                  disabled={!answers[quiz.id] || showResults[quiz.id]}
                >
                  확인
                </button>
              </div>
              
              {showResults[quiz.id] && (
                <div className={`quiz-result ${showResults[quiz.id].isCorrect ? 'correct' : 'incorrect'}`}>
                  {showResults[quiz.id].isCorrect ? (
                    <>
                      <Check size={18} />
                      <span>정답입니다!</span>
                    </>
                  ) : (
                    <>
                      <X size={18} />
                      <span>오답입니다. 정답: <strong>{quiz.answer}</strong></span>
                    </>
                  )}
                </div>
              )}
              
              {showResults[quiz.id] && quiz.explanation && (
                <div className="quiz-explanation">
                  <strong>해설:</strong> {quiz.explanation}
                </div>
              )}
            </div>
          ))}
          
          {/* 점수 표시 */}
          {Object.keys(showResults).length === data.quizzes.length && (
            <div className="quiz-score">
              <h4>최종 점수</h4>
              <p className="score">
                {Object.values(showResults).filter(r => r.isCorrect).length} / {data.quizzes.length}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default Quiz;
