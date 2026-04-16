# WORKFLOW.md

프로젝트 진행 순서 및 작업 방법 정리.

---

## 진행 순서

### Phase 1: API 설계 (프론트/백엔드 공통 계약서)

프론트와 백엔드를 독립적으로 개발하려면 API 명세가 먼저 있어야 함.

- Delphi 소스(.pas/.dfm)를 분석해서 API 명세 역추출
  - 어떤 테이블/컬럼을 쓰는지
  - 어떤 동작(조회/저장/삭제)이 있는지
  - 화면별 필요한 데이터 구조 정리
- 결과물: 화면별 API 명세 (엔드포인트, 요청/응답 타입)

### Phase 2: 프론트엔드 — 폴더 구조 + 공통 컴포넌트

- 기능별 폴더 구조 수립
  ```
  src/
  ├── features/          ← 화면/기능별
  │   ├── sales/
  │   │   ├── SalesTable.tsx
  │   │   ├── columns.ts
  │   │   └── overrides/    ← 업체별 차이점
  │   ├── shipping/
  │   └── users/
  ├── components/ui/     ← 공통 부품 (shadcn/ui)
  ├── hooks/             ← 공통 훅
  ├── config/            ← Feature Flag, 업체별 설정
  └── lib/               ← 유틸리티
  ```
- shadcn/ui 컴포넌트 활용 + ERP에 맞게 커스터마이징
- 공통 UI 컴포넌트 제작: Button → Badge → SearchPanel → Modal 순
- 작업 방식: 하나 만들어서 보여주고 → 같은 패턴으로 직접 만들어보기

### Phase 3: 프론트엔드 — 화면 개발

- Phase 1에서 정의한 API 명세 기반으로 mock data 생성
- 화면별 개발 (기존 Delphi 화면 기준)
- 업체별 커스터마이징은 overrides/ 폴더로 관리

### Phase 4: 백엔드 — API 구현 (별도 프로젝트)

- 기술 스택 결정 (C# .NET Web API 유력)
- Phase 1 API 명세 기반으로 실제 구현
- DB 연결 + 스키마 매핑

### Phase 5: 합치기

- 프론트의 mock data → 실제 API로 교체
- 통합 테스트

---

## 현재 진행 상황

- [x] Vite + React + TypeScript + Tailwind 프로젝트 세팅
- [x] ResizableTable 컴포넌트 (resize + reorder + localStorage 저장)
- [x] 샘플 화면 2개 (사용자 목록, 검색어 관리)
- [x] shadcn/ui 설치 + Button, Dialog 적용
- [x] 페이지 분리 (pages/ 폴더)
- [x] JWT 인증 시스템 (AuthContext + ProtectedRoute + axios 인터셉터)
- [x] 로그인 페이지 UI + 템플릿 프리뷰 라우트 (/templates/sign-in)
- [x] 사용자 검색 페이지 (GET /users/search, 검색 구분 드롭다운 + 페이징)
- [x] Pagination 공용 컴포넌트 추출
- [x] ResizableTable 엑셀 다운로드 prop (데이터 존재 시에만 노출)
- [x] 엑셀 다운로드 — CSV 응답을 SheetJS로 xlsx 변환 저장
- [ ] shadcn/ui 컴포넌트 학습 및 추가 적용
- [ ] **다음: Phase 1 — Delphi 소스 분석 → API 설계**
- [ ] 폴더 구조 재편 (기능별)
- [ ] 공통 UI 컴포넌트 제작

---

## 커밋 이력 메모

### 2026-04-16 — 인증/사용자 검색/페이징 (`54c75ee` 이후)

`feat: JWT 인증 + 사용자 검색 페이지 + 공용 Pagination 컴포넌트`

- 인증: AuthContext/ProtectedRoute + axios 인스턴스(토큰 자동 주입/401 리다이렉트)
- 로그인 페이지 UI + `/templates/sign-in` 프리뷰 라우트 (사이드바에서 템플릿 확인용)
- 사용자 검색 페이지(GET /users/search) — 검색 구분 드롭다운, 페이징, 상/하단 배치
- Pagination 컴포넌트 추출 — 검색/목록 페이지 재사용
- ResizableTable 엑셀 다운로드 prop 추가 (데이터 있을 때만 노출)
- 엑셀 다운로드: CSV 응답을 xlsx(SheetJS)로 변환 저장
- `.continue/` gitignore 추가, `docs/AUTH_API.md` 신규

---

## 문서 역할 구분

| 파일 | 역할 |
|------|------|
| CLAUDE.md | 기술 스택, 빌드 명령어, 코딩 규칙 (프로젝트 루트) |
| docs/PLAN.md | 설계 방향, 아키텍처 고려사항 |
| docs/ISSUES.md | 리스크, 주의할 이슈 |
| docs/WORKFLOW.md | 진행 순서, 현재 상태 (이 파일) |
| docs/PROJECT_STATUS.md | 완료된 작업, 파일 구조 |
| docs/DOCS_INDEX.md | 문서 안내 |