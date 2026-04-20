/**
 * expense.ts — 비용 결재(Expense) 도메인 타입
 *
 * 백엔드 핸드오프 문서 기준: /api/v1/expenses 엔드포인트
 */

import type { PaymentMethod } from '@/config/paymentMethods';

export type ExpenseStatus = 'submitted' | 'approved' | 'rejected' | 'settled';

/** 상태 한국어 라벨 매핑 */
export const EXPENSE_STATUS_LABEL: Record<ExpenseStatus, string> = {
  submitted: '신청',
  approved: '승인',
  rejected: '반려',
  settled: '정산완료',
};

/** 백엔드 응답 — ExpenseResponse */
export interface Expense {
  id: number;
  category_id: number | null;
  /** 소수점 정밀도 보존을 위해 문자열로 옴 */
  amount: string;
  /** YYYY-MM-DD */
  expense_date: string;
  description: string | null;
  status: ExpenseStatus;
  /** 결제수단 (card/cash) */
  payment_method: PaymentMethod | null;
  /** 카드 식별자 (payment_method=card일 때만, 예: KB-1234) */
  card_code: string | null;
  /** 영수증 파일 다운로드 URL (없으면 null) */
  receipt_url: string | null;
  created_at: string;
  created_by_name: string | null;
  updated_at: string;
  updated_by_name: string | null;
}

/** 목록 응답 */
export interface ExpenseListResponse {
  total: number;
  items: Expense[];
}

/** 신청 폼 데이터 (multipart) */
export interface ExpenseCreateInput {
  amount: string;
  expense_date: string;
  category_id?: number | null;
  description?: string;
  payment_method?: PaymentMethod;
  card_code?: string | null;
  receipt?: File | null;
}

/** 수정 페이로드 (JSON) */
export interface ExpenseUpdateInput {
  category_id?: number | null;
  amount?: string;
  expense_date?: string;
  description?: string;
  payment_method?: PaymentMethod;
  card_code?: string | null;
}
