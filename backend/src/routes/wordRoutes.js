import { Router } from 'express';
import textService from '../services/textService.js';
import storageService from '../services/storageService.js';

const router = Router();

/**
 * 단어 검색 및 기본 정보
 * GET /api/word/search?q=word
 */
router.get('/search', async (req, res) => {
  try {
    const { q: word } = req.query;
    
    if (!word || word.trim().length === 0) {
      return res.status(400).json({ error: '검색어를 입력해주세요.' });
    }
    
    const wordInfo = await textService.generateWordInfo(word.trim());
    
    if (wordInfo.error) {
      return res.status(404).json(wordInfo);
    }
    
    res.json(wordInfo);
  } catch (error) {
    console.error('단어 검색 오류:', error);
    res.status(500).json({ error: '단어 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 백과사전식 설명
 * GET /api/word/encyclopedia?word=word&meaning=meaning
 */
router.get('/encyclopedia', async (req, res) => {
  try {
    const { word, meaning } = req.query;
    
    if (!word || !meaning) {
      return res.status(400).json({ error: '단어와 의미가 필요합니다.' });
    }
    
    const encyclopedia = await textService.generateEncyclopedia(word, meaning);
    res.json(encyclopedia);
  } catch (error) {
    console.error('백과사전 생성 오류:', error);
    res.status(500).json({ error: '백과사전 정보를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 개념 트리
 * GET /api/word/concept-tree?word=word&meaning=meaning
 */
router.get('/concept-tree', async (req, res) => {
  try {
    const { word, meaning } = req.query;
    
    if (!word || !meaning) {
      return res.status(400).json({ error: '단어와 의미가 필요합니다.' });
    }
    
    const conceptTree = await textService.generateConceptTree(word, meaning);
    res.json(conceptTree);
  } catch (error) {
    console.error('개념 트리 생성 오류:', error);
    res.status(500).json({ error: '개념 트리를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 재미있는 에피소드
 * GET /api/word/episode?word=word&meaning=meaning
 */
router.get('/episode', async (req, res) => {
  try {
    const { word, meaning } = req.query;
    
    if (!word || !meaning) {
      return res.status(400).json({ error: '단어와 의미가 필요합니다.' });
    }
    
    const episode = await textService.generateEpisode(word, meaning);
    res.json(episode);
  } catch (error) {
    console.error('에피소드 생성 오류:', error);
    res.status(500).json({ error: '에피소드를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * AI 실시간 예문
 * GET /api/word/examples?word=word&meaningType=core&meaning=meaning
 */
router.get('/examples', async (req, res) => {
  try {
    const { word, meaningType, meaning } = req.query;
    
    if (!word || !meaning) {
      return res.status(400).json({ error: '단어와 의미가 필요합니다.' });
    }
    
    const examples = await textService.generateExamples(word, meaningType || 'core', meaning);
    res.json(examples);
  } catch (error) {
    console.error('예문 생성 오류:', error);
    res.status(500).json({ error: '예문을 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 상황별 대화 시나리오
 * GET /api/word/scenario?word=word&meaning=meaning
 */
router.get('/scenario', async (req, res) => {
  try {
    const { word, meaning } = req.query;
    
    if (!word || !meaning) {
      return res.status(400).json({ error: '단어와 의미가 필요합니다.' });
    }
    
    const scenario = await textService.generateScenario(word, meaning);
    res.json(scenario);
  } catch (error) {
    console.error('시나리오 생성 오류:', error);
    res.status(500).json({ error: '시나리오를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 빈칸 채우기 퀴즈
 * POST /api/word/quiz
 * Body: { word, meanings: [] }
 */
router.post('/quiz', async (req, res) => {
  try {
    const { word, meanings } = req.body;
    
    if (!word || !meanings || meanings.length === 0) {
      return res.status(400).json({ error: '단어와 의미 목록이 필요합니다.' });
    }
    
    const quiz = await textService.generateQuiz(word, meanings);
    res.json(quiz);
  } catch (error) {
    console.error('퀴즈 생성 오류:', error);
    res.status(500).json({ error: '퀴즈를 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 단어 저장
 * POST /api/word/save
 */
router.post('/save', async (req, res) => {
  try {
    const { userId = 'anonymous', wordData } = req.body;
    
    if (!wordData || !wordData.word) {
      return res.status(400).json({ error: '저장할 단어 정보가 필요합니다.' });
    }
    
    const result = await storageService.saveWord(userId, wordData);
    res.json(result);
  } catch (error) {
    console.error('단어 저장 오류:', error);
    res.status(500).json({ error: '단어를 저장하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 저장된 단어 목록
 * GET /api/word/saved?userId=user&sortBy=savedAt&order=desc
 */
router.get('/saved', async (req, res) => {
  try {
    const { userId = 'anonymous', sortBy, order, partOfSpeech } = req.query;
    
    const words = await storageService.getSavedWords(userId, { sortBy, order, partOfSpeech });
    res.json({ words });
  } catch (error) {
    console.error('저장된 단어 조회 오류:', error);
    res.status(500).json({ error: '저장된 단어를 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 학습 완료 표시
 * PATCH /api/word/learned
 */
router.patch('/learned', async (req, res) => {
  try {
    const { userId = 'anonymous', word, isLearned } = req.body;
    
    if (!word) {
      return res.status(400).json({ error: '단어가 필요합니다.' });
    }
    
    const result = await storageService.markAsLearned(userId, word, isLearned);
    res.json(result);
  } catch (error) {
    console.error('학습 완료 표시 오류:', error);
    res.status(500).json({ error: '학습 완료 표시 중 오류가 발생했습니다.' });
  }
});

/**
 * 단어 삭제
 * DELETE /api/word/:word
 */
router.delete('/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const { userId = 'anonymous' } = req.query;
    
    const result = await storageService.deleteWord(userId, word);
    res.json(result);
  } catch (error) {
    console.error('단어 삭제 오류:', error);
    res.status(500).json({ error: '단어를 삭제하는 중 오류가 발생했습니다.' });
  }
});

export default router;
