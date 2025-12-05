import axios from 'axios'

// 환경 변수에서 API URL 가져오기
// 개발 환경: .env.development 또는 기본값 http://localhost:3001
// 프로덕션 환경: .env.production 또는 배포 플랫폼의 환경 변수 설정
const getApiBaseURL = () => {
  // 환경 변수가 명시적으로 설정된 경우 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 개발 환경인 경우 로컬 서버 사용
  if (import.meta.env.DEV) {
    return 'http://localhost:3001'
  }
  
  // 프로덕션 환경인 경우 환경 변수 필수
  // 배포 시 반드시 VITE_API_BASE_URL 환경 변수를 설정해야 합니다
  console.warn('VITE_API_BASE_URL이 설정되지 않았습니다. 환경 변수를 설정해주세요.')
  return ''
}

export const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

