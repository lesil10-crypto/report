// TTS 유틸리티 - 브라우저 및 서버 TTS 지원

let currentUtterance = null;

/**
 * 브라우저 TTS로 텍스트 읽기
 */
export function speakWithBrowser(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('이 브라우저는 음성 합성을 지원하지 않습니다.'));
      return;
    }
    
    // 이전 음성 중지
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 영어 음성 찾기
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en-')) || voices[0];
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    
    utterance.onerror = (event) => {
      currentUtterance = null;
      reject(new Error(event.error));
    };
    
    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * 서버 TTS 오디오 재생
 */
export function playServerAudio(base64Audio, contentType = 'audio/mpeg') {
  return new Promise((resolve, reject) => {
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      const blob = new Blob([arrayBuffer], { type: contentType });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      audio.play();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 현재 재생 중지
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

/**
 * 음성 목록 가져오기
 */
export function getVoices() {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    
    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // 음성 로딩 대기
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
    
    // 타임아웃
    setTimeout(() => resolve([]), 1000);
  });
}

/**
 * 영어 음성 목록
 */
export async function getEnglishVoices() {
  const voices = await getVoices();
  return voices.filter(v => v.lang.startsWith('en-'));
}

export default {
  speakWithBrowser,
  playServerAudio,
  stopSpeaking,
  getVoices,
  getEnglishVoices
};
