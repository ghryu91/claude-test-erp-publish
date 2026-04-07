/**
 * AppLayout - 전체 페이지 레이아웃
 *
 * SidebarProvider로 사이드바 상태를 관리하고,
 * 좌측 AppSidebar + 우측 콘텐츠 영역(SidebarInset)으로 구성된다.
 * 상단에 SidebarTrigger(토글 버튼)와 Breadcrumb 영역을 포함한다.
 */

import { Outlet } from 'react-router-dom';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import AppSidebar from './AppSidebar';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* 상단 헤더 바 */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <span className="text-sm text-muted-foreground">ERP SYSTEM</span>
        </header>

        {/* 페이지 콘텐츠 영역 — react-router Outlet */}
        <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
