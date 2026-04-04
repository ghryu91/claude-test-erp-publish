---
name: 프로젝트 현황
description: react-erp-sample 진행 상황 및 다음 할 일
type: project
---

ERP 샘플 프로젝트를 React + TypeScript + Tailwind CSS + Vite로 구성 중.

**Why:** 실무 ERP 시스템의 웹 전환을 위한 프로토타입. 컴포넌트 구조를 잡아두면 다른 프로젝트에도 재사용 가능.

**How to apply:** 새 기능 제안 시 기존 컴포넌트 재사용 방향으로 안내.

## 완료된 작업
- Vite + React + TypeScript 프로젝트 세팅
- ResizableTable 컴포넌트 (컬럼 resize + drag reorder + localStorage 저장)
- 두 개 탭 화면: 사용자 목록 / 기본 검색어 관리
- JSX → TSX 전환
- CSS → Tailwind CSS 전환
- resize 시 다른 컬럼 영향받는 버그 수정 (width: max-content)

## 다음 할 일
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
├── App.tsx
├── index.css              (Tailwind @import)
├── vite-env.d.ts
├── hooks/
│   └── useResizableColumns.ts
├── components/
│   └── ResizableTable.tsx
└── data/
    ├── userListData.tsx
    └── keywordData.tsx
```
