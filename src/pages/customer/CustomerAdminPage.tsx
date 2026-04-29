/**
 * CustomerAdminPage - 거래처 마스터 CRUD (PostgreSQL master DB)
 *
 * API: /api/v1/admin/customers (슈퍼관리자 전용)
 * - GET    목록 (page, page_size, search, search_field, only_root, parent_code)
 * - POST   등록
 * - PATCH  수정 (cust_code 불가)
 * - DELETE soft delete (하위 계열사 있으면 400)
 *
 * 구성:
 * - 상단: 검색 패널 (검색어/필드, only_root, parent_code)
 * - 중단: 거래처 상세 폼 + 작업 버튼 (추가/저장/취소/삭제)
 * - 하단: ResizableTable (컬럼 커스터마이즈 가능)
 */

import { useEffect, useState } from 'react';
import type { ColumnDef } from '@/hooks/useResizableColumns';
import ResizableTable from '@/components/ResizableTable';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CopyButton } from '@/components/ui/copy-button';
import api from '@/api/axiosInstance';
import {
  PlusIcon,
  CheckIcon,
  XIcon,
  Trash2Icon,
  SearchIcon,
  RefreshCwIcon,
} from 'lucide-react';

/** 거래처 DTO — handoff 문서의 CustomerResponse와 동일 */
interface Customer {
  code: string;
  name: string;
  parent_code: string | null;
  business_number: string | null;
  representative: string | null;
  zip_code: string | null;
  address_main: string | null;
  address_detail: string | null;
  tel: string | null;
  email: string | null;
  is_active: boolean;
  created_at?: string;
  created_by_name?: string | null;
  updated_at?: string;
  updated_by_name?: string | null;
}

/** 빈 거래처 — 신규 등록 시 초기값 */
const emptyCustomer = (): Customer => ({
  code: '',
  name: '',
  parent_code: null,
  business_number: '',
  representative: '',
  zip_code: '',
  address_main: '',
  address_detail: '',
  tel: '',
  email: '',
  is_active: true,
});

/** 테이블 컬럼 정의 — ResizableTable에서 순서/너비 조정 가능 */
const CUSTOMER_COLUMNS: ColumnDef[] = [
  { key: 'code', label: '코드', width: 120 },
  { key: 'name', label: '상호', width: 240 },
  { key: 'parent.code', label: '상위', width: 110,
    render: (_val, row) => {
        const parent = row.parent as { code?: string; name?: string } | null;
       if (!parent) return '-';
       return (
         <span>
           <span className="font-mono text-gray-500">{parent.code}</span>
           <span className="ml-2">{parent.name}</span>
         </span>
       );
     },
   },
   
  { key: 'business_number', label: '사업자번호', width: 140 },
  { key: 'representative', label: '대표자', width: 110 },
  { key: 'tel', label: '전화', width: 130 },
  { key: 'email', label: 'E-Mail', width: 200 },
  { key: 'zip_code', label: '우편번호', width: 90 },
  { key: 'address_main', label: '주소', width: 280 },
  { key: 'address_detail', label: '상세주소', width: 160 },
  {
    key: 'is_active',
    label: '활성',
    width: 70,
    render: (v) => (v ? '사용' : '—'),
  },
  { key: 'updated_at', label: '수정일', width: 160, render: (v) => (v ? String(v).slice(0, 19).replace('T', ' ') : '') },
];

/** Record 변환 헬퍼 — ResizableTable에 전달용 */
function toRecord<T extends object>(arr: T[]): Record<string, unknown>[] {
  return arr as unknown as Record<string, unknown>[];
}

/** 라벨 + input 필드 — 좌측 라벨 박스 스타일 */
function Field({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded overflow-hidden">
      <div className="w-[100px] min-w-[100px] bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 font-semibold border-r border-gray-200 text-center">
        {label}
      </div>
      <input
        type="text"
        value={value ?? ''}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={`flex-1 min-w-0 px-2.5 py-1.5 text-xs outline-none ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white focus:bg-blue-50'}`}
      />
    </div>
  );
}

/** API 에러 메시지 추출 */
function extractErrorMessage(err: unknown, fallback = '요청 실패'): string {
  const error = err as { response?: { data?: { detail?: unknown } }; message?: string };
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail) return JSON.stringify(detail);
  return error?.message ?? fallback;
}

export default function CustomerAdminPage() {
  // 목록/페이징
  const [list, setList] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / size));

  /** 페이지네이션 스타일 — 'links'(숫자링크) / 'full'(크기선택 포함) */
  const [paginationVariant, setPaginationVariant] = useState<'links' | 'full'>('full');

  // 선택/편집 상태
  const [selected, setSelected] = useState<Customer | null>(null);
  const [isNew, setIsNew] = useState(false);

  // 검색 상태
  const [searchField, setSearchField] = useState<'all' | 'cust_code' | 'company_name'>('all');
  const [searchWord, setSearchWord] = useState('');
  const [onlyRoot, setOnlyRoot] = useState(false);
  const [parentCode, setParentCode] = useState('');

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 목록 조회 — 서버 페이징 */
  const fetchList = async (targetPage = 1, targetSize: number = size) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | boolean> = {
        page: targetPage,
        page_size: targetSize,
      };
      const word = searchWord.trim();
      if (word) {
        params.search = word;
        params.search_field = searchField;
      }
      if (onlyRoot) {
        params.only_root = true;
      } else if (parentCode.trim()) {
        params.parent_code = parentCode.trim();
      }

      const { data } = await api.get('/admin/companies', { params });
      const items: Customer[] = data?.items ?? [];
      setList(items);
      setTotal(data?.total ?? items.length);
      setPage(targetPage);
      setSize(targetSize);
      if (items.length > 0) {
        setSelected(items[0]);
        setIsNew(false);
      } else {
        setSelected(null);
      }
    } catch (err) {
      setError(extractErrorMessage(err, '목록 조회 실패'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 검색 초기화 */
  const handleResetFilter = () => {
    setSearchField('all');
    setSearchWord('');
    setOnlyRoot(false);
    setParentCode('');
  };

  /** 행 클릭 — 상세 폼에 로드 */
  const handleRowClick = (row: Record<string, unknown>) => {
    const found = list.find((c) => c.code === row.code);
    if (found) {
      setSelected(found);
      setIsNew(false);
    }
  };

  /** 추가 — 빈 폼 전환 */
  const handleAdd = () => {
    setSelected(emptyCustomer());
    setIsNew(true);
  };

  /** 취소 — 신규 모드 해제, 첫 행 복귀 */
  const handleCancel = () => {
    setIsNew(false);
    setSelected(list[0] ?? null);
  };

  /** 필드 업데이트 */
  const updateField = <K extends keyof Customer>(key: K, value: Customer[K]) => {
    setSelected((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  /** 저장 — 신규면 POST, 기존이면 PATCH */
  const handleSave = async () => {
    if (!selected) return;
    const code = selected.code.trim();
    if (!code) {
      alert('거래처 코드를 입력하세요.');
      return;
    }
    if (!selected.name.trim()) {
      alert('상호를 입력하세요.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const payload = {
          ...selected,
          code: code,
          parent_code: selected.parent_code?.trim() || null,
        };
        await api.post('/admin/customers', payload);
      } else {
        // PATCH — code 제외
        const { code: _omit, created_at, created_by_name, updated_at, updated_by_name, ...rest } = selected;
        void _omit; void created_at; void created_by_name; void updated_at; void updated_by_name;
        const payload = {
          ...rest,
          parent_code: rest.parent_code?.trim() ? rest.parent_code.trim() : null,
        };
        await api.patch(`/admin/customers/${encodeURIComponent(code)}`, payload);
      }
      await fetchList(isNew ? 1 : page);
      setIsNew(false);
    } catch (err) {
      setError(extractErrorMessage(err, '저장 실패'));
    } finally {
      setSaving(false);
    }
  };

  /** 삭제 — soft delete */
  const handleDelete = async () => {
    if (!selected || isNew) return;
    const code = selected.code.trim();
    if (!code) return;
    if (!confirm(`[${code}] ${selected.name} 거래처를 삭제하시겠습니까?`)) return;
    setSaving(true);
    setError(null);
    try {
      await api.delete(`/admin/customers/${encodeURIComponent(code)}`);
      await fetchList(page);
    } catch (err) {
      setError(extractErrorMessage(err, '삭제 실패'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* 검색 패널 */}
      <div className="border-t-4 border-blue-500 rounded-lg bg-white shadow-sm mb-4 p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block w-1 h-4 bg-red-500" />
          <h2 className="text-base font-bold text-gray-900">거래처 관리 (PG 마스터)</h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* 검색어 + 필드 */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <div className="w-[110px] min-w-[110px] bg-gray-50 px-3 py-2 text-xs text-gray-600 font-semibold border-r border-gray-200 text-center">
              검색어
            </div>
            <select
              value={searchField}
              onChange={(event) => setSearchField(event.target.value as typeof searchField)}
              className="px-2 py-2 text-xs bg-white border-r border-gray-200 outline-none focus:bg-blue-50 cursor-pointer"
            >
              <option value="all">전체</option>
              <option value="company_name">상호</option>
              <option value="code">코드</option>
            </select>
            <input
              type="text"
              value={searchWord}
              onChange={(event) => setSearchWord(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && fetchList(1)}
              placeholder="부분일치 검색"
              className="flex-1 min-w-0 px-3 py-2 text-xs outline-none bg-white focus:bg-blue-50"
            />
          </div>

          {/* only_root + parent_code */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded text-xs text-gray-700 bg-white cursor-pointer">
              <input
                type="checkbox"
                checked={onlyRoot}
                onChange={(event) => {
                  setOnlyRoot(event.target.checked);
                  if (event.target.checked) setParentCode('');
                }}
              />
              최상위(parent 없음)만
            </label>
            <div className="flex-1 flex items-center border border-gray-200 rounded overflow-hidden">
              <div className="w-[110px] min-w-[110px] bg-gray-50 px-3 py-2 text-xs text-gray-600 font-semibold border-r border-gray-200 text-center">
                상위 코드
              </div>
              <input
                type="text"
                value={parentCode}
                onChange={(event) => setParentCode(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && fetchList(1)}
                disabled={onlyRoot}
                placeholder="parent_code 지정 시 직속 자회사만"
                className="flex-1 min-w-0 px-3 py-2 text-xs outline-none bg-white focus:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={handleResetFilter} disabled={loading}>
            <RefreshCwIcon className="size-4" /> 초기화
          </Button>
          <Button onClick={() => fetchList(1)} disabled={loading} className="bg-gray-800 hover:bg-gray-900">
            {loading ? <Spinner className="size-4" /> : <SearchIcon className="size-4" />}
            {loading ? '검색 중...' : '검색'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-2">
          {error}
        </div>
      )}
      <div className="text-sm text-gray-500 mb-2">총 {total}개</div>

      {/* 상세 카드 */}
      <div className="border-t-4 border-blue-500 rounded-lg bg-white shadow-sm mb-4 p-4">
        {selected ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded text-xs font-bold text-white ${isNew ? 'bg-green-500' : 'bg-blue-500'}`}>
                  {isNew ? '신규' : selected.code?.trim() || '—'}
                </span>
                <strong className="text-lg text-gray-900">
                  {selected.name || '(신규 거래처)'}
                </strong>
                {!isNew && selected.code && <CopyButton value={selected.code.trim()} />}
                {!selected.is_active && !isNew && (
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">비활성</span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              {/* 폼 */}
              <div className="flex-1 min-w-0 grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <Field
                    label="코 드 *"
                    value={selected.code}
                    onChange={(v) => updateField('code', v)}
                    readOnly={!isNew}
                    placeholder="1~20자, 앞뒤 공백 금지"
                  />
                </div>
                <div className="col-span-4">
                  <Field
                    label="상위코드"
                    value={selected.parent_code ?? ''}
                    onChange={(v) => updateField('parent_code', v || null)}
                    placeholder="null = 최상위"
                  />
                </div>
                <div className="col-span-4">
                  <div className="flex items-center border border-gray-200 rounded overflow-hidden h-full">
                    <div className="w-[100px] min-w-[100px] bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 font-semibold border-r border-gray-200 text-center">
                      활성여부
                    </div>
                    <label className="flex-1 flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.is_active}
                        onChange={(event) => updateField('is_active', event.target.checked)}
                      />
                      {selected.is_active ? '활성' : '비활성'}
                    </label>
                  </div>
                </div>

                <div className="col-span-8">
                  <Field
                    label="상 호 *"
                    value={selected.name}
                    onChange={(v) => updateField('company_name', v)}
                  />
                </div>
                <div className="col-span-4">
                  <Field
                    label="사업자번호"
                    value={selected.business_number ?? ''}
                    onChange={(v) => updateField('business_number', v)}
                  />
                </div>

                <div className="col-span-4">
                  <Field
                    label="대표자"
                    value={selected.representative ?? ''}
                    onChange={(v) => updateField('representative', v)}
                  />
                </div>
                <div className="col-span-4">
                  <Field
                    label="전 화"
                    value={selected.tel ?? ''}
                    onChange={(v) => updateField('tel', v)}
                  />
                </div>
                <div className="col-span-4">
                  <Field
                    label="E-Mail"
                    value={selected.email ?? ''}
                    onChange={(v) => updateField('email', v)}
                  />
                </div>

                <div className="col-span-3">
                  <Field
                    label="우편번호"
                    value={selected.zip_code ?? ''}
                    onChange={(v) => updateField('zip_code', v)}
                    placeholder="5자리"
                  />
                </div>
                <div className="col-span-9">
                  <Field
                    label="주 소"
                    value={selected.address_main ?? ''}
                    onChange={(v) => updateField('address_main', v)}
                    placeholder="도로명 + 건물번호"
                  />
                </div>

                <div className="col-span-12">
                  <Field
                    label="상세주소"
                    value={selected.address_detail ?? ''}
                    onChange={(v) => updateField('address_detail', v)}
                    placeholder="층/호수 등"
                  />
                </div>

                {!isNew && (selected.created_at || selected.updated_at) && (
                  <div className="col-span-12 text-xs text-gray-500 pt-1">
                    {selected.created_at && (
                      <span>등록: {String(selected.created_at).slice(0, 19).replace('T', ' ')} ({selected.created_by_name ?? '—'})</span>
                    )}
                    {selected.updated_at && (
                      <span className="ml-4">수정: {String(selected.updated_at).slice(0, 19).replace('T', ' ')} ({selected.updated_by_name ?? '—'})</span>
                    )}
                  </div>
                )}
              </div>

              {/* 작업 버튼 */}
              <div className="flex flex-col gap-1.5 w-[130px] shrink-0">
                <Button variant="outline" size="sm" onClick={handleAdd} disabled={saving} className="justify-start">
                  <PlusIcon className="size-4" /> 추 가
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="justify-start">
                  {saving ? <Spinner className="size-4" /> : <CheckIcon className="size-4" />} 저 장
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving} className="justify-start">
                  <XIcon className="size-4" /> 취 소
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving || isNew} className="justify-start">
                  <Trash2Icon className="size-4" /> 삭 제
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-sm text-gray-400">
            거래처를 선택하거나 [추 가] 버튼을 눌러 신규 등록하세요.
          </div>
        )}
      </div>

      {/* 페이지네이션 스타일 토글 */}
      <div className="flex items-center justify-end gap-1 mb-2 text-xs">
        <span className="text-gray-500 mr-1">페이징 스타일:</span>
        {(['links', 'full'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setPaginationVariant(v)}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              paginationVariant === v
                ? 'bg-blue-500 text-white border-blue-500 font-semibold'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {v === 'links' ? '숫자링크' : '크기선택 포함'}
          </button>
        ))}
      </div>

      {/* 거래처 목록 테이블 — ResizableTable 내부 pagination 설정 */}
      <ResizableTable
        tableId="customer-admin-list"
        initialColumns={CUSTOMER_COLUMNS}
        data={toRecord(list)}
        title={`거래처 목록 (총 ${total}개 · ${page}/${totalPages} 페이지)`}
        onRowClick={handleRowClick}
        loading={loading}
        paginationPosition="both"
        pagination={
          paginationVariant === 'links'
            ? {
                variant: 'links',
                page,
                totalPages,
                onPageChange: (p) => fetchList(p, size),
              }
            : {
                variant: 'full',
                page,
                totalPages,
                size,
                total,
                disabled: loading,
                unit: '개',
                onPageChange: (p) => fetchList(p, size),
                onSizeChange: (s) => fetchList(1, s),
              }
        }
      />
    </>
  );
}
