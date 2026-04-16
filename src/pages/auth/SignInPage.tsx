/**
 * SignInPage — 로그인 페이지
 *
 * 화면 중앙에 로그인 카드를 배치하는 독립 페이지.
 * - 상단: 로고 + 시스템명
 * - 카드: 이메일/비밀번호 입력 + 로그인 버튼
 * - 하단: 저작권 표시
 */

import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 템플릿 프리뷰 모드 — 사이드바에서 UI만 확인하는 용도 (리다이렉트/제출 무효화)
  const isPreview = location.pathname.startsWith('/templates/');

  // 이미 로그인 상태면 메인으로 리다이렉트 (프리뷰 모드 제외)
  if (user && !isPreview) return <Navigate to="/" replace />;

  /** 로그인 API 호출 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return; // 프리뷰 모드에서는 실제 로그인 호출 금지
    if (!loginId.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login({ login_id: loginId.trim(), password });
    } catch (error: unknown) {
      // axios 에러: error.response.data.detail에 서버 메시지가 들어옴
      const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
      setError(axiosError.response?.data?.detail || axiosError.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-[420px] px-4">
        {/* 로고 영역 */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-lg">
            G
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GIMAEK ERP</h1>
          <p className="text-sm text-gray-500 mt-1">업무 관리 시스템</p>
        </div>

        {/* 로그인 카드 */}
        <Card className="shadow-lg border-0">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">로그인</CardTitle>
              <CardDescription>계정 정보를 입력하여 로그인하세요.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="loginId">아이디</Label>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Spinner className="size-4" />}
                {loading ? '로그인 중...' : '로그인'}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                비밀번호를 잊으셨나요? 관리자에게 문의하세요.
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* 하단 저작권 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 GIMAEK ERP. All rights reserved.
        </p>
      </div>
    </div>
  );
}