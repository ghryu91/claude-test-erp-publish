import axios from 'axios';
import { getToken, clearAuth } from '@/lib/auth';

const api = axios.create({
  baseURL: '/api/v1', // 백엔드 기본 주소
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// 요청 인터셉터: 모든 요청에 자동으로 토큰 삽입
api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// [응답 인터셉터] 에러 발생 시 공통 처리 (예: 권한 만료)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth(); // 금고 비우기
      window.location.href = '/auth/sign-in'; // 로그인으로 튕기기
    }
    return Promise.reject(error);
  }
);

export default api;