/**
 * CustomerPage - 거래처 등록/조회 화면
 *
 * Delphi '거래처자료 등록(Yu911)' 화면을 재현한 페이지.
 * - 상단: 선택된 거래처 상세 폼 (코드/거래구분/사업자번호/상호/대표자/주소/전화/이메일 등)
 * - 우측: 작업 버튼 (추가/확인/취소/삭제/미리보기/출력/작업종료)
 * - 하단: 거래처 목록 테이블 (행 클릭 시 상단 폼에 로드)
 */

import { useState } from 'react';
import ResizableTable from '@/components/ResizableTable';
import { Button } from '@/components/ui/button';
import { CUSTOMER_COLUMNS, CUSTOMER_DATA, type Customer } from '@/data/customerData';
import {
  PlusIcon,
  CheckIcon,
  XIcon,
  Trash2Icon,
  EyeIcon,
  PrinterIcon,
  LogOutIcon,
} from 'lucide-react';

/** 빈 거래처 객체 생성 — 신규 추가 시 초기값 */
const emptyCustomer = (): Customer => ({
  cust_code: '',
  sangho: '',
  company_name: '',
  business_no: '',
  representative: '',
  address: '',
  tel_1: '',
  fax: '',
  email_1: '',
  zip_code: '',
  business_type: '',
  business_item: '',
  cust_gubun: '레미콘회사',
  remark_1: '',
  remark_2: '',
});

/** Record 변환 헬퍼 — ResizableTable에 데이터 전달용 */
function toRecord<T extends object>(arr: T[]): Record<string, unknown>[] {
  return arr as unknown as Record<string, unknown>[];
}

/** 입력 필드 Row 컴포넌트 — 라벨 + input */
function Field({
  label,
  value,
  onChange,
  width = 'flex-1',
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  width?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded overflow-hidden">
      <div className="w-[90px] min-w-[90px] bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 font-semibold border-r border-gray-200 text-center">
        {label}
      </div>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${width} px-2.5 py-1.5 text-xs outline-none ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white focus:bg-blue-50'}`}
      />
    </div>
  );
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMER_DATA);
  const [selected, setSelected] = useState<Customer>(CUSTOMER_DATA[6]); // RM_550 초기 선택
  const [isNew, setIsNew] = useState(false);

  /** 필드 값 변경 핸들러 — selected 상태 업데이트 */
  const updateField = (key: keyof Customer, value: string) => {
    setSelected((prev) => ({ ...prev, [key]: value }));
  };

  /** 테이블 행 클릭 시 상단 폼에 로드 */
  const handleRowClick = (row: Record<string, unknown>) => {
    const found = customers.find((c) => c.cust_code === row.cust_code);
    if (found) {
      setSelected(found);
      setIsNew(false);
    }
  };

  /** 추가 버튼 — 빈 폼으로 전환 */
  const handleAdd = () => {
    setSelected(emptyCustomer());
    setIsNew(true);
  };

  /** 확인 버튼 — 현재 폼을 목록에 저장 (신규 or 수정) */
  const handleConfirm = () => {
    if (!selected.cust_code.trim()) {
      alert('코드를 입력하세요.');
      return;
    }
    if (isNew) {
      setCustomers((prev) => [...prev, selected]);
      setIsNew(false);
    } else {
      setCustomers((prev) =>
        prev.map((c) => (c.cust_code === selected.cust_code ? selected : c))
      );
    }
  };

  /** 취소 버튼 — 신규 모드 취소 */
  const handleCancel = () => {
    setIsNew(false);
    setSelected(customers[0] ?? emptyCustomer());
  };

  /** 삭제 버튼 — 현재 선택된 거래처 제거 */
  const handleDelete = () => {
    if (!confirm(`${selected.cust_code} 거래처를 삭제하시겠습니까?`)) return;
    setCustomers((prev) => prev.filter((c) => c.cust_code !== selected.cust_code));
    setSelected(customers[0] ?? emptyCustomer());
  };

  return (
    <>
      {/* 상단: 폼 + 작업 버튼 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-900">거래처자료 등록</span>
          <span className="text-xs text-gray-400">(Yu911)</span>
        </div>

        <div className="flex gap-4">
          {/* 좌측 폼 영역 */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Field label="코 드" value={selected.cust_code} onChange={(v) => updateField('cust_code', v)} />
            <Field label="거래구분" value={selected.cust_gubun} onChange={(v) => updateField('cust_gubun', v)} />
            <Field label="사업자번호" value={selected.business_no} onChange={(v) => updateField('business_no', v)} />
            <Field label="종사업장" value="" readOnly />
            <Field label="상 호" value={selected.company_name} onChange={(v) => updateField('company_name', v)} />
            <Field label="상호(약어)" value={selected.sangho} onChange={(v) => updateField('sangho', v)} />
            <Field label="대표자" value={selected.representative} onChange={(v) => updateField('representative', v)} />
            <Field label="주민번호" value="" readOnly />
            <Field label="우편번호" value={selected.zip_code} onChange={(v) => updateField('zip_code', v)} />
            <Field label="업 태" value={selected.business_type} onChange={(v) => updateField('business_type', v)} />
            <div className="col-span-2">
              <Field label="주 소" value={selected.address} onChange={(v) => updateField('address', v)} />
            </div>
            <Field label="종 목" value={selected.business_item} onChange={(v) => updateField('business_item', v)} />
            <Field label="부서명(1)" value="" />
            <Field label="전 화(1)" value={selected.tel_1} onChange={(v) => updateField('tel_1', v)} />
            <Field label="E-Mail(1)" value={selected.email_1} onChange={(v) => updateField('email_1', v)} />
            <Field label="F A X" value={selected.fax} onChange={(v) => updateField('fax', v)} />
            <Field label="담당자(1)" value="" />
            <div className="col-span-2">
              <Field label="비 고(1)" value={selected.remark_1} onChange={(v) => updateField('remark_1', v)} />
            </div>
            <div className="col-span-2">
              <Field label="비 고(2)" value={selected.remark_2} onChange={(v) => updateField('remark_2', v)} />
            </div>
          </div>

          {/* 우측 작업 버튼 */}
          <div className="flex flex-col gap-1.5 w-[130px] shrink-0">
            <Button variant="outline" size="sm" onClick={handleAdd} className="justify-start">
              <PlusIcon className="size-4" /> 추 가
            </Button>
            <Button variant="outline" size="sm" onClick={handleConfirm} className="justify-start">
              <CheckIcon className="size-4" /> 확 인
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel} className="justify-start">
              <XIcon className="size-4" /> 취 소
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="justify-start">
              <Trash2Icon className="size-4" /> 삭 제
            </Button>
            <div className="h-2" />
            <Button variant="outline" size="sm" className="justify-start">
              <EyeIcon className="size-4" /> 미리보기
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <PrinterIcon className="size-4" /> 출 력
            </Button>
            <div className="h-2" />
            <Button variant="outline" size="sm" className="justify-start">
              <LogOutIcon className="size-4" /> 작업종료
            </Button>
          </div>
        </div>
      </div>

      {/* 하단: 거래처 목록 테이블 */}
      <ResizableTable
        tableId="customer-list"
        initialColumns={CUSTOMER_COLUMNS}
        data={toRecord(customers)}
        title={`거래처 목록 (${customers.length}개)`}
        onRowClick={handleRowClick}
      />
    </>
  );
}
