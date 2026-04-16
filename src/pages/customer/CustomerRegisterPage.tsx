/**
 * CustomerRegisterPage - 거래처 등록/조회 화면 (검색형)
 *
 * CustomerPage의 변형 — UserListPage 스타일의 검색 컨트롤을 추가하고
 * 상단 폼 카드를 회사 정보 카드 스타일로 변경한 버전.
 * - 상단 컨트롤: 검색 Dialog + 거래처 코드 검색 입력
 * - 폼 카드: 좌측 상단에 코드 뱃지 + 상호 표시 (UserListPage의 회사 정보 카드 스타일)
 * - 우측: 작업 버튼
 * - 하단: 거래처 목록 테이블
 */

import { useEffect, useState } from 'react';
import ResizableTable from '@/components/ResizableTable';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CopyButton } from '@/components/ui/copy-button';
import { CUSTOMER_COLUMNS, CUSTOMER_DATA, type Customer } from '@/data/customerData';
import { CUSTOMER_TYPES, getCustomerTypeLabel } from '@/config/customerType';
import PaginationLinks from '@/components/PaginationLinks';
import api from '@/api/axiosInstance';
import {
  PlusIcon,
  CheckIcon,
  XIcon,
  Trash2Icon,
  EyeIcon,
  PrinterIcon,
  LogOutIcon,
  SearchIcon,
  PencilIcon,
} from 'lucide-react';

/** 빈 거래처 객체 생성 — 신규 추가 시 초기값 */
const emptyCustomer = (): Customer => ({
  cust_code: '',
  company_short_name: '',
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
  customer_type: 2,
  remark_1: '',
  remark_2: '',
});

/** Record 변환 헬퍼 — ResizableTable에 데이터 전달용 */
function toRecord<T extends object>(arr: T[]): Record<string, unknown>[] {
  return arr as unknown as Record<string, unknown>[];
}


/** 입력 필드 컴포넌트 — 라벨 + input */
function Field({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
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
        className={`flex-1 min-w-0 px-2.5 py-1.5 text-xs outline-none ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white focus:bg-blue-50'}`}
      />
    </div>
  );
}

export default function CustomerRegisterPage() {
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMER_DATA);
  const [selected, setSelected] = useState<Customer | null>(CUSTOMER_DATA[6]); // RM_550 초기 선택
  const [isNew, setIsNew] = useState(false);

  // 페이징 상태 — 서버 페이징 (API의 total/total_pages를 신뢰)
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /** 폼 레이아웃 모드 — 디자인 비교용 */
  const [layoutMode, setLayoutMode] = useState<'2col' | '12col' | '8-4'>('12col');

  // 검색 필터 상태
  const [searchWordType, setSearchWordType] = useState<'cust_code' | 'company_name'>('company_name');
  const [searchWord, setSearchWord] = useState('');
  const [filterType, setFilterType] = useState<string>(''); // 거래구분 (gubun)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * API에서 거래처 목록 조회 (서버 페이징)
   *
   * API 응답의 total / total_pages를 그대로 사용한다.
   * 페이지 이동 시 targetPage를 받아 해당 페이지만 조회한다.
   */
  const fetchCustomers = async (targetPage: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page: targetPage,
        size: PAGE_SIZE,
      };
      const word = searchWord.trim();
      if (word) params[searchWordType] = word;
      if (filterType) params.customer_type = filterType;

      const response = await api.get('/customers', { params });
      const json = response.data;
      // API 응답: { items, total, page, size, total_pages }
      const items: Customer[] = json.items ?? json.customers ?? [];
      setCustomers(items);
      setSelected(items[0] ?? null);
      setPage(json?.page ?? targetPage);
      setTotal(json?.total ?? items.length);
      setTotalPages(json?.total_pages ?? 1);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /** 페이지 이동 — 서버에서 해당 페이지 재조회 */
  const handlePageChange = (p: number) => fetchCustomers(p);

  /** 최초 진입 시 거래처 목록 자동 조회 */
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 검색 필터 초기화 */
  const handleResetFilter = () => {
    setSearchWordType('cust_code');
    setSearchWord('');
    setFilterType('');
  };

  // 편집 Dialog 상태
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Customer | null>(null);

  /** 편집 Dialog 열기 — 현재 selected 값을 폼에 복사 */
  const handleOpenEdit = () => {
    if (!selected) return;
    setEditForm({ ...selected });
    setEditOpen(true);
  };

  /** 편집 폼 필드 변경 */
  const updateEditField = (key: keyof Customer, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  /** 편집 저장 — 목록과 selected 모두 갱신 */
  const handleSaveEdit = () => {
    if (!editForm) return;
    if (!editForm.cust_code.trim()) {
      alert('코드를 입력하세요.');
      return;
    }
    setCustomers((prev) =>
      prev.map((c) => (c.cust_code === editForm.cust_code ? editForm : c))
    );
    setSelected(editForm);
    setEditOpen(false);
  };

  /** 필드 값 변경 핸들러 */
  const updateField = (key: keyof Customer, value: string) => {
    setSelected((prev) => (prev ? { ...prev, [key]: value } : prev));
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
    if (!selected) return;
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
    setSelected(customers[0] ?? null);
  };

  /** 삭제 버튼 — 현재 선택된 거래처 제거 */
  const handleDelete = () => {
    if (!selected) return;
    if (!confirm(`${selected.cust_code} 거래처를 삭제하시겠습니까?`)) return;
    setCustomers((prev) => prev.filter((c) => c.cust_code !== selected.cust_code));
    setSelected(customers[0] ?? null);
  };

  return (
    <>
      {/* 검색 필터 패널 */}
      <div className="border-t-4 border-blue-500 rounded-lg bg-white shadow-sm mb-4 p-4">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block w-1 h-4 bg-red-500" />
          <h2 className="text-base font-bold text-gray-900">거래처 검색</h2>
        </div>

        {/* 필터 그리드 */}
        <div className="grid grid-cols-1 gap-2">
          {/* 검색어 (드롭다운 + 입력) */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <div className="w-[110px] min-w-[110px] bg-gray-50 px-3 py-2 text-xs text-gray-600 font-semibold border-r border-gray-200 text-center">
              검색어
            </div>
            <select
              value={searchWordType}
              onChange={(e) => setSearchWordType(e.target.value as 'company_name' | 'cust_code')}
              className="px-2 py-2 text-xs bg-white border-r border-gray-200 outline-none focus:bg-blue-50 cursor-pointer"
            >
              <option value="company_name">거래처 이름</option>
              <option value="cust_code">거래처 코드</option>
            </select>
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
              placeholder={searchWordType === 'cust_code' ? '예: RM_550' : '상호명 (LIKE 검색)'}
              className="flex-1 min-w-0 px-3 py-2 text-xs outline-none bg-white focus:bg-blue-50"
            />
          </div>

          {/* 거래구분 */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <div className="w-[110px] min-w-[110px] bg-gray-50 px-3 py-2 text-xs text-gray-600 font-semibold border-r border-gray-200 text-center">
              거래구분
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 text-xs outline-none bg-white focus:bg-blue-50 cursor-pointer"
            >
              <option value="">전체</option>
              {CUSTOMER_TYPES.map((t) => (
                <option key={t.code} value={t.code}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 검색 버튼 영역 */}
        <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={handleResetFilter} disabled={loading}>
            초기화
          </Button>
          <Button onClick={() => fetchCustomers(1)} disabled={loading} className="bg-gray-800 hover:bg-gray-900">
            {loading ? <Spinner className="size-4" /> : <SearchIcon className="size-4" />}
            {loading ? '검색 중...' : '검색'}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Spinner className="size-3" />
          <span>로딩 중...</span>
        </div>
      )}
      {error && <div className="text-sm text-red-500 mb-2">에러: {error}</div>}

      <div className="text-sm text-gray-500 mb-2">총 {total}개</div>

      {/* 거래처 정보 카드 (회사 정보 카드 스타일) */}
      <div className="border-t-4 border-blue-500 rounded-lg bg-white shadow-sm mb-4 p-4">
        {selected ? (
          <>
            {/* 코드 뱃지 + 상호 + 레이아웃 모드 토글 */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-bold">
                  {selected.cust_code?.trim() || '신규'}
                </span>
                <strong className="text-lg text-gray-900">
                  {selected.company_name || '(신규 거래처)'}
                </strong>
                {selected.cust_code && (
                  <CopyButton value={selected.cust_code.trim()} />
                )}
              </div>

              {/* 레이아웃 모드 토글 (디자인 비교용) */}
              <div className="flex items-center gap-1 border border-gray-200 rounded p-0.5">
                {(['2col', '12col', '8-4'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLayoutMode(mode)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                      layoutMode === mode
                        ? 'bg-blue-500 text-white font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {mode === '2col' ? '2열' : mode === '12col' ? '12열' : '8/4'}
                  </button>
                ))}
              </div>
            </div>

            {/* 폼 + 작업 버튼 */}
            <div className="flex gap-4">
              {/* 좌측 폼 — 레이아웃 모드별 분기 */}
              <div className="flex-1 min-w-0">
                {layoutMode === '2col' && (
                  /* === [모드 1] 2열 고정 그리드 (초기 디자인) === */
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="코 드" value={selected.cust_code} onChange={(v) => updateField('cust_code', v)} />
                    <Field label="거래구분" value={getCustomerTypeLabel(selected.customer_type)} readOnly />
                    <Field label="사업자번호" value={selected.business_no} onChange={(v) => updateField('business_no', v)} />
                    <Field label="종사업장" value="" readOnly />
                    <Field label="상 호" value={selected.company_name} onChange={(v) => updateField('company_name', v)} />
                    <Field label="상호(약어)" value={selected.company_short_name} onChange={(v) => updateField('company_short_name', v)} />
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
                )}

                {layoutMode === '12col' && (
                  /* === [모드 2] 12열 다양한 분할 (4/4/4, 6/6, 3/9 등) === */
                  <div className="grid grid-cols-12 gap-2">
                    {/* 1행: 코드(4) / 거래구분(4) / 사업자번호(4) */}
                    <div className="col-span-4">
                      <Field label="코 드" value={selected.cust_code} onChange={(v) => updateField('cust_code', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="거래구분" value={getCustomerTypeLabel(selected.customer_type)} readOnly />
                    </div>
                    <div className="col-span-4">
                      <Field label="사업자번호" value={selected.business_no} onChange={(v) => updateField('business_no', v)} />
                    </div>

                    {/* 2행: 상호(8) / 상호약어(4) */}
                    <div className="col-span-8">
                      <Field label="상 호" value={selected.company_name} onChange={(v) => updateField('company_name', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="상호(약어)" value={selected.company_short_name} onChange={(v) => updateField('company_short_name', v)} />
                    </div>

                    {/* 3행: 대표자(4) / 주민번호(4) / 종사업장(4) */}
                    <div className="col-span-4">
                      <Field label="대표자" value={selected.representative} onChange={(v) => updateField('representative', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="주민번호" value="" readOnly />
                    </div>
                    <div className="col-span-4">
                      <Field label="종사업장" value="" readOnly />
                    </div>

                    {/* 4행: 우편번호(3) / 주소(9) */}
                    <div className="col-span-3">
                      <Field label="우편번호" value={selected.zip_code} onChange={(v) => updateField('zip_code', v)} />
                    </div>
                    <div className="col-span-9">
                      <Field label="주 소" value={selected.address} onChange={(v) => updateField('address', v)} />
                    </div>

                    {/* 5행: 업태(6) / 종목(6) */}
                    <div className="col-span-6">
                      <Field label="업 태" value={selected.business_type} onChange={(v) => updateField('business_type', v)} />
                    </div>
                    <div className="col-span-6">
                      <Field label="종 목" value={selected.business_item} onChange={(v) => updateField('business_item', v)} />
                    </div>

                    {/* 6행: 전화(4) / FAX(4) / E-Mail(4) */}
                    <div className="col-span-4">
                      <Field label="전 화(1)" value={selected.tel_1} onChange={(v) => updateField('tel_1', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="F A X" value={selected.fax} onChange={(v) => updateField('fax', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="E-Mail(1)" value={selected.email_1} onChange={(v) => updateField('email_1', v)} />
                    </div>

                    {/* 7행: 부서명(6) / 담당자(6) */}
                    <div className="col-span-6">
                      <Field label="부서명(1)" value="" />
                    </div>
                    <div className="col-span-6">
                      <Field label="담당자(1)" value="" />
                    </div>

                    {/* 8~9행: 비고1(12) / 비고2(12) */}
                    <div className="col-span-12">
                      <Field label="비 고(1)" value={selected.remark_1} onChange={(v) => updateField('remark_1', v)} />
                    </div>
                    <div className="col-span-12">
                      <Field label="비 고(2)" value={selected.remark_2} onChange={(v) => updateField('remark_2', v)} />
                    </div>
                  </div>
                )}

                {layoutMode === '8-4' && (
                  /* === [모드 3] 8/4 비율 (메인 정보 8 + 보조 정보 4) === */
                  <div className="grid grid-cols-12 gap-2">
                    {/* 모든 행이 8/4 분할 — 좌측이 주요 필드, 우측이 보조 필드 */}
                    <div className="col-span-8">
                      <Field label="코 드" value={selected.cust_code} onChange={(v) => updateField('cust_code', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="거래구분" value={getCustomerTypeLabel(selected.customer_type)} readOnly />
                    </div>

                    <div className="col-span-8">
                      <Field label="사업자번호" value={selected.business_no} onChange={(v) => updateField('business_no', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="종사업장" value="" readOnly />
                    </div>

                    <div className="col-span-8">
                      <Field label="상 호" value={selected.company_name} onChange={(v) => updateField('company_name', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="상호(약어)" value={selected.company_short_name} onChange={(v) => updateField('company_short_name', v)} />
                    </div>

                    <div className="col-span-8">
                      <Field label="대표자" value={selected.representative} onChange={(v) => updateField('representative', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="주민번호" value="" readOnly />
                    </div>

                    <div className="col-span-8">
                      <Field label="주 소" value={selected.address} onChange={(v) => updateField('address', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="우편번호" value={selected.zip_code} onChange={(v) => updateField('zip_code', v)} />
                    </div>

                    <div className="col-span-8">
                      <Field label="업 태" value={selected.business_type} onChange={(v) => updateField('business_type', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="종 목" value={selected.business_item} onChange={(v) => updateField('business_item', v)} />
                    </div>

                    <div className="col-span-8">
                      <Field label="전 화(1)" value={selected.tel_1} onChange={(v) => updateField('tel_1', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="부서명(1)" value="" />
                    </div>

                    <div className="col-span-8">
                      <Field label="E-Mail(1)" value={selected.email_1} onChange={(v) => updateField('email_1', v)} />
                    </div>
                    <div className="col-span-4">
                      <Field label="담당자(1)" value="" />
                    </div>

                    <div className="col-span-8">
                      <Field label="F A X" value={selected.fax} onChange={(v) => updateField('fax', v)} />
                    </div>
                    <div className="col-span-4" />

                    <div className="col-span-12">
                      <Field label="비 고(1)" value={selected.remark_1} onChange={(v) => updateField('remark_1', v)} />
                    </div>
                    <div className="col-span-12">
                      <Field label="비 고(2)" value={selected.remark_2} onChange={(v) => updateField('remark_2', v)} />
                    </div>
                  </div>
                )}
              </div>

              {/* 우측 작업 버튼 */}
              <div className="flex flex-col gap-1.5 w-[130px] shrink-0">
                <Button variant="outline" size="sm" onClick={handleAdd} className="justify-start">
                  <PlusIcon className="size-4" /> 추 가
                </Button>
                <Button variant="outline" size="sm" onClick={handleOpenEdit} className="justify-start">
                  <PencilIcon className="size-4" /> 편 집
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
          </>
        ) : (
          <div className="text-center py-8 text-sm text-gray-400">
            거래처를 선택하거나 코드를 입력하고 조회하세요.
          </div>
        )}
      </div>

      {/* 하단: 거래처 목록 테이블 */}
      <ResizableTable
        tableId="customer-register-list"
        initialColumns={CUSTOMER_COLUMNS}
        data={toRecord(customers)}
        title={`거래처 목록 (총 ${total}개 · ${page}/${totalPages} 페이지)`}
        onRowClick={handleRowClick}
        loading={loading}
      />

      {/* 페이징 */}
      <PaginationLinks
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-3"
      />

      {/* 편집 Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>거래처 편집</DialogTitle>
            <DialogDescription>
              거래처 정보를 수정한 후 저장 버튼을 누르세요.
            </DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-3 items-center py-2">
              <label className="text-sm text-gray-700">코 드</label>
              <input
                type="text"
                value={editForm.cust_code}
                readOnly
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 outline-none"
              />

              <label className="text-sm text-gray-700">거래구분</label>
              <select
                value={editForm.customer_type}
                onChange={(e) =>
                  setEditForm((prev) => (prev ? { ...prev, customer_type: Number(e.target.value) } : prev))
                }
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors bg-white"
              >
                {CUSTOMER_TYPES.map((t) => (
                  <option key={t.code} value={t.code}>{t.label}</option>
                ))}
              </select>

              <label className="text-sm text-gray-700">상 호</label>
              <input
                type="text"
                value={editForm.company_name}
                onChange={(e) => updateEditField('company_name', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">상호(약어)</label>
              <input
                type="text"
                value={editForm.company_short_name}
                onChange={(e) => updateEditField('company_short_name', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">사업자번호</label>
              <input
                type="text"
                value={editForm.business_no}
                onChange={(e) => updateEditField('business_no', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">대표자</label>
              <input
                type="text"
                value={editForm.representative}
                onChange={(e) => updateEditField('representative', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">우편번호</label>
              <input
                type="text"
                value={editForm.zip_code}
                onChange={(e) => updateEditField('zip_code', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">주 소</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => updateEditField('address', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">업 태</label>
              <input
                type="text"
                value={editForm.business_type}
                onChange={(e) => updateEditField('business_type', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">종 목</label>
              <input
                type="text"
                value={editForm.business_item}
                onChange={(e) => updateEditField('business_item', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">전 화</label>
              <input
                type="text"
                value={editForm.tel_1}
                onChange={(e) => updateEditField('tel_1', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">F A X</label>
              <input
                type="text"
                value={editForm.fax}
                onChange={(e) => updateEditField('fax', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">E-Mail</label>
              <input
                type="text"
                value={editForm.email_1}
                onChange={(e) => updateEditField('email_1', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">비 고(1)</label>
              <input
                type="text"
                value={editForm.remark_1}
                onChange={(e) => updateEditField('remark_1', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />

              <label className="text-sm text-gray-700">비 고(2)</label>
              <input
                type="text"
                value={editForm.remark_2}
                onChange={(e) => updateEditField('remark_2', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveEdit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
