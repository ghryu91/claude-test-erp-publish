/**
 * ServiceSwitcher - 사이드바 상단의 서비스(프로젝트) 전환 드롭다운
 *
 * 현재 활성 서비스를 표시하고, 클릭 시 다른 서비스로 이동한다.
 * 지금은 path 기반(`/master`, `/erp`, ...)으로 navigate하지만,
 * 추후 서브도메인 전환은 `lib/service.ts`의 `getServiceUrl`만 수정하면 된다.
 */

import { useNavigate } from 'react-router-dom';
import { ChevronsUpDownIcon, CheckIcon } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  SERVICES,
  getServiceUrl,
  type ServiceKey,
  type ServiceDef,
} from '@/lib/service';

interface ServiceSwitcherProps {
  current: ServiceKey;
}

export default function ServiceSwitcher({ current }: ServiceSwitcherProps) {
  const navigate = useNavigate();
  const active: ServiceDef =
    SERVICES.find((s) => s.key === current) ?? SERVICES[0];
  const ActiveIcon = active.icon;

  /** 서비스 전환 — 지금은 라우트 이동, 추후 도메인 이동으로 교체 가능 */
  const handleSelect = (key: ServiceKey) => {
    if (key === current) return;
    navigate(getServiceUrl(key));
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ActiveIcon className="size-4" />
            </div>
            <div className="flex-1 text-left text-sm leading-tight">
              <div className="font-semibold truncate">{active.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {active.description}
              </div>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 opacity-60" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            side="bottom"
            sideOffset={6}
            className="w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                서비스 전환
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {SERVICES.map((s) => {
              const Icon = s.icon;
              const isActive = s.key === current;
              return (
                <DropdownMenuItem
                  key={s.key}
                  onClick={() => handleSelect(s.key)}
                  className="gap-2"
                >
                  <div className="flex size-6 items-center justify-center rounded border bg-background">
                    <Icon className="size-3.5" />
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {s.description}
                    </div>
                  </div>
                  {isActive && <CheckIcon className="size-4 text-blue-600" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
