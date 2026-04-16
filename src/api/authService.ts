/**
 * authService.ts — 인증 API 함수
 *
 * axiosInstance를 통해 서버와 통신. 토큰/캐시 저장은 lib/auth.ts 유틸 사용.
 * - login: 로그인 → 토큰/캐시 저장
 * - fetchMe: 토큰 유효성 검증 + 사용자 정보 갱신
 * - logout: 토큰/캐시 삭제 + 로그인 페이지 이동
 */
import api from './axiosInstance';
import { setToken, setCachedUser, clearAuth } from '@/lib/auth';
import type { LoginRequest, LoginResponse, AuthUser } from '@/types/auth';


// export const login = async (req: LoginRequest) => {
//   // 1. 코드가 훨씬 간결해짐 (JSON 변환, 에러 체크 등을 api 인스턴스가 대신 함)
//   const { data } = await api.post('/auth/login', req);
//   setToken(data.access_token);
//   setCachedUser(data); // 필요한 정보만 추출해서 저장
//   return data;
// };

/**
 * 로그인 API 호출
 * @returns LoginResponse 성공 시
 * @throws AxiosError 실패 시 (인터셉터가 401 처리)
 */
export async function login(req: LoginRequest): Promise<LoginResponse> {
  // 1. 코드가 훨씬 간결해짐 (JSON 변환, 에러 체크 등을 api 인스턴스가 대신 함)
  const { data } = await api.post<LoginResponse>('/auth/login', req);

  // 2. 공통 처리는 인스턴스에서 하므로, 여기선 '로그인 전용' 로직만 수행
  setToken(data.access_token);
  setCachedUser({
    user_id: data.user_id,
    login_id: data.login_id,
    user_name: data.user_name,
    company_id: data.company_id,
    company_name: data.company_name,
    authority_group_id: data.authority_group_id,
  });

  return data;
}

/**
 * 내 정보 조회 API — 토큰 유효성 검증 + 사용자 정보 갱신
 * @returns AuthUser 성공 시
 * @throws AxiosError 401 시 인터셉터가 자동 로그아웃 처리
 */
export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  setCachedUser(data);
  return data;
}

/**
 * 로그아웃 — 토큰/캐시 삭제 후 로그인 페이지로 이동
 * (서버 측 로그아웃 API 없음 — JWT 특성)
 */
export function logout() {
  // 토큰/캐시 삭제 후 로그인 페이지로 이동
//   localStorage.removeItem('token');
//   localStorage.removeItem('cachedUser');
  clearAuth();
  window.location.href = '/auth/sign-in';
}