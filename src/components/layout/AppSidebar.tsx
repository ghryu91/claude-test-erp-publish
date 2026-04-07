/**
 * AppSidebar - 좌측 네비게이션 사이드바
 *
 * 카테고리별 메뉴 그룹을 표시하며, 대메뉴 클릭 시 하위 메뉴가 펼쳐진다.
 * react-router-dom의 Link를 사용하여 페이지 전환 처리.
 */

import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  UsersIcon,
  SearchIcon,
  SettingsIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  BuildingIcon,
  TruckIcon,
  PackageIcon,
  ClipboardListIcon,
} from 'lucide-react';

/** 메뉴 항목 타입 정의 */
interface MenuItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: { title: string; url: string }[];
}

/** 메뉴 그룹 타입 정의 */
interface MenuGroup {
  label: string;
  items: MenuItem[];
}

/** 사이드바 메뉴 구조 — 카테고리 > 대메뉴 > 중메뉴 */
const MENU_GROUPS: MenuGroup[] = [
  {
    label: '기본 관리',
    items: [
      {
        title: '대시보드',
        url: '/',
        icon: LayoutDashboardIcon,
      },
      {
        title: '사용자 관리',
        icon: UsersIcon,
        children: [
          { title: '사용자 목록', url: '/users' },
          { title: '권한 관리', url: '/users/permissions' },
        ],
      },
      {
        title: '기본 검색어',
        url: '/keywords',
        icon: SearchIcon,
      },
    ],
  },
  {
    label: '영업 관리',
    items: [
      {
        title: '거래처 관리',
        icon: BuildingIcon,
        children: [
          { title: '거래처 목록', url: '/customers' },
          { title: '거래처 등록', url: '/customers/register' },
          { title: '계열사 관리', url: '/customers/affiliates' },
        ],
      },
      {
        title: '수주 관리',
        icon: ClipboardListIcon,
        children: [
          { title: '수주 등록', url: '/orders/new' },
          { title: '수주 현황', url: '/orders' },
        ],
      },
    ],
  },
  {
    label: '운송 관리',
    items: [
      {
        title: '배차 관리',
        icon: TruckIcon,
        children: [
          { title: '배차 등록', url: '/dispatch/new' },
          { title: '배차 현황', url: '/dispatch' },
        ],
      },
      {
        title: '출하 관리',
        icon: PackageIcon,
        children: [
          { title: '출하 등록', url: '/shipment/new' },
          { title: '출하 현황', url: '/shipment' },
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
      },
    ],
  },
];

export default function AppSidebar() {
  const location = useLocation();

  /** 현재 경로가 주어진 URL과 일치하는지 확인 */
  const isActive = (url: string) => location.pathname === url;

  /** 하위 메뉴 중 하나라도 현재 경로와 일치하면 true */
  const isGroupActive = (children?: { url: string }[]) =>
    children?.some((c) => isActive(c.url)) ?? false;

  return (
    <Sidebar>
      {/* 사이드바 상단 로고 영역 */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            E
          </div>
          <div>
            <div className="font-bold text-sm">ERP SYSTEM</div>
            <div className="text-[11px] text-muted-foreground">v1.0.0</div>
          </div>
        </div>
      </SidebarHeader>

      {/* 메뉴 본문 */}
      <SidebarContent>
        {MENU_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) =>
                  item.children ? (
                    /* 하위 메뉴가 있는 대메뉴 — Collapsible로 펼침/접힘 */
                    <Collapsible
                      key={item.title}
                      defaultOpen={isGroupActive(item.children)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          render={<SidebarMenuButton className="group/trigger" />}
                        >
                          {item.icon && <item.icon className="size-4" />}
                          <span>{item.title}</span>
                          <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[panel-open]/trigger:rotate-90" />
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.url}>
                                <SidebarMenuSubButton
                                  render={<Link to={child.url} />}
                                  isActive={isActive(child.url)}
                                >
                                  {child.title}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    /* 하위 메뉴 없는 단일 메뉴 항목 */
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link to={item.url!} />}
                        isActive={isActive(item.url!)}
                      >
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* 사이드바 하단 */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <div className="text-[11px] text-muted-foreground">
          © 2026 ERP SYSTEM
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
