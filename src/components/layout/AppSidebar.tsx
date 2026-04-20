/**
 * AppSidebar - 좌측 네비게이션 사이드바
 *
 * 상단 ServiceSwitcher로 현재 서비스(master/erp/remicon/ascon)를 표시·전환하고,
 * 본문에는 해당 서비스의 MENU_GROUPS를 표시한다.
 * react-router-dom의 Link로 페이지 전환 처리.
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
import { ChevronRightIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentService } from '@/lib/service';
import { SERVICE_MENUS, type WorkStatus } from './serviceMenus';
import ServiceSwitcher from './ServiceSwitcher';

/** 상태 뱃지 — [작업중]/[완료]/[미작업] */
function StatusBadge({ status }: { status?: WorkStatus }) {
  if (!status) return null;
  const map: Record<WorkStatus, { label: string; cls: string }> = {
    'in-progress': { label: '작업중', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    done: { label: '완료', cls: 'bg-green-100 text-green-700 border-green-200' },
    todo: { label: '미작업', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`ml-1 px-1.5 py-0 text-[9px] leading-[14px] rounded border ${cls}`}>
      {label}
    </span>
  );
}

export default function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  /** 현재 활성 서비스 — pathname 기반 (추후 hostname 기반으로 교체 가능) */
  const currentService = getCurrentService(location.pathname);
  const menuGroups = SERVICE_MENUS[currentService];

  /** 현재 경로가 주어진 URL과 일치하는지 확인 */
  const isActive = (url: string) => location.pathname === url;

  /** 하위 메뉴 중 하나라도 현재 경로와 일치하면 true */
  const isGroupActive = (children?: { url: string }[]) =>
    children?.some((c) => isActive(c.url)) ?? false;

  return (
    <Sidebar>
      {/* 사이드바 상단 — 서비스 전환 스위처 */}
      <SidebarHeader className="border-b border-sidebar-border p-2">
        <ServiceSwitcher current={currentService} />

        {/* 기존 ERP SYSTEM 로고 영역 — 서비스 스위처로 대체됨
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            E
          </div>
          <div>
            <div className="font-bold text-sm">ERP SYSTEM</div>
            <div className="text-[11px] text-muted-foreground">v1.0.0</div>
          </div>
        </div>
        */}
      </SidebarHeader>

      {/* 메뉴 본문 — 현재 서비스의 메뉴 그룹만 표시 */}
      <SidebarContent>
        {menuGroups.map((group) => (
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
                          <StatusBadge status={item.status} />
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
                                  <StatusBadge status={child.status} />
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
                        <StatusBadge status={item.status} />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* 사이드바 하단 — 사용자 정보 + 로그아웃 */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {user && (
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs">
              <div className="font-semibold text-gray-900">{user.user_name}</div>
              <div className="text-muted-foreground">{user.company_name}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="로그아웃"
            >
              <LogOutIcon className="size-4" />
            </button>
          </div>
        )}
        <div className="text-[11px] text-muted-foreground">
          © 2026 ERP SYSTEM
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
