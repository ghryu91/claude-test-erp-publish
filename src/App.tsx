/**
 * App - 루트 컴포넌트
 *
 * react-router-dom으로 페이지 라우팅을 구성한다.
 * AppLayout이 사이드바 + 콘텐츠 영역을 감싸고,
 * 각 Route가 콘텐츠 영역에 렌더링된다.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import UserListPage from '@/pages/UserListPage';
import KeywordPage from '@/pages/KeywordPage';
import CustomerPage from '@/pages/CustomerPage';
import CustomerRegisterPage from '@/pages/CustomerRegisterPage';
import RemoteDbQueryPage from '@/pages/RemoteDbQueryPage';
import UserSearchPage from '@/pages/UserSearchPage';
import SignInPage from '@/pages/SignInPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 공개 라우트 — 로그인 */}
          <Route path="/auth/sign-in" element={<SignInPage />} />

          {/* 인증 필요 라우트 */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<UserListPage />} />
              <Route path="/users" element={<UserListPage />} />
              <Route path="/users/search" element={<UserSearchPage />} />
              <Route path="/keywords" element={<KeywordPage />} />
              <Route path="/customers" element={<CustomerPage />} />
              <Route path="/customers/register" element={<CustomerRegisterPage />} />
              <Route path="/dev/remote-db" element={<RemoteDbQueryPage />} />
              {/* 템플릿 프리뷰용 — 사이드바에서 로그인 화면 UI만 확인 */}
              <Route path="/templates/sign-in" element={<SignInPage />} />
              {/* 아직 구현되지 않은 페이지들은 추후 추가 */}
              <Route path="*" element={<PlaceholderPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

/** 아직 구현되지 않은 페이지용 임시 컴포넌트 */
function PlaceholderPage() {
  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      준비 중인 페이지입니다.
    </div>
  );
}
