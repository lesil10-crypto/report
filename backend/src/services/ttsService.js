import OpenAI from 'openai';
import axios from 'axios';

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const provider = process.env.TTS_PROVIDER || 'browser';

/**
 * TTS 오디오 생성
 */
export async function generateSpeech(text, options = {}) {
  const { voice = 'alloy', speed = 1.0 } = options;
  
  try {
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(text, voice, speed);
      case 'elevenlabs':
        return await generateWithElevenLabs(text, options);
      case 'browser':
        // 브라우저 TTS는 프론트엔드에서 처리
        return { provider: 'browser', text };
      default:
        return { provider: 'browser', text };
    }
  } catch (error) {
    console.error('TTS 오류:', error);
    throw error;
  }
}

/**
 * OpenAI TTS
 */
async function generateWithOpenAI(text, voice, speed) {
  if (!openai) throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice, // alloy, echo, fable, onyx, nova, shimmer
    input: text,
    speed: speed
  });
  
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    provider: 'openai',
    audio: buffer.toString('base64'),
    contentType: 'audio/mpeg'
  };
}

/**
 * ElevenLabs TTS
 */
async function generateWithElevenLabs(text, options) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ElevenLabs API 키가 설정되지 않았습니다.');
  
  const voiceId = options.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Rachel (default)
  
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    },
    {
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      responseType: 'arraybuffer'
    }
  );
  
  return {
    provider: 'elevenlabs',
    audio: Buffer.from(response.data).toString('base64'),
    contentType: 'audio/mpeg'
  };
}

/**
 * 단어 발음 생성
 */
export async function generateWordPronunciation(word) {
  return await generateSpeech(word, { speed: 0.9 });
}

/**
 * 예문 음성 생성
 */
export async function generateSentenceSpeech(sentence) {
  return await generateSpeech(sentence, { speed: 1.0 });
}

export default {
  generateSpeech,
  generateWordPronunciation,
  generateSentenceSpeech
};
