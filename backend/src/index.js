import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import wordRoutes from './routes/wordRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';
import storageRoutes from './routes/storageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정 (가장 먼저!)
app.use(cors());

// 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: parseInt(process.env.RATE_LIMIT_MAX) || 60,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }
});
app.use('/api', limiter);

// 라우트
app.use('/api/word', wordRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/storage', storageRoutes);

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    providers: {
      text: process.env.TEXT_PROVIDER || 'openai',
      image: process.env.IMAGE_PROVIDER || 'dalle',
      tts: process.env.TTS_PROVIDER || 'browser'
    }
  });
});

// 설정 정보 (프론트엔드용)
app.get('/api/config', (req, res) => {
  res.json({
    textProvider: process.env.TEXT_PROVIDER || 'openai',
    imageProvider: process.env.IMAGE_PROVIDER || 'dalle',
    ttsProvider: process.env.TTS_PROVIDER || 'browser'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: '서버 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI 단어장 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📝 텍스트 API: ${process.env.TEXT_PROVIDER || 'openai'}`);
  console.log(`🖼️  이미지 API: ${process.env.IMAGE_PROVIDER || 'dalle'}`);
  console.log(`🔊 TTS API: ${process.env.TTS_PROVIDER || 'browser'}`);
});
