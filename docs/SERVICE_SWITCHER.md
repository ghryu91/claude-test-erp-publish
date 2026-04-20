# SERVICE_SWITCHER.md

사이드바 상단의 **서비스(프로젝트) 전환** 기능 설계 메모.

---

## 1. 배경

하나의 프론트엔드 코드베이스로 여러 서비스를 호스팅한다.

| 키 | 이름 | 설명 |
|----|------|------|
| `master` | ERP Master | 통합 관리(아이디/권한/구독/공지) |
| `erp` | ERP | 인사·회계·영업 (직급/사원/영수증/연차 등) |
| `remicon` | Remicon | 레미콘 서비스 |
| `ascon` | Ascon | 아스콘 서비스 |

로그인 세션은 4개 서비스가 **공유**한다. 사용자는 사이드바 상단 드롭다운으로 자유롭게 전환한다.

---

## 2. 현재 구현 (Phase 1 — path 기반)

단일 도메인 + URL prefix로 서비스를 구분한다.

- `/master`, `/master/...` → ERP Master
- `/erp`, `/erp/...` → ERP (단, 기존 `/users`, `/customers` 등 prefix 없는 경로도 잠정적으로 ERP에 속함)
- `/remicon`, `/remicon/...` → Remicon
- `/ascon`, `/ascon/...` → Ascon

서비스 전환은 `react-router`의 `navigate(getServiceUrl(key))`로 처리.

### 핵심 파일

| 파일 | 역할 |
|------|------|
| [src/lib/service.ts](../src/lib/service.ts) | 서비스 레지스트리 + `getCurrentService` / `getServiceUrl` |
| [src/components/layout/serviceMenus.ts](../src/components/layout/serviceMenus.ts) | 서비스별 `MENU_GROUPS` 정의 |
| [src/components/layout/ServiceSwitcher.tsx](../src/components/layout/ServiceSwitcher.tsx) | 사이드바 상단 드롭다운 UI |
| [src/components/layout/AppSidebar.tsx](../src/components/layout/AppSidebar.tsx) | 현재 서비스 식별 → 해당 메뉴 렌더링 |

---

## 3. 향후 계획 (Phase 2 — 서브도메인 기반)

각 서비스를 독립 서브도메인으로 분리하고, 회사를 path로 받는다.

```
https://master.gimaek.kr/{회사}
https://erp.gimaek.kr/{회사}
https://remicon.gimaek.kr/{회사}
https://ascon.gimaek.kr/{회사}
```

### 마이그레이션 영향 범위

수정해야 할 파일은 **`src/lib/service.ts` 하나**가 핵심이다.

```ts
// getCurrentService: pathname → hostname 기반 판별
export function getCurrentService(): ServiceKey {
  const sub = window.location.hostname.split('.')[0] as ServiceKey;
  if (SERVICES.some((s) => s.key === sub)) return sub;
  return DEFAULT_SERVICE;
}

// getServiceUrl: 도메인 이동 (회사 코드 포함)
export function getServiceUrl(key: ServiceKey, company: string): string {
  return `https://${key}.gimaek.kr/${company}`;
}
```

추가로 손볼 부분:

1. `ServiceSwitcher.tsx` — `navigate()` 대신 `window.location.href = url`
2. 라우트 정의 — `/master`, `/erp` prefix 제거하고 각 서비스가 자기 도메인의 root에서 라우팅
3. 인증 — 세션 공유를 위해 JWT를 `domain=.gimaek.kr` 쿠키로 전환 (현재 localStorage라면 SSO 흐름 필요)

각 컴포넌트가 path를 직접 하드코딩하지 않고 `getServiceUrl`을 거치도록 유지하면 큰 부담 없이 전환 가능.

---

## 4. 새 서비스/메뉴 추가 절차

1. `src/lib/service.ts`의 `ServiceKey`와 `SERVICES` 배열에 항목 추가
2. `src/components/layout/serviceMenus.ts`의 `SERVICE_MENUS`에 메뉴 그룹 정의
3. (Phase 1) `App.tsx`에 `/{key}/*` 라우트 추가
