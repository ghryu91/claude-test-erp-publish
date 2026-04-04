import { useState, useCallback, useRef } from 'react';

export interface ColumnDef {
  key: string;
  label: string;
  width: number;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface StoredConfig {
  order: string[];
  widths: Record<string, number>;
}

const STORAGE_KEY_PREFIX = 'erp_table_';

function loadFromStorage(tableId: string): StoredConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + tableId);
    return saved ? (JSON.parse(saved) as StoredConfig) : null;
  } catch {
    return null;
  }
}

function saveToStorage(tableId: string, data: StoredConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + tableId, JSON.stringify(data));
  } catch {
    // storage 접근 불가 시 무시
  }
}

function persist(tableId: string, cols: ColumnDef[]): void {
  saveToStorage(tableId, {
    order: cols.map((c) => c.key),
    widths: Object.fromEntries(cols.map((c) => [c.key, c.width])),
  });
}

export function useResizableColumns(tableId: string, initialColumns: ColumnDef[]) {
  const saved = loadFromStorage(tableId);

  const initColumns = (): ColumnDef[] => {
    if (!saved) return initialColumns;
    return saved.order
      .map((key) => {
        const col = initialColumns.find((c) => c.key === key);
        if (!col) return null;
        return { ...col, width: saved.widths[key] ?? col.width };
      })
      .filter((c): c is ColumnDef => c !== null);
  };

  const [columns, setColumns] = useState<ColumnDef[]>(initColumns);
  const dragSrcIndex = useRef<number | null>(null);

  // ── 너비 조정 ──────────────────────────────────────────
  const startResize = useCallback(
    (e: React.MouseEvent, colIndex: number) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = columns[colIndex].width;

      const onMouseMove = (moveE: MouseEvent) => {
        const newWidth = Math.max(50, startWidth + moveE.clientX - startX);
        setColumns((prev) => {
          const next = prev.map((c, i) =>
            i === colIndex ? { ...c, width: newWidth } : c
          );
          persist(tableId, next);
          return next;
        });
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [columns, tableId]
  );

  // ── 순서 변경 ──────────────────────────────────────────
  const onDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      dragSrcIndex.current = index;
      e.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const srcIndex = dragSrcIndex.current;
      if (srcIndex === null || srcIndex === dropIndex) return;

      setColumns((prev) => {
        const next = [...prev];
        const [moved] = next.splice(srcIndex, 1);
        next.splice(dropIndex, 0, moved);
        persist(tableId, next);
        return next;
      });
      dragSrcIndex.current = null;
    },
    [tableId]
  );

  const resetColumns = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + tableId);
    setColumns(initialColumns);
  }, [tableId, initialColumns]);

  return { columns, startResize, onDragStart, onDragOver, onDrop, resetColumns };
}
