# AI 영어 단어장 (AI Vocabulary App)

AI를 활용한 고급 영어 단어 학습 애플리케이션입니다.

## 📋 주요 기능

### AI 콘텐츠 생성
- **단어 정보 생성**: 발음, 핵심/부가 의미, 숙어 표현
- **백과사전식 설명**: 어원, 역사적 사례, 문학 표현 포함
- **개념 트리**: 상위/하위 개념 시각화
- **재미있는 에피소드**: 기억하기 쉬운 짧은 이야기
- **유의어/반의어**: 연관 단어 학습
- **AI 실시간 예문**: 의미별 5개 예문 생성
- **AI 이미지 생성**: 단어 핵심 이미지, 의미별 삽화

### 사용자 기능
- TTS 음성 지원
- 클릭 투 서치
- 단어/예문 저장 및 관리
- 학습 완료 체크
- 다양한 정렬/분류 옵션

## 🛠️ API 선택 가이드

### 1. 텍스트 생성 API (단어 정보, 예문, 설명 등)

| API | 장점 | 단점 | 예상 비용 |
|-----|------|------|-----------|
| **OpenAI GPT-4o** | 최고 품질, 한국어 우수 | 비용 높음 | $5/1M input tokens |
| **OpenAI GPT-4o-mini** | 빠르고 저렴, 품질 양호 | GPT-4o 대비 품질↓ | $0.15/1M input tokens |
| **Anthropic Claude** | 긴 컨텍스트, 정확한 지시 수행 | OpenAI 대비 약간 느림 | $3/1M input tokens |
| **Google Gemini** | 무료 tier 넉넉 | 한국어 품질 약간↓ | 무료/유료 |

**추천**: 
- 예산 충분 → GPT-4o
- 비용 절감 → GPT-4o-mini 또는 Claude Haiku

### 2. 이미지 생성 API

| API | 장점 | 단점 | 예상 비용 |
|-----|------|------|-----------|
| **DALL-E 3** | 텍스트 이해↑, OpenAI 통합 | 비용 높음, 속도 느림 | $0.04/이미지 |
| **Stability AI (SDXL)** | 고품질, 스타일 다양 | 프롬프트 엔지니어링 필요 | $0.002/이미지 |
| **Midjourney** | 최고 품질 | API 비공식, 사용 어려움 | 월 $10~ |
| **Leonardo AI** | 무료 tier, 품질 양호 | 일일 제한 있음 | 무료/유료 |
| **Replicate** | 다양한 모델, 유연함 | 모델별 품질 차이 | 사용량 기반 |

**추천**:
- 품질 우선 → DALL-E 3
- 비용 절감 → Stability AI 또는 Leonardo AI

### 3. TTS (Text-to-Speech) API

| API | 장점 | 단점 | 예상 비용 |
|-----|------|------|-----------|
| **ElevenLabs** | 자연스러운 음성 | 비용 높음 | 월 $5~ |
| **OpenAI TTS** | 빠르고 자연스러움 | 음성 커스텀 제한 | $15/1M chars |
| **Google Cloud TTS** | 무료 tier, 다양한 음성 | 설정 복잡 | 무료 4M chars/월 |
| **Web Speech API** | 무료, 설정 불필요 | 브라우저 의존, 품질↓ | 무료 |

**추천**:
- 품질 우선 → ElevenLabs 또는 OpenAI TTS
- 비용 절감 → Web Speech API (브라우저 내장)

## 📁 프로젝트 구조

```
ai-vocabulary/
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/     # UI 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── services/       # API 서비스
│   │   ├── contexts/       # React Context
│   │   ├── styles/         # 스타일 파일
│   │   └── utils/          # 유틸리티 함수
│   ├── package.json
│   └── vite.config.js
│
├── backend/                # Node.js 백엔드
│   ├── src/
│   │   ├── routes/         # API 라우트
│   │   ├── services/       # 비즈니스 로직
│   │   ├── config/         # 설정
│   │   └── middleware/     # 미들웨어
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🚀 설치 및 실행

### 1. 환경 변수 설정

```bash
# backend/.env
# 텍스트 생성 API (하나 선택)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key

# 이미지 생성 API (하나 선택)
IMAGE_PROVIDER=dalle|stability|leonardo
STABILITY_API_KEY=your_stability_key
LEONARDO_API_KEY=your_leonardo_key

# TTS API (하나 선택)
TTS_PROVIDER=openai|elevenlabs|google|browser
ELEVENLABS_API_KEY=your_elevenlabs_key

# Firebase (선택적)
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_key
FIREBASE_CLIENT_EMAIL=your_email
```

### 2. 백엔드 실행

```bash
cd backend
npm install
npm run dev
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

## 📝 라이선스

MIT License
