/**
 * AuthContext — 전역 인증 상태 관리
 *
 * AuthProvider가 앱 최상단을 감싸며, 하위 컴포넌트에서
 * useAuth() 훅으로 인증 상태/사용자 정보/로그인/로그아웃에 접근 가능.
 *
 * - 마운트 시 토큰이 있으면 /auth/me로 유효성 검증
 * - 로그인 성공 시 user 상태 갱신 + 메인 페이지 이동
 * - 401 응답 시 자동 로그아웃
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser, LoginRequest } from '@/types/auth';
import { isAuthenticated, getCachedUser, clearAuth } from '@/lib/auth';
import { login as apiLogin, fetchMe, logout as authLogout } from '@/api/authService';

interface AuthContextValue {
  /** 현재 로그인된 사용자 (null이면 미인증) */
  user: AuthUser | null;
  /** 초기 토큰 검증 중 여부 */
  initializing: boolean;
  /** 로그인 처리 */
  login: (req: LoginRequest) => Promise<void>;
  /** 로그아웃 처리 */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** AuthProvider — App 최상단에서 인증 상태를 관리하는 Provider */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getCachedUser());
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();

  // 마운트 시: 토큰 유효성 검증
  useEffect(() => {
    if (!isAuthenticated()) {
      setUser(null);
      setInitializing(false);
      return;
    }
    fetchMe()
      .then((me) => setUser(me))
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  /** 로그인 — API 호출 + 상태 갱신 + 메인 페이지 이동 */
  const handleLogin = useCallback(
    async (req: LoginRequest) => {
      const res = await apiLogin(req);
      setUser({
        user_id: res.user_id,
        login_id: res.login_id,
        user_name: res.user_name,
        company_id: res.company_id,
        company_name: res.company_name,
        authority_group_id: res.authority_group_id,
      });
      navigate('/', { replace: true });
    },
    [navigate],
  );

  /** 로그아웃 — 토큰 삭제 + 상태 초기화 */
  const handleLogout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, login: handleLogin, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — 인증 상태에 접근하는 훅
 * 반드시 AuthProvider 하위에서 사용해야 한다.
 */
export function useAuth(): AuthContextValue {
  // console.log('context/AuthContext - useAuth 호출');
  // console.log(AuthContext);
  // console.log('useAuth 호출 - 현재 사용자:', getCachedUser());
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 하위에서 사용해야 합니다');
  return ctx;
}
