import { Router } from 'express';
import storageService from '../services/storageService.js';

const router = Router();

/**
 * 예문 저장
 * POST /api/storage/example
 */
router.post('/example', async (req, res) => {
  try {
    const { userId = 'anonymous', example } = req.body;
    
    if (!example || !example.sentence) {
      return res.status(400).json({ error: '예문 정보가 필요합니다.' });
    }
    
    const result = await storageService.saveExample(userId, example);
    res.json(result);
  } catch (error) {
    console.error('예문 저장 오류:', error);
    res.status(500).json({ error: '예문을 저장하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 저장된 예문 목록
 * GET /api/storage/examples?userId=user
 */
router.get('/examples', async (req, res) => {
  try {
    const { userId = 'anonymous' } = req.query;
    
    const examples = await storageService.getSavedExamples(userId);
    res.json({ examples });
  } catch (error) {
    console.error('예문 조회 오류:', error);
    res.status(500).json({ error: '예문을 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 검색 기록 저장
 * POST /api/storage/history
 */
router.post('/history', async (req, res) => {
  try {
    const { userId = 'anonymous', word } = req.body;
    
    if (!word) {
      return res.status(400).json({ error: '단어가 필요합니다.' });
    }
    
    const result = await storageService.saveSearchHistory(userId, word);
    res.json(result);
  } catch (error) {
    console.error('검색 기록 저장 오류:', error);
    res.status(500).json({ error: '검색 기록을 저장하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 검색 기록 조회
 * GET /api/storage/history?userId=user&limit=50
 */
router.get('/history', async (req, res) => {
  try {
    const { userId = 'anonymous', limit = 50 } = req.query;
    
    const history = await storageService.getSearchHistory(userId, parseInt(limit));
    res.json({ history });
  } catch (error) {
    console.error('검색 기록 조회 오류:', error);
    res.status(500).json({ error: '검색 기록을 조회하는 중 오류가 발생했습니다.' });
  }
});

export default router;
