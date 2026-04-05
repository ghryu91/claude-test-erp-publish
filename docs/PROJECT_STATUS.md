---
name: 프로젝트 현황
description: react-erp-sample 진행 상황 및 다음 할 일
type: project
---

ERP 샘플 프로젝트를 React + TypeScript + Tailwind CSS + Vite로 구성 중.

**Why:** 실무 ERP 시스템의 웹 전환을 위한 프로토타입. 컴포넌트 구조를 잡아두면 다른 프로젝트에도 재사용 가능.

**How to apply:** 새 기능 제안 시 기존 컴포넌트 재사용 방향으로 안내.

## 완료된 작업
- Vite + React + TypeScript + Tailwind CSS 프로젝트 세팅
- ResizableTable 컴포넌트 (컬럼 resize + drag reorder + localStorage 저장)
- JSX → TSX 전환, CSS → Tailwind CSS 전환
- resize 시 다른 컬럼 영향받는 버그 수정 (width: max-content)
- shadcn/ui 설치 (전체 컴포넌트 add --all, Radix UI 기반)
- 페이지 분리: App.tsx → pages/UserListPage.tsx, pages/KeywordPage.tsx
- UserListPage에 shadcn Button + Dialog 적용 (검색 팝업)
- 문서 파일 docs/ 폴더로 정리
- path alias 설정 (@/ → src/)

## 다음 할 일
- shadcn/ui 컴포넌트 학습 및 ERP 화면에 적용 확대
- Phase 1: Delphi 소스 분석 → API 명세 역추출
- Phase 2: 폴더 구조 재편(기능별) + 공통 UI 컴포넌트 제작
- 상세 순서는 프로젝트 루트 WORKFLOW.md 참고
- UI 공통 컴포넌트 제작: Button, Badge, SearchPanel 우선
- 이후: Modal, Confirm, Toast, Pagination
- 배포 방법 미결정 — 아직 경험 없음, 추후 논의 필요

## 파일 구조
```
src/
├── main.tsx
├── App.tsx                  ← 레이아웃(헤더/푸터) + 탭 전환
├── index.css                ← Tailwind @import + shadcn/ui CSS 변수
├── vite-env.d.ts
├── pages/
│   ├── UserListPage.tsx     ← 사용자 목록 (Button + Dialog 적용)
│   └── KeywordPage.tsx      ← 기본 검색어 관리
├── components/
│   ├── ui/                  ← shadcn/ui 컴포넌트들 (button, dialog 등)
│   └── ResizableTable.tsx
├── hooks/
│   ├── useResizableColumns.ts
│   └── use-mobile.ts        ← shadcn/ui 제공
├── lib/
│   └── utils.ts             ← cn() 클래스 조합 유틸리티
└── data/
    ├── userListData.tsx
    └── keywordData.tsx
docs/
├── PLAN.md
├── ISSUES.md
├── WORKFLOW.md
├── PROJECT_STATUS.md        ← 이 파일
└── DOCS_INDEX.md
```