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

// 세션 기반 인증 사용 - 서버에서 자동으로 세션 ID 생성 및 쿠키 관리
// 필요시 /user-id 엔드포인트를 호출하여 현재 사용자 ID를 조회할 수 있습니다

export const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송 (세션 기반 인증)
});

// 세션 기반 인증 사용 - 쿠키가 자동으로 전송되므로 헤더 추가 불필요
// 필요시 사용자 ID를 조회할 수 있도록 getOrCreateUserId 함수는 유지
