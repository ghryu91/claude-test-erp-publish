import { useState } from 'react';
import { useResizableColumns, type ColumnDef } from '../hooks/useResizableColumns';

interface Props {
  tableId: string;
  initialColumns: ColumnDef[];
  data: Record<string, unknown>[];
  title?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
}

export default function ResizableTable({ tableId, initialColumns, data, title, onRowClick }: Props) {
  const { columns, startResize, onDragStart, onDragOver, onDrop, resetColumns } =
    useResizableColumns(tableId, initialColumns);

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
      {/* 툴바 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        {title && <span className="font-bold text-sm text-gray-800">{title}</span>}
        <button
          onClick={resetColumns}
          className="text-xs px-2.5 py-1 border border-gray-400 rounded bg-white text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          컬럼 초기화
        </button>
      </div>

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
            {data.map((row, rowIndex) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* 힌트 */}
      <p className="text-[11px] text-gray-400 px-4 py-2 bg-gray-50 border-t border-gray-100 m-0">
        💡 헤더를 <strong>드래그</strong>하면 순서 변경 · 헤더 오른쪽 끝을 드래그하면{' '}
        <strong>너비 조정</strong>
      </p>
    </div>
  );
}
