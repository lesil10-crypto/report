import React from 'react';
import { Sparkles, Lightbulb, MessageCircle } from 'lucide-react';
import './Episode.css';

function Episode({ data, image, onImageClick }) {
  if (!data) return null;
  
  return (
    <div className="episode card">
      <h3 className="card-title">
        <Sparkles size={20} />
        재미있는 에피소드
      </h3>
      
      <div className="episode-content">
        {/* 에피소드 이미지 */}
        {image && !image.error && (
          <div 
            className="episode-image-container"
            onClick={() => onImageClick(image)}
          >
            <img 
              src={image.url || image.base64}
              alt={data.title}
              className="episode-image"
            />
          </div>
        )}
        
        <div className="episode-text">
          <h4 className="episode-title">{data.title}</h4>
          
          <div className="episode-story">
            {data.story.split('\n').map((paragraph, i) => (
              paragraph.trim() && <p key={i}>{paragraph}</p>
            ))}
          </div>
          
          {/* 기억법 팁 */}
          {data.memoryTip && (
            <div className="episode-tip">
              <div className="tip-header">
                <Lightbulb size={16} />
                <span>기억법 팁</span>
              </div>
              <p>{data.memoryTip}</p>
            </div>
          )}
          
          {/* 교훈 */}
          {data.moralOrLesson && (
            <div className="episode-moral">
              <div className="moral-header">
                <MessageCircle size={16} />
                <span>핵심 포인트</span>
              </div>
              <p>{data.moralOrLesson}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Episode;
