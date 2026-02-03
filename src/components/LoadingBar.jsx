import React from 'react';
import './LoadingBar.css';

function LoadingBar({ percent, message }) {
  return (
    <div className="loading-bar-container">
      <div className="loading-bar-track">
        <div 
          className="loading-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="loading-bar-info">
        <span className="loading-message">{message}</span>
        <span className="loading-percent">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

export default LoadingBar;
