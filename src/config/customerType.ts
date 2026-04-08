/**
 * customerType - 거래처 구분(customer_type) 코드 정의
 *
 * 백엔드 API의 customer_type(gubun) 코드와 라벨 매핑.
 * 거래처 검색 필터 및 폼의 거래구분 표시에 공통으로 사용.
 */

export interface CustomerTypeOption {
  code: number;
  label: string;
}

export const CUSTOMER_TYPES: CustomerTypeOption[] = [
  { code: 1, label: '레미콘 조합' },
  { code: 2, label: '레미콘 회사' },
  { code: 3, label: '아스콘 조합' },
  { code: 4, label: '아스콘 회사' },
  { code: 5, label: '자동차 정비' },
  { code: 6, label: '매입처' },
  { code: 7, label: '매출처' },
  { code: 8, label: '매입매출처' },
  { code: 9, label: '금융 기관' },
  { code: 10, label: '기타' },
  { code: 11, label: '사용안함' },
];

/** 코드 → 라벨 변환 */
export function getCustomerTypeLabel(code: number | null | undefined): string {
  if (code == null) return '';
  return CUSTOMER_TYPES.find((t) => t.code === code)?.label ?? '';
}
