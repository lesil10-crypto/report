import admin from 'firebase-admin';

let db = null;

// Firebase 초기화
function initializeFirebase() {
  if (db) return db;
  
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.log('Firebase가 설정되지 않았습니다. 로컬 저장소를 사용합니다.');
    return null;
  }
  
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    db = admin.firestore();
    console.log('Firebase 연결 성공');
    return db;
  } catch (error) {
    console.error('Firebase 초기화 오류:', error);
    return null;
  }
}

// 로컬 저장소 (Firebase 없을 때 대체)
const localStore = {
  words: new Map(),
  savedExamples: new Map(),
  searchHistory: []
};

/**
 * 단어 정보 저장
 */
export async function saveWord(userId, wordData) {
  const firestore = initializeFirebase();
  
  // 복잡한 객체를 JSON 문자열로 변환 (Firestore 호환)
  const sanitizedData = sanitizeForFirestore(wordData);
  
  if (firestore) {
    try {
      await firestore
        .collection('users')
        .doc(userId)
        .collection('words')
        .doc(wordData.word.toLowerCase())
        .set({
          ...sanitizedData,
          savedAt: admin.firestore.FieldValue.serverTimestamp(),
          isLearned: false
        }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Firestore 저장 오류:', error);
      throw error;
    }
  } else {
    // 로컬 저장
    localStore.words.set(`${userId}:${wordData.word.toLowerCase()}`, {
      ...sanitizedData,
      savedAt: new Date().toISOString(),
      isLearned: false
    });
    return { success: true, local: true };
  }
}

/**
 * 저장된 단어 목록 가져오기
 */
export async function getSavedWords(userId, options = {}) {
  const { sortBy = 'savedAt', order = 'desc', partOfSpeech = null } = options;
  const firestore = initializeFirebase();
  
  if (firestore) {
    try {
      let query = firestore
        .collection('users')
        .doc(userId)
        .collection('words');
      
      if (partOfSpeech) {
        query = query.where('partOfSpeech', 'array-contains', partOfSpeech);
      }
      
      query = query.orderBy(sortBy, order);
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...deserializeFromFirestore(doc.data())
      }));
    } catch (error) {
      console.error('Firestore 조회 오류:', error);
      throw error;
    }
  } else {
    // 로컬 저장소에서 조회
    const words = [];
    localStore.words.forEach((value, key) => {
      if (key.startsWith(`${userId}:`)) {
        words.push({ id: key.split(':')[1], ...value });
      }
    });
    
    // 정렬
    words.sort((a, b) => {
      if (order === 'desc') {
        return b[sortBy] > a[sortBy] ? 1 : -1;
      }
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });
    
    return words;
  }
}

/**
 * 단어 학습 완료 표시
 */
export async function markAsLearned(userId, word, isLearned = true) {
  const firestore = initializeFirebase();
  
  if (firestore) {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('words')
      .doc(word.toLowerCase())
      .update({
        isLearned,
        learnedAt: isLearned ? admin.firestore.FieldValue.serverTimestamp() : null
      });
  } else {
    const key = `${userId}:${word.toLowerCase()}`;
    if (localStore.words.has(key)) {
      const data = localStore.words.get(key);
      data.isLearned = isLearned;
      data.learnedAt = isLearned ? new Date().toISOString() : null;
    }
  }
  
  return { success: true };
}

/**
 * 예문 저장
 */
export async function saveExample(userId, example) {
  const firestore = initializeFirebase();
  const exampleId = `${example.word}_${Date.now()}`;
  
  if (firestore) {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('savedExamples')
      .doc(exampleId)
      .set({
        ...example,
        savedAt: admin.firestore.FieldValue.serverTimestamp()
      });
  } else {
    localStore.savedExamples.set(`${userId}:${exampleId}`, {
      ...example,
      savedAt: new Date().toISOString()
    });
  }
  
  return { success: true, id: exampleId };
}

/**
 * 저장된 예문 목록
 */
export async function getSavedExamples(userId) {
  const firestore = initializeFirebase();
  
  if (firestore) {
    const snapshot = await firestore
      .collection('users')
      .doc(userId)
      .collection('savedExamples')
      .orderBy('savedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    const examples = [];
    localStore.savedExamples.forEach((value, key) => {
      if (key.startsWith(`${userId}:`)) {
        examples.push({ id: key.split(':')[1], ...value });
      }
    });
    return examples;
  }
}

/**
 * 검색 기록 저장
 */
export async function saveSearchHistory(userId, word) {
  const firestore = initializeFirebase();
  
  if (firestore) {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('searchHistory')
      .add({
        word: word.toLowerCase(),
        searchedAt: admin.firestore.FieldValue.serverTimestamp()
      });
  } else {
    localStore.searchHistory.push({
      userId,
      word: word.toLowerCase(),
      searchedAt: new Date().toISOString()
    });
  }
  
  return { success: true };
}

/**
 * 검색 기록 조회
 */
export async function getSearchHistory(userId, limit = 50) {
  const firestore = initializeFirebase();
  
  if (firestore) {
    const snapshot = await firestore
      .collection('users')
      .doc(userId)
      .collection('searchHistory')
      .orderBy('searchedAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data());
  } else {
    return localStore.searchHistory
      .filter(h => h.userId === userId)
      .slice(-limit)
      .reverse();
  }
}

/**
 * 단어 삭제
 */
export async function deleteWord(userId, word) {
  const firestore = initializeFirebase();
  
  if (firestore) {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('words')
      .doc(word.toLowerCase())
      .delete();
  } else {
    localStore.words.delete(`${userId}:${word.toLowerCase()}`);
  }
  
  return { success: true };
}

// Firestore 호환을 위한 데이터 직렬화
function sanitizeForFirestore(data) {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    // 복잡한 배열은 JSON 문자열로 변환
    const hasComplexItems = data.some(item => 
      typeof item === 'object' && item !== null
    );
    if (hasComplexItems) {
      return JSON.stringify(data);
    }
    return data;
  }
  
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = sanitizeForFirestore(value);
  }
  return result;
}

// Firestore에서 가져온 데이터 역직렬화
function deserializeFromFirestore(data) {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'object') {
    // JSON 문자열인지 확인
    if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(deserializeFromFirestore);
  }
  
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = deserializeFromFirestore(value);
  }
  return result;
}

export default {
  saveWord,
  getSavedWords,
  markAsLearned,
  saveExample,
  getSavedExamples,
  saveSearchHistory,
  getSearchHistory,
  deleteWord
};
