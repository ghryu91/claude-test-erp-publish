/**
 * Pagination — 재사용 가능한 페이징 컨트롤
 *
 * 상태(page/size/total)는 부모가 관리하고, 본 컴포넌트는 UI + 이벤트만 담당한다.
 * - 좌측: 페이지 크기 셀렉트 + 총 건수
 * - 우측: 처음/이전/현재페이지/다음/마지막 버튼
 *
 * 사용 예:
 *   <Pagination
 *     page={page}
 *     totalPages={totalPages}
 *     size={size}
 *     total={total}
 *     disabled={loading}
 *     onPageChange={(p) => handleSearch(p, size)}
 *     onSizeChange={(s) => handleSearch(1, s)}
 *   />
 */

import { Button } from '@/components/ui/button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';

interface Props {
  /** 현재 페이지 (1-base) */
  page: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지당 행 수 */
  size: number;
  /** 전체 건수 */
  total: number;
  /** 선택 가능한 페이지 크기 옵션 (기본 [10, 20, 50, 100]) */
  sizeOptions?: number[];
  /** 로딩/비활성화 상태 */
  disabled?: boolean;
  /** 총 건수 표시에 사용할 단위 (기본 '명') */
  unit?: string;
  /** 페이지 이동 이벤트 */
  onPageChange: (page: number) => void;
  /** 페이지 크기 변경 이벤트 (내부에서 1페이지로 리셋은 부모가 결정) */
  onSizeChange: (size: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  size,
  total,
  sizeOptions = [10, 20, 50, 100],
  disabled = false,
  unit = '명',
  onPageChange,
  onSizeChange,
}: Props) {
  if (totalPages <= 0) return null;

  /** 범위/중복 이동 방지 후 부모에 알림 */
  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  return (
    <div className="flex items-center justify-between px-1 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span>페이지당</span>
        <select
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          disabled={disabled}
          className="px-2 py-1 border border-gray-300 rounded bg-white cursor-pointer"
        >
          {sizeOptions.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>총 {total}{unit}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => goTo(1)} disabled={disabled || page <= 1} className="h-7 w-7 p-0">
          <ChevronsLeftIcon className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => goTo(page - 1)} disabled={disabled || page <= 1} className="h-7 w-7 p-0">
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="px-3">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => goTo(page + 1)} disabled={disabled || page >= totalPages} className="h-7 w-7 p-0">
          <ChevronRightIcon className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => goTo(totalPages)} disabled={disabled || page >= totalPages} className="h-7 w-7 p-0">
          <ChevronsRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
