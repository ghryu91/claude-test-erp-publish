import { useState } from 'react';
import { useResizableColumns, type ColumnDef } from '../hooks/useResizableColumns';
import PaginationLinks from './PaginationLinks';
import Pagination from './Pagination';

/* ============================================================================
 * ResizableTable 사용법
 * ----------------------------------------------------------------------------
 * 컬럼 너비/순서 조정 + localStorage 저장 + 페이지네이션/엑셀 다운로드 통합 테이블.
 *
 * [기본 사용]
 *   <ResizableTable tableId="customer-list" initialColumns={COLUMNS} data={rows} />
 *
 * [ColumnDef]
 *   { key, label, width, render? }
 *   - key:    행에서 값을 꺼낼 경로. dot-path 지원 ('parent.code', 'primary_region.name')
 *   - render: (val, row) => ReactNode  ※ 두 번째 인자 row = 행 객체 전체
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * [예시 1] dot-path 만으로 중첩 필드 표시 (render 불필요)
 *   { key: 'parent.code', label: '상위', width: 110 }
 *
 * [예시 2] 한 셀에 한 컬럼 값 변형 (val 만 사용)
 *   {
 *     key: 'userId',
 *     label: '아이디',
 *     width: 140,
 *     render: (val) => (
 *       <span className="flex items-center gap-1">
 *         <span>{String(val)}</span>
 *         <CopyButton value={String(val)} />
 *       </span>
 *     ),
 *   }
 *
 * [예시 3] 한 객체의 여러 필드 함께 표시 (row.parent 사용)
 *   {
 *     key: 'parent.code',
 *     label: '상위 거래처',
 *     width: 220,
 *     render: (_val, row) => {
 *       const parent = row.parent as { code?: string; name?: string } | null;
 *       if (!parent) return '-';
 *       return (
 *         <span>
 *           <span className="font-mono text-gray-500">{parent.code}</span>
 *           <span className="ml-2">{parent.name}</span>
 *         </span>
 *       );
 *     },
 *   }
 *
 * [예시 4] 다른 컬럼 값을 함께 합쳐서 표시 (row 의 다른 필드 참조)
 *   {
 *     key: 'address_main',
 *     label: '주소',
 *     width: 360,
 *     render: (val, row) => {
 *       const main = (val as string) ?? '';
 *       const detail = (row.address_detail as string) ?? '';
 *       return detail ? `${main} ${detail}` : main || '-';
 *     },
 *   }
 *
 * [예시 5] 상태/플래그 조합으로 분기 렌더링 (row 의 여러 필드 조건부)
 *   {
 *     key: 'is_active',
 *     label: '상태',
 *     width: 90,
 *     render: (_val, row) => {
 *       const active = row.is_active as boolean;
 *       const status = row.status as string;
 *       return (
 *         <span className={`px-1.5 py-0.5 rounded text-[11px] ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
 *           {active ? status : '비활성'}
 *         </span>
 *       );
 *     },
 *   }
 *
 * 핵심: render(val, row) — val 은 col.key 로 해석된 값, row 는 행 객체 전체.
 *      여러 필드를 조합/조건 분기 하고 싶다면 두 번째 인자 row 만 활용하면 됨.
 * ============================================================================ */

/**
 * 페이지네이션 설정 — variant에 따라 내부적으로 다른 모듈을 렌더링
 * - 'links': PaginationLinks (숫자 링크 스타일)
 * - 'full':  Pagination (페이지 크기 선택 + 처음/이전/다음/마지막 버튼)
 */
export type PaginationConfig =
  | {
      variant: 'links';
      page: number;
      totalPages: number;
      onPageChange: (p: number) => void;
      siblingCount?: number;
    }
  | {
      variant: 'full';
      page: number;
      totalPages: number;
      size: number;
      total: number;
      onPageChange: (p: number) => void;
      onSizeChange: (s: number) => void;
      sizeOptions?: number[];
      disabled?: boolean;
      unit?: string;
    };

interface Props {
  tableId: string;
  initialColumns: ColumnDef[];
  data: Record<string, unknown>[];
  title?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
  /** 로딩 중일 때 스켈레톤 행 표시 (CLAUDE.md UI/UX Principles) */
  loading?: boolean;
  /** 스켈레톤 행 개수 (기본 8) */
  skeletonRows?: number;
  /** 엑셀 다운로드 핸들러 — 전달 시 데이터가 있을 때만 툴바에 버튼 노출 */
  onExcelDownload?: () => void;
  /** 엑셀 다운로드 진행 중 여부 — 버튼 disabled/스피너 제어 */
  exporting?: boolean;
  /** 페이지네이션 설정 — 전달 시 variant에 맞는 모듈을 내부 렌더링 */
  pagination?: PaginationConfig;
  /** 페이지네이션 위치 제어 (기본 'both') */
  paginationPosition?: 'top' | 'bottom' | 'both';
}

/** dot-path('parent.code')로 중첩 객체에서 값 조회 — null/undefined는 그대로 단락(short-circuit) */
function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (acc, key) => (acc == null ? acc : (acc as Record<string, unknown>)[key]),
    obj,
  );
}

/** 페이지네이션 설정 → 실제 엘리먼트 */
function renderPagination(cfg: PaginationConfig) {
  if (cfg.variant === 'links') {
    return (
      <PaginationLinks
        page={cfg.page}
        totalPages={cfg.totalPages}
        onPageChange={cfg.onPageChange}
        siblingCount={cfg.siblingCount}
      />
    );
  }
  return (
    <Pagination
      page={cfg.page}
      totalPages={cfg.totalPages}
      size={cfg.size}
      total={cfg.total}
      onPageChange={cfg.onPageChange}
      onSizeChange={cfg.onSizeChange}
      sizeOptions={cfg.sizeOptions}
      disabled={cfg.disabled}
      unit={cfg.unit}
    />
  );
}

export default function ResizableTable({ tableId, initialColumns, data, title, onRowClick, loading = false, skeletonRows = 8, onExcelDownload, exporting = false, pagination, paginationPosition = 'both' }: Props) {
  const showTop = pagination && (paginationPosition === 'top' || paginationPosition === 'both');
  const showBottom = pagination && (paginationPosition === 'bottom' || paginationPosition === 'both');
  const paginationNode = pagination ? renderPagination(pagination) : null;
  const { columns, startResize, onDragStart, onDragOver, onDrop, resetColumns } =
    useResizableColumns(tableId, initialColumns);

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
      {/* 툴바 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        {title && <span className="font-bold text-sm text-gray-800">{title}</span>}
        <div className="flex items-center gap-2">
          <button
            onClick={resetColumns}
            className="text-xs px-2.5 py-1 border border-gray-400 rounded bg-white text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            컬럼 초기화
          </button>
          {/* 엑셀 다운로드 — 핸들러가 있고 데이터가 있을 때만 노출 */}
          {onExcelDownload && data.length > 0 && (
            <button
              onClick={onExcelDownload}
              disabled={exporting}
              className="text-xs px-2.5 py-1 border border-green-600 rounded bg-white text-green-700 hover:bg-green-50 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? '다운로드 중...' : '📊 엑셀 다운로드'}
            </button>
          )}
        </div>
      </div>

      {/* 상단 페이지네이션 */}
      {showTop && (
        <div className="px-4 py-2 border-b border-gray-200 bg-white">{paginationNode}</div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="border-collapse table-fixed" style={{ width: 'max-content' }}>
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={{ width: col.width }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((col, colIndex) => (
                <th
                  key={col.key}
                  draggable
                  onDragStart={(e) => onDragStart(e, colIndex)}
                  onDragOver={(e) => { onDragOver(e); setDragOverIndex(colIndex); }}
                  onDrop={(e) => { onDrop(e, colIndex); setDragOverIndex(null); }}
                  onDragLeave={() => setDragOverIndex(null)}
                  style={{ width: col.width }}
                  className={`
                    relative select-none cursor-grab active:cursor-grabbing
                    bg-[#1a2e4a] text-white text-xs font-semibold text-center
                    px-3 py-2.5 border-r border-[#2d4a6e] whitespace-nowrap overflow-hidden
                    ${dragOverIndex === colIndex ? 'bg-[#2d6aad] border-l-2 border-l-sky-400' : ''}
                  `}
                >
                  <span className="block overflow-hidden text-ellipsis">{col.label}</span>
                  {/* 리사이즈 핸들 */}
                  <span
                    onMouseDown={(e) => { e.stopPropagation(); startResize(e, colIndex); }}
                    className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-white/40 z-10"
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // 로딩 중 — 스켈레톤 행 (CLAUDE.md UI/UX Principles)
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className={rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ width: col.width }}
                      className="text-xs px-3 py-2.5 border-b border-r border-gray-200"
                    >
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-blue-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  {columns.map((col) => {
                    const cellValue = getByPath(row, col.key);
                    return (
                      <td
                        key={col.key}
                        style={{ width: col.width }}
                        className="text-xs text-gray-700 text-center px-3 py-2.5 border-b border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {col.render
                          ? col.render(cellValue, row)
                          : (cellValue as string | number | null) ?? '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-sm text-gray-400">
                  자료가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 페이지네이션 */}
      {showBottom && (
        <div className="px-4 py-2 border-t border-gray-200 bg-white">{paginationNode}</div>
      )}

      {/* 힌트 */}
      <p className="text-[11px] text-gray-400 px-4 py-2 bg-gray-50 border-t border-gray-100 m-0">
        💡 헤더를 <strong>드래그</strong>하면 순서 변경 · 헤더 오른쪽 끝을 드래그하면{' '}
        <strong>너비 조정</strong>
      </p>
    </div>
  );
}
