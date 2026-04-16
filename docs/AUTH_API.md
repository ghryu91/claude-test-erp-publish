# 인증 API 명세

## 개요

JWT 기반 인증. 토큰 만료 시간 8시간, Bearer 토큰 방식.

| 항목 | 값 |
|------|-----|
| 토큰 만료 시간 | 8시간 |
| 토큰 타입 | Bearer (JWT) |
| Base URL (개발) | `http://localhost:8000` |
| Swagger 문서 | `http://localhost:8000/docs` |

---

## 1. 로그인

```
POST /api/v1/auth/login
Content-Type: application/json
```

### Request Body

```json
{
  "login_id": "admin",
  "password": "admin1234"
}
```

### Response — 200 성공

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "login_id": "admin",
  "user_name": "관리자",
  "company_id": 1,
  "company_name": "(주)동원레미콘",
  "authority_group_id": 1
}
```

### Response — 401 실패

```json
{
  "detail": "아이디 또는 비밀번호가 일치하지 않습니다"
}
```

### Response — 401 비활성 계정

```json
{
  "detail": "비활성화된 계정입니다. 관리자에게 문의해주세요"
}
```

---

## 2. 내 정보 조회

```
GET /api/v1/auth/me
Authorization: Bearer {access_token}
```

### Response — 200

```json
{
  "user_id": 1,
  "login_id": "admin",
  "user_name": "관리자",
  "email_address": "admin@example.com",
  "company_id": 1,
  "company_name": "(주)동원레미콘",
  "authority_group_id": 1,
  "authority_group_name": "최고관리자",
  "last_login_at": "2026-04-11T09:30:00+09:00"
}
```

### Response — 401 토큰 만료/무효

```json
{
  "detail": "유효하지 않은 인증 토큰입니다"
}
```

---

## 3. 프론트엔드 구현 가이드

### 토큰 저장

```ts
localStorage.setItem("access_token", data.access_token)
```

### 인증이 필요한 API 호출

```ts
// authFetch 래퍼 사용 (src/lib/auth.ts)
import { authFetch } from '@/lib/auth';

const res = await authFetch("/api/v1/some-protected-endpoint");

// 또는 직접 헤더 주입
fetch("/api/v1/some-protected-endpoint", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
  }
});
```

### 401 응답 처리

- `authFetch` 사용 시: **자동으로** 토큰 삭제 + 로그인 페이지 리다이렉트
- 직접 fetch 사용 시: 수동으로 처리 필요

### 로그아웃

- 서버 측 로그아웃 API 없음 (JWT 특성상 서버에서 무효화 불가)
- 프론트에서 `localStorage` 토큰/사용자 정보 삭제 후 로그인 페이지로 이동
- `useAuth().logout()` 또는 `logout()` (from `src/lib/auth.ts`)

---

## 4. 프론트엔드 인증 흐름

```
[앱 시작]
  │
  ├─ localStorage에 access_token 있음?
  │    ├─ YES → GET /api/v1/auth/me 호출
  │    │         ├─ 200 OK → 메인 페이지 진입 (user 상태 갱신)
  │    │         └─ 401    → 토큰 삭제 → 로그인 페이지 리다이렉트
  │    └─ NO  → 로그인 페이지 리다이렉트
  │
[로그인 페이지]
  │
  └─ POST /api/v1/auth/login
       ├─ 200 → access_token 저장 + user 상태 갱신 + 메인 페이지 이동
       └─ 401 → 에러 메시지 표시 ("아이디 또는 비밀번호가 일치하지 않습니다")

[인증된 API 호출] (authFetch 사용)
  │
  └─ 401 응답 시 → 토큰 삭제 → 로그인 페이지 자동 리다이렉트
```

---

## 5. 관련 파일

| 파일 | 역할 |
|------|------|
| `src/lib/auth.ts` | 토큰 관리, API 호출 함수, `authFetch` 래퍼 |
| `src/contexts/AuthContext.tsx` | 전역 인증 상태 (AuthProvider, useAuth) |
| `src/components/ProtectedRoute.tsx` | 미인증 시 로그인 페이지 리다이렉트 |
| `src/pages/SignInPage.tsx` | 로그인 페이지 UI |
