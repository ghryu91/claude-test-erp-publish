# IMPROVEMENTS.md

프로젝트 전반의 개선 포인트 정리. 우선순위별로 분류.

---

## 🔴 시급 (단기)

### 1. API 호출 일원화 (fetch → axios)
- 일부 페이지(`CustomerRegisterPage`, `UserPage` 등)는 `fetch()`를 직접 사용
- `src/api/axiosInstance.ts`가 이미 존재 — 토큰 자동 주입 + 401 처리 포함
- 모든 API 호출을 axios 인스턴스로 통일해야 함
- 상태: 진행 중 (CustomerRegisterPage부터 전환)

### 2. 타입 단언 `toRecord` 반복
- 각 페이지마다 `arr as unknown as Record<string, unknown>[]` 헬퍼 중복 정의
- `ResizableTable`의 제네릭을 개선하거나 공통 유틸로 추출
- 상태: 미착수

### 3. .env.local 커밋 방지 확인
- 개발용 `VITE_SKIP_AUTH=true`가 실수로 커밋되지 않도록 `.gitignore` 확인
- 상태: 미확인

---

## 🟡 중간 (중기)

### 4. 색상 토큰 미사용
- `blue-500`, `emerald-500` 등 Tailwind 원색이 페이지마다 하드코딩
- shadcn CSS 변수(`--primary`, `--accent` 등)로 통일해 테마/브랜드 변경 용이하게
- 상태: 미착수

### 5. 데이터 페칭 훅 부재
- `useEffect + useState(loading/error)` 패턴이 페이지마다 중복
- TanStack Query(react-query) 도입 검토
- 상태: 미착수

### 6. Field 컴포넌트 지역 선언
- `CustomerRegisterPage` 내부 `Field`는 재사용 가치 높음
- `src/components/form/Field.tsx`로 승격 필요
- 상태: 미착수

### 7. Dialog 내부 input 스타일 복붙
- 동일 className이 10+ 회 반복 (`px-3 py-2 text-sm border ...`)
- `<FormInput />` 등 래퍼 컴포넌트화
- 상태: 미착수

---

## 🟢 구조/장기

### 8. 개발용 임시 UI 정리
- `layoutMode` 토글(2열/12열/8-4) 같은 디자인 비교 UI가 production에 노출
- 개발 모드 한정 표시 또는 결정 후 제거
- 상태: 미착수

### 9. 일관된 페이징 전략
- 클라이언트/서버 페이징이 혼재
- ISSUES.md 7번(MS SQL 2000 호환성)과 연계 필요
- 화면별 기준 문서화 권장
- 상태: 미착수

### 10. 에러 UX 통일
- 현재는 페이지마다 `setError(msg)` → 인라인 텍스트로 표시
- Toast(sonner) + 에러 바운더리로 표준화
- 상태: 미착수

### 11. snake_case 도메인 용어 프론트 노출
- Delphi 시절의 `cust_code`, `company_name` 등이 React 코드 전반에 그대로 사용
- 프론트는 camelCase로 매핑하는 어댑터 레이어(mapper) 일관 적용
- 상태: 부분 적용 (`mapApiUserToRow` 정도만 존재)

### 12. 테스트 0
- 최소 유닛 테스트 대상:
  - `useResizableColumns` (컬럼 리사이즈/순서 로직)
  - `ResizableTable` (렌더링/localStorage)
  - `PaginationLinks`의 `getPageNumbers` (말줄임 로직)
  - API mapper 함수들
- 상태: 미착수

### 13. UI 패턴 가이드 문서 부재
- `AUTH_API.md`, `PLAN.md` 등은 잘 정리됨
- 반면 폼/테이블/페이징/색상 등 UI 규칙 문서 없음
- 팀 확장 시 필요
- 상태: 미착수
