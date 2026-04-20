/**
 * ExpenseDetailDialog — 비용 결재 상세 다이얼로그
 *
 * - 상세 정보 표시
 * - 영수증 미리보기 (Bearer 토큰 필요 → Blob URL)
 * - 신청(submitted) 상태에서만: 수정 / 승인 / 반려 / 삭제 버튼 표시
 *
 * expenseId가 number면 다이얼로그 열림, null이면 닫힘.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  getExpense,
  approveExpense,
  rejectExpense,
  fetchReceiptBlobUrl,
} from '@/api/expenseService';
import {
  EXPENSE_STATUS_LABEL,
  type Expense,
  type ExpenseStatus,
} from '@/types/expense';
import { PAYMENT_METHOD_LABEL, getCardLabel } from '@/config/paymentMethods';

interface Props {
  /** 상세 조회할 expense id. null이면 다이얼로그 닫힘 */
  expenseId: number | null;
  onClose: () => void;
  onRequestEdit: (expense: Expense) => void;
  onRequestDelete: (id: number) => void | Promise<void>;
  /** 승인/반려 등 상태 변화 후 부모 목록 새로고침 */
  onChanged: () => void | Promise<void>;
}

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

export default function ExpenseDetailDialog({
  expenseId,
  onClose,
  onRequestEdit,
  onRequestDelete,
  onChanged,
}: Props) {
  const open = expenseId !== null;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 영수증 미리보기 (Blob URL)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptMime, setReceiptMime] = useState<string>('');
  /** 라이트박스(확대보기) 열림 여부 */
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // 상세 로드
  useEffect(() => {
    if (expenseId == null) {
      setExpense(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getExpense(expenseId)
      .then(setExpense)
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'))
      .finally(() => setLoading(false));
  }, [expenseId]);

  // 영수증 Blob URL 로드 + cleanup
  useEffect(() => {
    if (!expense?.receipt_url) {
      setReceiptUrl(null);
      return;
    }
    let revoked = false;
    let urlToRevoke: string | null = null;
    fetchReceiptBlobUrl(expense.id)
      .then(({ url, mime }) => {
        if (revoked) {
          URL.revokeObjectURL(url);
          return;
        }
        urlToRevoke = url;
        setReceiptUrl(url);
        setReceiptMime(mime);
      })
      .catch(() => {
        // 미첨부 or 404 — 미리보기 생략
      });
    return () => {
      revoked = true;
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [expense?.id, expense?.receipt_url]);

  /** 승인 */
  const handleApprove = async () => {
    if (!expense) return;
    setActionLoading(true);
    try {
      await approveExpense(expense.id);
      await onChanged();
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : '승인 실패');
    } finally {
      setActionLoading(false);
    }
  };

  /** 반려 — 사유 입력 */
  const handleReject = async () => {
    if (!expense) return;
    const reason = prompt('반려 사유를 입력하세요:');
    if (!reason || !reason.trim()) return;
    setActionLoading(true);
    try {
      await rejectExpense(expense.id, reason.trim());
      await onChanged();
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : '반려 실패');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>결재 상세</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="py-10 text-center">
            <Spinner className="inline-block" />
          </div>
        )}

        {error && (
          <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        {expense && !loading && (
          <div className="space-y-4">
            {/* 메타 정보 */}
            <dl className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
              <dt className="text-gray-500">ID</dt>
              <dd>{expense.id}</dd>

              <dt className="text-gray-500">상태</dt>
              <dd>
                <StatusBadge status={expense.status} />
              </dd>

              <dt className="text-gray-500">금액</dt>
              <dd className="font-semibold">
                {Number(expense.amount).toLocaleString('ko-KR')}원
              </dd>

              <dt className="text-gray-500">지출일</dt>
              <dd>{expense.expense_date}</dd>

              <dt className="text-gray-500">결제수단</dt>
              <dd>
                {expense.payment_method
                  ? PAYMENT_METHOD_LABEL[expense.payment_method]
                  : '-'}
                {expense.payment_method === 'card' && (
                  <span className="ml-2 text-gray-600">
                    ({getCardLabel(expense.card_code)})
                  </span>
                )}
              </dd>

              <dt className="text-gray-500">비고</dt>
              <dd className="whitespace-pre-wrap">{expense.description ?? '-'}</dd>

              <dt className="text-gray-500">신청자</dt>
              <dd>{expense.created_by_name ?? '-'}</dd>

              <dt className="text-gray-500">신청일시</dt>
              <dd className="text-xs text-gray-600">
                {new Date(expense.created_at).toLocaleString('ko-KR')}
              </dd>

              <dt className="text-gray-500">수정자</dt>
              <dd>
                {expense.updated_by_name ?? '-'}
                <span className="ml-2 text-xs text-gray-500">
                  ({new Date(expense.updated_at).toLocaleString('ko-KR')})
                </span>
              </dd>
            </dl>

            {/* 영수증 미리보기 */}
            <div>
              <div className="text-sm text-gray-500 mb-2">영수증</div>
              {!expense.receipt_url && (
                <div className="text-xs text-gray-400">첨부된 영수증이 없습니다.</div>
              )}
              {expense.receipt_url && !receiptUrl && (
                <div className="text-xs text-gray-400">
                  <Spinner className="inline-block size-3 mr-1" />
                  로드 중...
                </div>
              )}
              {receiptUrl && receiptMime.startsWith('image/') && (
                <div className="relative inline-block group">
                  <img
                    src={receiptUrl}
                    alt="영수증"
                    onClick={() => setLightboxOpen(true)}
                    className="max-w-full max-h-[400px] border rounded cursor-zoom-in transition-opacity group-hover:opacity-90"
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    확대보기
                  </button>
                </div>
              )}
              {receiptUrl && receiptMime === 'application/pdf' && (
                <iframe
                  src={receiptUrl}
                  title="영수증 PDF"
                  className="w-full h-[400px] border rounded"
                />
              )}
              {receiptUrl &&
                !receiptMime.startsWith('image/') &&
                receiptMime !== 'application/pdf' && (
                  <a
                    href={receiptUrl}
                    download
                    className="text-blue-600 underline text-sm"
                  >
                    영수증 다운로드 ({receiptMime})
                  </a>
                )}
            </div>
          </div>
        )}

        <DialogFooter>
          {expense?.status === 'submitted' && (
            <>
              <Button
                variant="outline"
                onClick={() => onRequestDelete(expense.id)}
                disabled={actionLoading}
              >
                삭제
              </Button>
              <Button
                variant="outline"
                onClick={() => onRequestEdit(expense)}
                disabled={actionLoading}
              >
                수정
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={actionLoading}
                className="text-red-600 hover:text-red-700"
              >
                반려
              </Button>
              <Button onClick={handleApprove} disabled={actionLoading}>
                {actionLoading && <Spinner className="size-4 mr-1" />}
                승인
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>

      </DialogContent>

      {/* 영수증 라이트박스 — Portal로 body에 직접 마운트해 진짜 풀스크린 확보 */}
      {lightboxOpen &&
        receiptUrl &&
        receiptMime.startsWith('image/') &&
        createPortal(
          <div
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <img
              src={receiptUrl}
              alt="영수증 확대"
              onClick={(e) => e.stopPropagation()}
              className="max-w-[98vw] max-h-[98vh] object-contain cursor-default shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="fixed top-4 right-4 size-10 rounded-full bg-white/90 hover:bg-white text-black text-xl flex items-center justify-center shadow-lg"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>,
          document.body,
        )}
    </Dialog>
  );
}
