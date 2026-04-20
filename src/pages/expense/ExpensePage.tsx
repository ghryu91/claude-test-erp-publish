/**
 * ExpensePage — 비용 결재(영수증 처리) 메인 페이지
 *
 * 핵심 기능:
 * - 상태별 필터 + 페이징으로 목록 조회 (GET /api/v1/expenses)
 * - "신청" 버튼 → 신청 다이얼로그 (multipart 업로드)
 * - 행 클릭 → 상세 다이얼로그 (영수증 미리보기/수정/승인/반려/삭제)
 *
 * API 호출은 모두 expenseService.ts에 위임. 토큰은 axios 인터셉터가 자동 주입.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  listExpenses,
  deleteExpense,
} from '@/api/expenseService';
import {
  EXPENSE_STATUS_LABEL,
  type Expense,
  type ExpenseStatus,
} from '@/types/expense';
import Pagination from '@/components/Pagination';
import ResizableTable from '@/components/ResizableTable';
import type { ColumnDef } from '@/hooks/useResizableColumns';
import { Button } from '@/components/ui/button';
import { PlusIcon, RefreshCwIcon } from 'lucide-react';
import ExpenseFormDialog from './ExpenseFormDialog';
import ExpenseDetailDialog from './ExpenseDetailDialog';
import {
  PAYMENT_METHOD_LABEL,
  getCardLabel,
  type PaymentMethod,
} from '@/config/paymentMethods';

const STATUS_FILTERS: { value: ExpenseStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'submitted', label: '신청' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '반려' },
  { value: 'settled', label: '정산완료' },
];

/** 상태 뱃지 색상 매핑 */
function StatusBadge({ status }: { status: ExpenseStatus }) {
  const cls: Record<ExpenseStatus, string> = {
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    settled: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded border ${cls[status]}`}>
      {EXPENSE_STATUS_LABEL[status]}
    </span>
  );
}

/** 금액 표시 — 천단위 콤마 + 원 */
function formatAmount(amount: string): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  return n.toLocaleString('ko-KR') + '원';
}

/** ResizableTable용 컬럼 정의 — render로 커스텀 셀 처리 */
const EXPENSE_COLUMNS: ColumnDef[] = [
  // { key: 'id', label: 'ID', width: 70 },
  { key: 'expense_date', label: '지출일', width: 110 },
  {
    key: 'amount',
    label: '금액',
    width: 130,
    render: (v) => (
      <div className="text-right pr-1">{formatAmount(String(v))}</div>
    ),
  },
  {
    key: 'description',
    label: '비고',
    width: 320,
    render: (v) => <span>{(v as string | null) ?? '-'}</span>,
  },
  {
    key: 'payment_method',
    label: '결제수단',
    width: 140,
    render: (v, row) => {
      const method = v as PaymentMethod | null;
      if (!method) return '-';
      const label = PAYMENT_METHOD_LABEL[method];
      if (method !== 'card') return label;
      return (
        <span>
          {label}
          <span className="text-gray-500 ml-1">
            ({getCardLabel(row.card_code as string | null)})
          </span>
        </span>
      );
    },
  },
  {
    key: 'status',
    label: '상태',
    width: 90,
    render: (v) => <StatusBadge status={v as ExpenseStatus} />,
  },
  {
    key: 'receipt_url',
    label: '영수증',
    width: 70,
    render: (v) => (v ? '있음' : '-'),
  },
  {
    key: 'created_by_name',
    label: '신청자',
    width: 110,
    render: (v) => <span>{(v as string | null) ?? '-'}</span>,
  },
  {
    key: 'created_at',
    label: '신청일시',
    width: 170,
    render: (v) => (
      <span className="text-xs text-gray-600">
        {new Date(String(v)).toLocaleString('ko-KR')}
      </span>
    ),
  },
];

export default function ExpensePage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / size));

  /** 목록 새로고침 — 현재 page/size/필터 기준 */
  const refresh = useCallback(
    async (targetPage = page, targetSize = size) => {
      setLoading(true);
      setError(null);
      try {
        const res = await listExpenses({
          page: targetPage,
          page_size: targetSize,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });
        setItems(res.items);
        setTotal(res.total);
        setPage(targetPage);
        setSize(targetSize);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '목록 조회 실패';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [page, size, statusFilter],
  );

  // 초기 로드 + 필터 변경 시 1페이지로 리셋해 재조회
  useEffect(() => {
    refresh(1, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  /** 신청 버튼 — 빈 폼 다이얼로그 열기 */
  const handleNew = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  /** 상세에서 수정 요청 → 상세 닫고 폼 열기 */
  const handleRequestEdit = (expense: Expense) => {
    setDetailId(null);
    setEditTarget(expense);
    setFormOpen(true);
  };

  /** 삭제 — 확인 후 실행, 목록 새로고침 */
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteExpense(id);
      setDetailId(null);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제 실패');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">영수증 처리</h1>
          <p className="text-xs text-muted-foreground">비용 결재 신청 · 승인 · 정산</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={loading}
          >
            <RefreshCwIcon className="size-4" />
            새로고침
          </Button>
          <Button size="sm" onClick={handleNew}>
            <PlusIcon className="size-4" />
            결재 신청
          </Button>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex items-center gap-1 border-b">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              statusFilter === f.value
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 에러 */}
      {error && (
        <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* 테이블 — ResizableTable: 컬럼 너비/순서 드래그 + localStorage 저장 */}
      <ResizableTable
        tableId="expense-list"
        initialColumns={EXPENSE_COLUMNS}
        data={items as unknown as Record<string, unknown>[]}
        title={`결재 목록 (${total}건)`}
        loading={loading}
        onRowClick={(row) => setDetailId(Number(row.id))}
      />

      {/* 페이지네이션 */}
      <Pagination
        page={page}
        totalPages={totalPages}
        size={size}
        total={total}
        unit="건"
        disabled={loading}
        onPageChange={(p) => refresh(p, size)}
        onSizeChange={(s) => refresh(1, s)}
      />

      {/* 신청/수정 다이얼로그 */}
      <ExpenseFormDialog
        open={formOpen}
        target={editTarget}
        onClose={() => setFormOpen(false)}
        onSaved={async () => {
          setFormOpen(false);
          await refresh();
        }}
      />

      {/* 상세 다이얼로그 */}
      <ExpenseDetailDialog
        expenseId={detailId}
        onClose={() => setDetailId(null)}
        onRequestEdit={handleRequestEdit}
        onRequestDelete={handleDelete}
        onChanged={refresh}
      />
    </div>
  );
}
