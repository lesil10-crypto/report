import { Router } from 'express';
import ttsService from '../services/ttsService.js';

const router = Router();

/**
 * 텍스트 음성 변환
 * POST /api/tts/speak
 * Body: { text, voice, speed }
 */
router.post('/speak', async (req, res) => {
  try {
    const { text, voice, speed } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '텍스트가 필요합니다.' });
    }
    
    const result = await ttsService.generateSpeech(text, { voice, speed });
    
    // 브라우저 TTS인 경우
    if (result.provider === 'browser') {
      return res.json(result);
    }
    
    // 서버 TTS인 경우 오디오 데이터 반환
    res.json(result);
  } catch (error) {
    console.error('TTS 오류:', error);
    res.status(500).json({ error: '음성을 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 단어 발음
 * GET /api/tts/word/:word
 */
router.get('/word/:word', async (req, res) => {
  try {
    const { word } = req.params;
    
    const result = await ttsService.generateWordPronunciation(word);
    res.json(result);
  } catch (error) {
    console.error('단어 발음 오류:', error);
    res.status(500).json({ error: '발음을 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 예문 음성
 * POST /api/tts/sentence
 * Body: { sentence }
 */
router.post('/sentence', async (req, res) => {
  try {
    const { sentence } = req.body;
    
    if (!sentence) {
      return res.status(400).json({ error: '문장이 필요합니다.' });
    }
    
    const result = await ttsService.generateSentenceSpeech(sentence);
    res.json(result);
  } catch (error) {
    console.error('예문 음성 오류:', error);
    res.status(500).json({ error: '음성을 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * TTS 설정 정보
 * GET /api/tts/config
 */
router.get('/config', (req, res) => {
  res.json({
    provider: process.env.TTS_PROVIDER || 'browser',
    availableVoices: getAvailableVoices()
  });
});

function getAvailableVoices() {
  const provider = process.env.TTS_PROVIDER || 'browser';
  
  switch (provider) {
    case 'openai':
      return [
        { id: 'alloy', name: 'Alloy (Neutral)' },
        { id: 'echo', name: 'Echo (Male)' },
        { id: 'fable', name: 'Fable (British)' },
        { id: 'onyx', name: 'Onyx (Deep Male)' },
        { id: 'nova', name: 'Nova (Female)' },
        { id: 'shimmer', name: 'Shimmer (Soft Female)' }
      ];
    case 'elevenlabs':
      return [
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' }
      ];
    case 'browser':
    default:
      return [{ id: 'browser', name: '브라우저 기본 음성' }];
  }
}

export default router;
