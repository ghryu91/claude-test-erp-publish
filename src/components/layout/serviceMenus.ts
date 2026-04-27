/**
 * serviceMenus.ts — 서비스(프로젝트)별 사이드바 메뉴 정의
 *
 * 새 서비스 메뉴를 추가하려면 SERVICE_MENUS에 ServiceKey를 키로 하는
 * MenuGroup[] 항목을 추가하면 된다.
 */

import {
  UsersIcon,
  SearchIcon,
  SettingsIcon,
  LayoutDashboardIcon,
  BuildingIcon,
  TruckIcon,
  PackageIcon,
  ClipboardListIcon,
  ShieldIcon,
  BellIcon,
  CreditCardIcon,
  CalendarIcon,
  ReceiptIcon,
  HardHatIcon,
} from 'lucide-react';
import type { ServiceKey } from '@/lib/service';

/** 작업 진행 상태 */
export type WorkStatus = 'in-progress' | 'done' | 'todo';

/** 메뉴 항목 타입 정의 */
export interface MenuItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  status?: WorkStatus;
  children?: { title: string; url: string; status?: WorkStatus }[];
}

/** 메뉴 그룹 타입 정의 */
export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

/** 서비스별 사이드바 메뉴 — 키는 ServiceKey */
export const SERVICE_MENUS: Record<ServiceKey, MenuGroup[]> = {
  /* ───────── ERP Master — 통합 관리 ───────── */
  master: [
    {
      label: '기본 관리',
      items: [
        {
          title: '대시보드',
          url: '/',
          icon: LayoutDashboardIcon,
          status: 'todo',
        },
      ]
    },
    {
      label: '업체 관리',
      items: [
        {
          title: '거래처 관리',
          icon: BuildingIcon,
          children: [
            // { title: '거래처 목록(테스트)', url: '/master/customers', status: 'in-progress' },
            { title: '거래처 목록', url: '/master/customers/register', status: 'in-progress' },
            { title: '거래처 목록', url: '/master/customers/admin', status: 'in-progress' },
            { title: '계열사 관리', url: '/master/customers/affiliates', status: 'todo' },
          ],
        },
      ]
    },
    {
      label: '계정 관리',
      items: [
        {
          title: '서비스별 접속 권한',
          url: '/master/permissions',
          icon: ShieldIcon,
          status: 'todo',
        },
        {
          title: '사용자 관리',
          icon: UsersIcon,
          children: [
            { title: '업체별 사용자 목록', url: '/master/users', status: 'done' },
            { title: '사용자 검색', url: '/master/users/search', status: 'in-progress' },
            { title: '권한 관리', url: '/master/users/permissions', status: 'todo' },
            { title: '로그인(템플릿)', url: '/templates/sign-in', status: 'in-progress' },
          ],
        },
      ],
    },
    {
      label: '서비스 운영',
      items: [
        {
          title: '서비스 구독 관리',
          url: '/master/subscriptions',
          icon: CreditCardIcon,
          status: 'todo',
        },
        {
          title: '서비스별 공지처리',
          url: '/master/notices',
          icon: BellIcon,
          status: 'todo',
        },
      ],
    },
    {
      label: '시스템',
      items: [
        {
          title: '설정',
          url: '/settings',
          icon: SettingsIcon,
          status: 'todo',
        },
        {
          title: '원격 DB 쿼리',
          url: '/dev/remote-db',
          icon: SettingsIcon,
          status: 'in-progress',
        },
      ],
    },
  ],

  /* ───────── ERP — HR/회계 등 ───────── */
  erp: [
    {
      label: '기본 관리',
      items: [
        {
          title: '대시보드',
          url: '/',
          icon: LayoutDashboardIcon,
          status: 'todo',
        },
        {
          title: '기본 검색어(테스트)',
          url: '/keywords',
          icon: SearchIcon,
          status: 'todo',
        },
      ],
    },
    {
      label: '인사 관리',
      items: [
        {
          title: '직급 관리',
          url: '/erp/hr/positions',
          icon: ShieldIcon,
          status: 'todo',
        },
        {
          title: '사원 정보',
          url: '/erp/hr/employees',
          icon: UsersIcon,
          status: 'todo',
        },
        {
          title: '연차 관리',
          url: '/erp/hr/leaves',
          icon: CalendarIcon,
          status: 'todo',
        },
      ],
    },
    {
      label: '회계',
      items: [
        {
          title: '영수증 처리',
          url: '/erp/accounting/receipts',
          icon: ReceiptIcon,
          status: 'in-progress',
        },
      ],
    },
    {
      label: '영업 관리',
      items: [
        {
          title: '수주 관리',
          icon: ClipboardListIcon,
          children: [
            { title: '수주 등록', url: '/orders/new', status: 'todo' },
            { title: '수주 현황', url: '/orders', status: 'todo' },
          ],
        },
      ],
    },
    {
      label: '시스템',
      items: [
        {
          title: '설정',
          url: '/settings',
          icon: SettingsIcon,
          status: 'todo',
        },
        {
          title: '원격 DB 쿼리',
          url: '/dev/remote-db',
          icon: SettingsIcon,
          status: 'in-progress',
        },
      ],
    },
  ],

  /* ───────── Remicon — 레미콘 ───────── */
  remicon: [
    {
      label: '레미콘 운영',
      items: [
        {
          title: '대시보드',
          url: '/remicon',
          icon: LayoutDashboardIcon,
          status: 'todo',
        },
        {
          title: '배차 관리',
          icon: TruckIcon,
          children: [
            { title: '배차 등록', url: '/remicon/dispatch/new', status: 'todo' },
            { title: '배차 현황', url: '/remicon/dispatch', status: 'todo' },
          ],
        },
        {
          title: '출하 관리',
          icon: PackageIcon,
          children: [
            { title: '출하 등록', url: '/remicon/shipment/new', status: 'todo' },
            { title: '출하 현황', url: '/remicon/shipment', status: 'todo' },
          ],
        },
      ],
    },
  ],

  /* ───────── Ascon — 아스콘 ───────── */
  ascon: [
    {
      label: '아스콘 운영',
      items: [
        {
          title: '대시보드',
          url: '/ascon',
          icon: LayoutDashboardIcon,
          status: 'todo',
        },
        {
          title: '생산 관리',
          url: '/ascon/production',
          icon: HardHatIcon,
          status: 'todo',
        },
        {
          title: '출하 관리',
          url: '/ascon/shipment',
          icon: PackageIcon,
          status: 'todo',
        },
      ],
    },
  ],
};
