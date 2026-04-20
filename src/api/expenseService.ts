/**
 * expenseService.ts — 비용 결재(Expense) API 호출 함수
 *
 * 모든 함수는 axiosInstance(baseURL=/api/v1)를 통해 요청한다.
 * Bearer 토큰은 인터셉터가 자동 주입.
 */

import api from './axiosInstance';
import type {
  Expense,
  ExpenseListResponse,
  ExpenseStatus,
  ExpenseCreateInput,
  ExpenseUpdateInput,
} from '@/types/expense';

/** 목록 조회 — 상태 필터/페이징 */
export async function listExpenses(params: {
  page?: number;
  page_size?: number;
  status?: ExpenseStatus;
}): Promise<ExpenseListResponse> {
  const { data } = await api.get<ExpenseListResponse>('/expenses', { params });
  return data;
}

/** 상세 조회 */
export async function getExpense(id: number): Promise<Expense> {
  const { data } = await api.get<Expense>(`/expenses/${id}`);
  return data;
}

/** 신청 — multipart/form-data */
export async function createExpense(input: ExpenseCreateInput): Promise<Expense> {
  const form = new FormData();
  form.append('amount', input.amount);
  form.append('expense_date', input.expense_date);
  if (input.category_id != null) form.append('category_id', String(input.category_id));
  if (input.description) form.append('description', input.description);
  if (input.payment_method) form.append('payment_method', input.payment_method);
  if (input.card_code) form.append('card_code', input.card_code);
  if (input.receipt) form.append('receipt', input.receipt);

  const { data } = await api.post<Expense>('/expenses', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** 수정 — JSON, submitted 상태에서만 가능 */
export async function updateExpense(
  id: number,
  input: ExpenseUpdateInput,
): Promise<Expense> {
  const { data } = await api.patch<Expense>(`/expenses/${id}`, input);
  return data;
}

/** 승인 */
export async function approveExpense(id: number): Promise<Expense> {
  const { data } = await api.patch<Expense>(`/expenses/${id}/approve`);
  return data;
}

/** 반려 — 사유 필수 */
export async function rejectExpense(id: number, reason: string): Promise<Expense> {
  const { data } = await api.patch<Expense>(`/expenses/${id}/reject`, { reason });
  return data;
}

/** 삭제 (soft delete) */
export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

/**
 * 영수증 파일 다운로드 — Bearer 헤더가 필요해 <img src>로 직접 못 쓴다.
 * Blob을 받아서 ObjectURL을 반환. 호출자가 URL.revokeObjectURL로 정리해야 함.
 */
export async function fetchReceiptBlobUrl(id: number): Promise<{ url: string; mime: string }> {
  const res = await api.get<Blob>(`/expenses/${id}/receipt`, { responseType: 'blob' });
  const blob = res.data;
  return { url: URL.createObjectURL(blob), mime: blob.type };
}
