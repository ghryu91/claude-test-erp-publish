/**
 * auth.ts — 인증 유틸리티 (localStorage 토큰/캐시 관리)
 *
 * 순수 저장소 관리만 담당. API 호출은 api/authService.ts에서 처리.
 * - 토큰은 localStorage에 저장 (8시간 만료, 서버 측 설정)
 * - axiosInstance 인터셉터가 토큰 주입 + 401 처리를 담당
 */
import type { AuthUser } from '@/types/auth';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

// ─── 토큰 관리 ───

/** 저장된 액세스 토큰 조회 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** 액세스 토큰 저장 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** 토큰 + 사용자 정보 삭제 (로그아웃) */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** 인증 여부 확인 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

// ─── 사용자 정보 캐시 ───

/** localStorage에 캐시된 사용자 정보 조회 */
export function getCachedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** 사용자 정보 캐시 저장 */
export function setCachedUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
