import { Router } from 'express';
import imageService from '../services/imageService.js';

const router = Router();

/**
 * 단어 핵심 이미지 생성
 * POST /api/image/word
 * Body: { word, meaning, isComplex }
 */
router.post('/word', async (req, res) => {
  try {
    const { word, meaning, isComplex = false } = req.body;
    
    if (!word || !meaning) {
      return res.status(400).json({ error: '단어와 의미가 필요합니다.' });
    }
    
    const result = await imageService.generateWordImage(word, meaning, isComplex);
    
    if (result.error) {
      return res.status(422).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('단어 이미지 생성 오류:', error);
    res.status(500).json({ error: '이미지를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 의미별 삽화 생성 (닥터슬럼프 스타일)
 * POST /api/image/illustration
 * Body: { word, meaning, context }
 */
router.post('/illustration', async (req, res) => {
  try {
    const { word, meaning, context = '' } = req.body;
    
    if (!word || !meaning) {
      return res.status(400).json({ error: '단어와 의미가 필요합니다.' });
    }
    
    const result = await imageService.generateIllustration(word, meaning, context);
    
    if (result.error) {
      return res.status(422).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('삽화 생성 오류:', error);
    res.status(500).json({ error: '삽화를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 에피소드 삽화 생성
 * POST /api/image/episode
 * Body: { title, storyContext }
 */
router.post('/episode', async (req, res) => {
  try {
    const { title, storyContext } = req.body;
    
    if (!title || !storyContext) {
      return res.status(400).json({ error: '제목과 이야기 컨텍스트가 필요합니다.' });
    }
    
    const result = await imageService.generateEpisodeImage(title, storyContext);
    
    if (result.error) {
      return res.status(422).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('에피소드 이미지 생성 오류:', error);
    res.status(500).json({ error: '이미지를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 커스텀 이미지 생성
 * POST /api/image/generate
 * Body: { prompt, size, style }
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', style = 'vivid' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '프롬프트가 필요합니다.' });
    }
    
    const result = await imageService.generateImage(prompt, { size, style });
    
    if (result.error) {
      return res.status(422).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    res.status(500).json({ error: '이미지를 생성하는 중 오류가 발생했습니다.' });
  }
});

export default router;
