/**
 * service.ts — 서비스(프로젝트) 식별 및 URL 생성 로직
 *
 * 현재는 path 기반(`/master`, `/erp`, `/remicon`, `/ascon`)으로 동작하며,
 * 추후 서브도메인 기반(`erp.gimaek.kr/{회사}`)으로 전환 시
 * `getCurrentService` / `getServiceUrl` 두 함수만 수정하면 됨.
 */

import {
  ShieldIcon,
  BuildingIcon,
  TruckIcon,
  HardHatIcon,
  type LucideIcon,
} from 'lucide-react';

/** 서비스 키 — URL 경로 식별자로도 사용 */
export type ServiceKey = 'master' | 'erp' | 'remicon' | 'ascon';

export interface ServiceDef {
  key: ServiceKey;
  name: string;
  description: string;
  icon: LucideIcon;
}

/** 전체 서비스 목록 — 사이드바 스위처에 표시되는 순서대로 */
export const SERVICES: ServiceDef[] = [
  { key: 'master', name: 'ERP Master', description: '통합 관리', icon: ShieldIcon },
  { key: 'erp', name: 'ERP', description: '인사/회계', icon: BuildingIcon },
  { key: 'remicon', name: 'Remicon', description: '레미콘', icon: TruckIcon },
  { key: 'ascon', name: 'Ascon', description: '아스콘', icon: HardHatIcon },
];

/** 기본 서비스 — 어디에도 매칭되지 않을 때 */
const DEFAULT_SERVICE: ServiceKey = 'master';

/**
 * 현재 활성 서비스 식별
 *
 * 지금: pathname의 첫 세그먼트로 판단 (`/master/...` → `master`)
 * 나중: hostname의 서브도메인으로 판단 (`erp.gimaek.kr` → `erp`)
 */
export function getCurrentService(pathname: string): ServiceKey {
  const seg = pathname.split('/')[1] as ServiceKey | undefined;
  if (seg && SERVICES.some((s) => s.key === seg)) return seg;
  return DEFAULT_SERVICE;
}

/**
 * 서비스 진입 URL 생성
 *
 * 지금: `/${key}` (단일 도메인 + path prefix)
 * 나중: `https://${key}.gimaek.kr/${company}` (서브도메인 + 회사 path)
 */
export function getServiceUrl(key: ServiceKey): string {
  return `/${key}`;
}
