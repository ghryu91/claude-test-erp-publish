/**
 * paymentMethods.ts — 결제수단/카드 상수
 *
 * 우선은 하드코딩으로 관리. 추후 마스터 테이블 도입 시
 * 이 파일을 API 호출로 교체하거나 react-query 캐시로 옮길 수 있다.
 */

export type PaymentMethod = 'card' | 'cash';

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: '카드' },
  { value: 'cash', label: '현금' },
];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: '카드',
  cash: '현금',
};

/** 등록된 카드 목록 — card_code가 백엔드 식별자 */
export interface CardOption {
  /** API에 전달되는 식별자 (예: KB-1234) */
  code: string;
  /** 카드사 */
  issuer: string;
  /** 카드 번호 끝 4자리 */
  last4: string;
}

export const CARD_OPTIONS: CardOption[] = [
  { code: 'KB-1234', issuer: '국민', last4: '1234' },
  { code: 'NH-5678', issuer: '농협', last4: '5678' },
  { code: 'SH-9012', issuer: '신한', last4: '9012' },
  { code: 'WR-3456', issuer: '우리', last4: '3456' },
  { code: 'HN-7890', issuer: '하나', last4: '7890' },
];

/** 카드 코드 → 표시용 라벨 ("국민-1234") */
export function getCardLabel(code: string | null | undefined): string {
  if (!code) return '-';
  const card = CARD_OPTIONS.find((c) => c.code === code);
  return card ? `${card.issuer}-${card.last4}` : code;
}