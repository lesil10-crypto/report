import OpenAI from 'openai';
import axios from 'axios';

// API 클라이언트 초기화
let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const provider = process.env.IMAGE_PROVIDER || 'pollinations';

/**
 * 이미지 생성 메인 함수
 */
export async function generateImage(prompt, options = {}) {
  const { size = '1024x1024', style = 'vivid' } = options;
  
  try {
    switch (provider) {
      case 'pollinations':
        return await generateWithPollinations(prompt, size);
      case 'dalle':
        return await generateWithDalle(prompt, size, style);
      case 'stability':
        return await generateWithStability(prompt, size);
      case 'leonardo':
        return await generateWithLeonardo(prompt, size);
      default:
        // 기본값으로 Pollinations 사용
        return await generateWithPollinations(prompt, size);
    }
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    
    // 안전 정책 위반 등의 경우
    if (error.message?.includes('safety') || error.message?.includes('policy')) {
      return {
        error: true,
        message: '안전 정책으로 인해 이미지를 생성할 수 없습니다.'
      };
    }
    
    throw error;
  }
}

/**
 * Pollinations.ai 이미지 생성 (무료, API 키 불필요)
 */
async function generateWithPollinations(prompt, size) {
  const [width, height] = size.split('x').map(Number);
  
  // URL 인코딩된 프롬프트로 이미지 URL 생성
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;
  
  // 이미지가 실제로 생성되는지 확인 (HEAD 요청)
  try {
    await axios.head(imageUrl, { timeout: 30000 });
  } catch (error) {
    // HEAD 실패해도 URL은 유효할 수 있음, 그냥 진행
    console.log('Pollinations 이미지 생성 중...');
  }
  
  return {
    url: imageUrl,
    provider: 'pollinations'
  };
}

/**
 * DALL-E 3 이미지 생성
 */
async function generateWithDalle(prompt, size, style) {
  if (!openai) throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: size,
    style: style,
    quality: 'standard'
  });
  
  return {
    url: response.data[0].url,
    revisedPrompt: response.data[0].revised_prompt
  };
}

/**
 * Stability AI (Stable Diffusion XL) 이미지 생성
 */
async function generateWithStability(prompt, size) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) throw new Error('Stability API 키가 설정되지 않았습니다.');
  
  // 사이즈 변환
  const [width, height] = size.split('x').map(Number);
  
  const response = await axios.post(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    {
      text_prompts: [
        { text: prompt, weight: 1 },
        { text: 'blurry, bad quality, distorted', weight: -1 }
      ],
      cfg_scale: 7,
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
      samples: 1,
      steps: 30
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );
  
  const base64Image = response.data.artifacts[0].base64;
  return {
    base64: base64Image,
    url: `data:image/png;base64,${base64Image}`
  };
}

/**
 * Leonardo AI 이미지 생성
 */
async function generateWithLeonardo(prompt, size) {
  const apiKey = process.env.LEONARDO_API_KEY;
  if (!apiKey) throw new Error('Leonardo API 키가 설정되지 않았습니다.');
  
  const [width, height] = size.split('x').map(Number);
  
  // 1. 생성 요청
  const createResponse = await axios.post(
    'https://cloud.leonardo.ai/api/rest/v1/generations',
    {
      prompt: prompt,
      negative_prompt: 'blurry, bad quality, distorted, ugly',
      modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
      num_images: 1
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const generationId = createResponse.data.sdGenerationJob.generationId;
  
  // 2. 생성 완료 대기
  let attempts = 0;
  while (attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusResponse = await axios.get(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      }
    );
    
    const generation = statusResponse.data.generations_by_pk;
    if (generation.status === 'COMPLETE') {
      return {
        url: generation.generated_images[0].url
      };
    }
    
    attempts++;
  }
  
  throw new Error('이미지 생성 시간이 초과되었습니다.');
}

/**
 * 단어 핵심 이미지 생성
 */
export async function generateWordImage(word, meaning, isComplex = false) {
  let prompt;
  
  if (isComplex) {
    // 복잡한 개념 (예: 뇌, 원자 등)은 다이어그램 스타일
    prompt = `Educational diagram illustration of "${word}" (${meaning}). 
Clean, detailed scientific diagram style with labeled parts. 
Professional educational material aesthetic. 
High quality, clear visualization with annotations in English.
White or light gray background.`;
  } else {
    prompt = `Beautiful, clear illustration representing the concept of "${word}" (${meaning}).
Modern, clean artistic style. 
Visually intuitive representation of the meaning.
High quality, vibrant colors.
Suitable for educational vocabulary learning.`;
  }
  
  return await generateImage(prompt, { size: '1024x1024', style: 'vivid' });
}

/**
 * 의미별 삽화 생성 (닥터슬럼프 스타일)
 */
export async function generateIllustration(word, meaning, context = '') {
  const prompt = `Cute cartoon illustration in Dr. Slump (Akira Toriyama) anime style.
Scene depicting: "${meaning}" ${context ? `in context of ${context}` : ''}.
Featuring the word "${word}".
Playful, colorful, humorous style with big expressive eyes.
Simple clean background.
Size: 300x300 pixels equivalent.
Kid-friendly, fun educational illustration.`;

  return await generateImage(prompt, { size: '1024x1024', style: 'vivid' });
}

/**
 * 에피소드 삽화 생성
 */
export async function generateEpisodeImage(title, storyContext) {
  const prompt = `Cute cartoon illustration in Dr. Slump (Akira Toriyama) anime style.
Scene for story titled: "${title}".
Story context: ${storyContext}
Playful, colorful illustration with cute characters.
Fun, memorable educational illustration.
Kid-friendly style.`;

  return await generateImage(prompt, { size: '1024x1024', style: 'vivid' });
}

export default {
  generateImage,
  generateWordImage,
  generateIllustration,
  generateEpisodeImage
};
