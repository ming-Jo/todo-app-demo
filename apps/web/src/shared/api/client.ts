import axios from 'axios';

// 환경 변수에서 API URL 가져오기
// 개발 환경: .env.development 또는 기본값 http://localhost:3001
// 프로덕션 환경: .env.production 또는 배포 플랫폼의 환경 변수 설정
const getApiBaseURL = () => {
  // 환경 변수가 명시적으로 설정된 경우 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 개발 환경인 경우 로컬 서버 사용
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }

  // 프로덕션 환경인 경우 환경 변수 필수
  // 배포 시 반드시 VITE_API_BASE_URL 환경 변수를 설정해야 합니다
  console.warn('VITE_API_BASE_URL이 설정되지 않았습니다. 환경 변수를 설정해주세요.');
  return '';
};

const STORAGE_KEY = 'todo-app-user-id';

// 사용자 ID 가져오기 또는 생성
const getOrCreateUserId = async (): Promise<string> => {
  const storedUserId = localStorage.getItem(STORAGE_KEY);

  if (storedUserId) {
    return storedUserId;
  }

  // 서버 URL이 있으면 서버에서 ID 발급받기 (로컬 개발 환경에서도 서버 사용 가능)
  const baseURL = getApiBaseURL();
  if (baseURL) {
    try {
      const response = await fetch(`${baseURL}/user-id`);
      if (!response.ok) {
        throw new Error('Failed to get user ID from server');
      }

      const data = await response.json();
      const userId = data.userId;

      // localStorage에 저장
      localStorage.setItem(STORAGE_KEY, userId);
      return userId;
    } catch (error) {
      console.error('Failed to get user ID from server:', error);
      // 서버 요청 실패 시 로컬에서 ID 생성
      const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, localId);
      return localId;
    }
  }

  // 서버 URL이 없으면 로컬에서 ID 생성
  const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem(STORAGE_KEY, localId);
  return localId;
};

// 사용자 ID를 Promise로 캐싱 (동시 요청 방지)
let userIdPromise: Promise<string> | null = null;

export const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 x-user-id 헤더 추가
apiClient.interceptors.request.use(
  async (config) => {
    // 사용자 ID 발급 요청은 제외
    if (config.url === '/user-id') {
      return config;
    }

    // 사용자 ID 가져오기 (캐시된 Promise 사용)
    if (!userIdPromise) {
      userIdPromise = getOrCreateUserId();
    }

    const userId = await userIdPromise;
    config.headers['x-user-id'] = userId;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
