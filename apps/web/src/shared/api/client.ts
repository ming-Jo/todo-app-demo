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

// localStorage에서 userId 저장/조회 (모바일 브라우저 쿠키 fallback)
const USER_ID_STORAGE_KEY = 'todo-app-user-id';

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const userId = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (!userId) {
    // 서버에서 userId를 받아올 수 있도록 빈 문자열 반환
    // 서버 응답에서 userId를 받아서 저장
    return '';
  }
  return userId;
}

function saveUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  }
}

export const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송 (세션 기반 인증)
});

// 요청 인터셉터: 쿠키 fallback으로 헤더에 userId 추가
apiClient.interceptors.request.use(
  (config) => {
    const userId = getOrCreateUserId();
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터: 서버에서 userId를 받아서 localStorage에 저장
apiClient.interceptors.response.use(
  (response) => {
    // 응답 헤더에서 userId 확인
    const userIdFromHeader = response.headers['x-user-id'];
    if (userIdFromHeader) {
      saveUserId(userIdFromHeader);
    }

    // 응답 본문에서 userId 확인 (user-id 엔드포인트)
    if (response.data?.userId) {
      saveUserId(response.data.userId);
    }

    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);
