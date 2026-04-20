/**
 * ExpenseFormDialog — 비용 결재 신청/수정 다이얼로그
 *
 * - target=null  → 신청 모드 (multipart, 영수증 첨부 가능)
 * - target=객체  → 수정 모드 (JSON, 금액/날짜/비고만, 영수증 재첨부 미지원)
 *
 * 저장 성공 시 onSaved() 호출 — 부모가 목록 새로고침 + 다이얼로그 닫기.
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { createExpense, updateExpense } from '@/api/expenseService';
import type { Expense } from '@/types/expense';
import {
  PAYMENT_METHOD_OPTIONS,
  CARD_OPTIONS,
  type PaymentMethod,
} from '@/config/paymentMethods';

interface Props {
  open: boolean;
  /** null이면 신청 모드, 객체면 수정 모드 */
  target: Expense | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

/** 오늘 날짜 YYYY-MM-DD */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpenseFormDialog({ open, target, onClose, onSaved }: Props) {
  const isEdit = target !== null;

  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayStr());
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardCode, setCardCode] = useState<string>(CARD_OPTIONS[0]?.code ?? '');
  const [receipt, setReceipt] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 다이얼로그 열릴 때마다 초기값 세팅
  useEffect(() => {
    if (!open) return;
    setError(null);
    setReceipt(null);
    if (target) {
      setAmount(target.amount);
      setExpenseDate(target.expense_date);
      setDescription(target.description ?? '');
      setPaymentMethod(target.payment_method ?? 'card');
      setCardCode(target.card_code ?? CARD_OPTIONS[0]?.code ?? '');
    } else {
      setAmount('');
      setExpenseDate(todayStr());
      setDescription('');
      setPaymentMethod('card');
      setCardCode(CARD_OPTIONS[0]?.code ?? '');
    }
  }, [open, target]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!amount || Number.isNaN(num) || num <= 0) {
      setError('금액은 0보다 큰 숫자여야 합니다.');
      return;
    }
    if (!expenseDate) {
      setError('지출일을 입력하세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const cardField = paymentMethod === 'card' ? cardCode : null;
      if (isEdit && target) {
        await updateExpense(target.id, {
          amount,
          expense_date: expenseDate,
          description: description || undefined,
          payment_method: paymentMethod,
          card_code: cardField,
        });
      } else {
        await createExpense({
          amount,
          expense_date: expenseDate,
          description: description || undefined,
          payment_method: paymentMethod,
          card_code: cardField,
          receipt,
        });
      }
      await onSaved();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[92vw] sm:max-w-[520px] p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg">{isEdit ? '결재 수정' : '결재 신청'}</DialogTitle>
          <DialogDescription className="text-xs">
            {isEdit
              ? '신청 상태(submitted)에서만 수정 가능합니다.'
              : '비용 정보를 입력하고 영수증을 첨부하세요.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="exp-amount">
                금액 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="exp-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="예: 15000"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-date">
                지출일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="exp-date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="exp-method">결제수단 <span className="text-red-500">*</span></Label>
              <select
                id="exp-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PAYMENT_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-card">카드</Label>
              <select
                id="exp-card"
                value={cardCode}
                onChange={(e) => setCardCode(e.target.value)}
                disabled={paymentMethod !== 'card'}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:bg-gray-50"
              >
                {CARD_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.issuer}-{c.last4}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exp-desc">비고</Label>
            <Input
              id="exp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 팀 점심"
            />
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="exp-receipt">영수증</Label>
              <Input
                id="exp-receipt"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                className="file:mr-3 file:px-3 file:py-1 file:text-xs file:rounded file:border file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground">
                jpg / png / webp / pdf · 최대 10MB
              </p>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner className="size-4 mr-1" />}
              {isEdit ? '수정' : '신청'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
