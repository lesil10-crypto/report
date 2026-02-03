import React from 'react';
import { X, Download } from 'lucide-react';
import './ImagePopup.css';

function ImagePopup({ image, onClose }) {
  if (!image) return null;
  
  const imageUrl = image.url || image.base64;
  
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vocabulary-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('이미지 다운로드 실패:', error);
    }
  };
  
  return (
    <div className="image-popup-overlay" onClick={onClose}>
      <div className="image-popup-content" onClick={e => e.stopPropagation()}>
        <div className="image-popup-header">
          <button className="btn btn-sm" onClick={handleDownload}>
            <Download size={16} />
            다운로드
          </button>
          <button className="popup-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="image-popup-body">
          <img src={imageUrl} alt="Word illustration" />
        </div>
        
        {image.revisedPrompt && (
          <div className="image-popup-footer">
            <p className="revised-prompt">
              <strong>이미지 설명:</strong> {image.revisedPrompt}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImagePopup;
