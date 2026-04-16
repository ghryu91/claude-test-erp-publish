/**
 * PaginationLinks — 숫자 링크 스타일 페이징 컴포넌트
 *
 * shadcn/ui의 Pagination 기반. 현재 페이지 주변 + 처음/끝 + 말줄임(...) 자동 처리.
 * 상태(page/totalPages)는 부모가 관리하고, 본 컴포넌트는 UI + 이벤트만 담당한다.
 *
 * 사용 예:
 *   <PaginationLinks page={page} totalPages={totalPages} onPageChange={setPage} />
 */

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface Props {
  /** 현재 페이지 (1-base) */
  page: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 이동 이벤트 */
  onPageChange: (page: number) => void;
  /** 현재 페이지 주변에 몇 개의 페이지 번호를 보여줄지 (기본 1) */
  siblingCount?: number;
  /** 추가 클래스 */
  className?: string;
}

/** 페이지 번호 목록 생성 — 처음/끝 + 현재 주변 + 말줄임 처리 */
function getPageNumbers(
  current: number,
  total: number,
  sibling: number
): (number | '...')[] {
  const windowSize = sibling * 2 + 5; // 1, ..., c-s..c..c+s, ..., total
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];
  const start = Math.max(2, current - sibling);
  const end = Math.min(total - 1, current + sibling);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}

export default function PaginationLinks({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages, siblingCount);

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            aria-disabled={page === 1}
            className={page === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {pages.map((n, i) =>
          n === '...' ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={n}>
              <PaginationLink
                href="#"
                isActive={page === n}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(n as number);
                }}
              >
                {n}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            aria-disabled={page === totalPages}
            className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
