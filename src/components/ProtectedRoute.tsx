/**
 * ProtectedRoute — 인증 필요 라우트 가드
 *
 * 미인증 상태면 /auth/sign-in으로 리다이렉트한다.
 * 초기 토큰 검증 중에는 로딩 스피너를 표시한다.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export default function ProtectedRoute() {
  const { user, initializing } = useAuth();

  // 개발용 인증 바이패스 — .env.local에 VITE_SKIP_AUTH=true 설정 시 동작 (개발모드 한정)
  if (import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true') {
    return <Outlet />;
  }
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8 text-blue-600" />
          <span className="text-sm text-gray-500">인증 확인 중...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <Outlet />;
}
