# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

- 파일 작성을 할지는 나에게 물어보고 작업하도록해.
- 내가 요청할 때 파일을 작성해달라 할 땐 별도로 확인 하지 않고 바로 작성하면 돼.
- 기능별(함수라던가) component 별로는 무슨 역할을 하는지 기본 명세서는 달아줘.

## Commands

- `npm run dev` — 개발 서버 실행 (Vite, HMR)
- `npm run dev -- --host` — 개발 서버 실행 (Vite, HMR)
- `npm run build` — 프로덕션 빌드 (`dist/` 출력)
- `npm run lint` — ESLint 실행
- `npm run preview` — 빌드 결과 미리보기
- `npx tsc --noEmit` — TypeScript 타입 체크 (빌드 없이)

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (Vite 플러그인 방식, `@import "tailwindcss"` in index.css)
- JSX가 없는 파일은 `.ts`, JSX가 있으면 `.tsx`
- fetch 지양. axios 처리

## Architecture

Delphi WinForm ERP를 웹으로 전환하는 프로젝트. 현재는 프론트엔드 프로토타입 단계.

### Core Pattern: ResizableTable

`useResizableColumns` 커스텀 훅이 핵심 로직을 담당:
- 컬럼 너비 드래그 조정 + 컬럼 순서 드래그앤드롭 변경
- `localStorage`에 테이블별 설정 자동 저장/복구 (키: `erp_table_{tableId}`)
- `ColumnDef` 인터페이스로 컬럼 정의 — `render` 함수로 커스텀 셀 렌더링 지원

새 테이블 추가 시: `ColumnDef[]` 배열과 데이터만 정의하고 `ResizableTable`에 `tableId`를 다르게 넘기면 됨.

### Data Layer

현재 `src/data/`에 하드코딩된 샘플 데이터 사용. 향후 백엔드 API로 교체 예정.
데이터 파일에 `UserRow`, `KeywordRow` 등 행 타입 인터페이스가 함께 정의되어 있음.

## Conventions

- 한국어 UI (레이블, 메시지 등)
- Tailwind 유틸리티 클래스 사용, 별도 CSS 파일 지양
- 컴포넌트 내 인라인 스타일 대신 Tailwind 클래스 사용 권장

## UI/UX Principles (or Loading Strategy)

- **상태 변화 알림**: 모든 데이터 조회, 저장, 수정, 삭제 등 비동기 작업 시에는 반드시 로딩 상태(`isLoading`)를 관리하고 사용자에게 로딩 바(또는 스피너)를 노출해야 함.
- **로딩 컴포넌트**: 
  - 페이지 전체 로딩: `Skeleton` 또는 `Fullscreen Loader` 사용.
  - 버튼 내 작업: 버튼 내부 스피너 노출 및 `disabled` 처리.
  - 테이블 데이터 로딩: `ResizableTable` 내부에 스켈레톤 레이아웃 적용 권장.