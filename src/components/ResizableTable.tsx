import { useState } from 'react';
import { useResizableColumns, type ColumnDef } from '../hooks/useResizableColumns';
import PaginationLinks from './PaginationLinks';
import Pagination from './Pagination';

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
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ width: col.width }}
                      className="text-xs text-gray-700 text-center px-3 py-2.5 border-b border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] as string | number | null) ?? '-'}
                    </td>
                  ))}
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
