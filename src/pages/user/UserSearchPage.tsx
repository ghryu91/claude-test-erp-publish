/**
 * UserSearchPage — 사용자 검색 화면
 *
 * GET /api/v1/users/search API를 사용하여 다중 조건으로 사용자를 검색한다.
 * - 검색 조건: user_name, user_id, cust_code (모두 선택/조합 가능)
 * - 부분 일치 (LIKE 검색)
 * - 결과 테이블은 UserListPage의 USER_COLUMNS 재사용
 */

import { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '@/api/axiosInstance';
import ResizableTable from '@/components/ResizableTable';
import Pagination from '@/components/Pagination';
import { USER_COLUMNS, mapApiUserToRow, type UserRow } from '@/data/userListData';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { SearchIcon } from 'lucide-react';

/** 검색 API 응답 항목 — UserListPage의 ApiUser와 호환되는 형태 */
interface SearchApiUser {
  user_id: string;
  user_name: string | null;
  password: string | null;
  position: string | null;
  authority_code: number;
  last_login_at: string | null;
  phone_number: string | null;
  cust_code: string;
  company_name?: string;
  programs: {
    program_no: number;
    program_path: string | null;
    program_name: string | null;
    user_program_path: string | null;
    user_program_name: string | null;
    program_label: string;
  }[];
}

/** Record<string, unknown>[] 변환 헬퍼 — ResizableTable에 데이터 전달용 */
function toRecord<T extends object>(arr: T[]): Record<string, unknown>[] {
  return arr as unknown as Record<string, unknown>[];
}

type SearchField = 'user_name' | 'user_id';

export default function UserSearchPage() {
  // 검색 조건 상태 — 사용자명/아이디 중 하나 선택
  const [searchField, setSearchField] = useState<SearchField>('user_name');
  const [searchWord, setSearchWord] = useState('');
  const [custCode, setCustCode] = useState('');

  // 결과 상태
  const [users, setUsers] = useState<SearchApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false); // 최초 검색 전/후 구분
  const [exporting, setExporting] = useState(false); // 엑셀 다운로드 중 여부

  // 페이징 상태
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /**
   * 검색 API 호출 — 빈 값은 파라미터에서 제외
   * @param targetPage 페이지 번호 (기본 1)
   * @param targetSize 페이지 크기 (기본 현재 size)
   */
  const handleSearch = async (targetPage: number = 1, targetSize: number = size) => {
    const params: Record<string, string | number> = {
      page: targetPage,
      size: targetSize,
    };
    const word = searchWord.trim();
    if (word) params[searchField] = word;
    if (custCode.trim()) params.cust_code = custCode.trim();

    // 페이징 파라미터를 제외한 실제 검색 조건 유무 확인
    // const hasSearchCondition = !!word || !!custCode.trim();
    // if (!hasSearchCondition) {
    //   setError('하나 이상의 검색 조건을 입력하세요.');
    //   return;
    // }

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/users/search', { params });
      console.log('[UserSearchPage] 응답:', data);

      const rawItems: unknown[] = Array.isArray(data)
        ? data
        : (data?.items ?? data?.users ?? data?.data ?? []);

      // 페이징 메타데이터 갱신
      setPage(data?.page ?? targetPage);
      setSize(data?.size ?? targetSize);
      setTotal(data?.total ?? rawItems.length);
      setTotalPages(data?.total_pages ?? 1);

      // programs 필드가 없을 수 있어 기본값 주입 (mapApiUserToRow 안전화)
      const items: SearchApiUser[] = rawItems.map((raw) => {
        const r = raw as Partial<SearchApiUser>;
        return {
          user_id: r.user_id ?? '',
          user_name: r.user_name ?? null,
          password: r.password ?? null,
          position: r.position ?? null,
          authority_code: r.authority_code ?? 0,
          last_login_at: r.last_login_at ?? null,
          phone_number: r.phone_number ?? null,
          cust_code: r.cust_code,
          company_name: r.company_name,
          programs: r.programs ?? [],
        };
      });

      setUsers(items);
      setSearched(true);
    } catch (error: unknown) {
      console.error('[UserSearchPage] 검색 실패:', error);
      const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
      setError(axiosError.response?.data?.detail || axiosError.message || '검색 실패');
    } finally {
      setLoading(false);
    }
  };

  /** 검색 조건 초기화 */
  const handleReset = () => {
    setSearchField('user_name');
    setSearchWord('');
    setCustCode('');
    setError(null);
  };

  /** 페이지 이동 */
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    handleSearch(p, size);
  };

  /** 페이지 크기 변경 — 1페이지로 이동하여 재검색 */
  const changePageSize = (newSize: number) => {
    handleSearch(1, newSize);
  };

  /**
   * 엑셀 다운로드 — GET /api/v1/users/export
   * 검색 조건은 동일(페이징 제외). 응답을 Blob으로 받아 파일 저장.
   */
  const handleExport = async () => {
    const params: Record<string, string> = {};
    const word = searchWord.trim();
    if (word) params[searchField] = word;
    if (custCode.trim()) params.cust_code = custCode.trim();

    setExporting(true);
    setError(null);
    try {
      // 백엔드가 CSV 텍스트로 응답 → 프론트에서 실제 xlsx 바이너리로 변환
      const response = await api.get('/users/export', {
        params,
        responseType: 'text',
      });

      const csvText = response.data as string;
      // CSV 파싱 → 워크북 생성 → 시트명 지정 → xlsx로 저장
      const wb = XLSX.read(csvText, { type: 'string' });
      const firstSheet = wb.SheetNames[0];
      if (firstSheet && firstSheet !== 'Users') {
        wb.Sheets['Users'] = wb.Sheets[firstSheet];
        wb.SheetNames = ['Users'];
      }

      const filename = `users_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error: unknown) {
      console.error('[UserSearchPage] 엑셀 다운로드 실패:', error);
      const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
      setError(axiosError.response?.data?.detail || axiosError.message || '엑셀 다운로드 실패');
    } finally {
      setExporting(false);
    }
  };

  /** 테이블에 표시할 행 데이터 */
  const rows: UserRow[] = users.map(mapApiUserToRow);

  /** 페이징 컨트롤 — 테이블 위/아래 공통 사용 */
  const pagination = searched && totalPages > 0 && (
    <Pagination
      page={page}
      totalPages={totalPages}
      size={size}
      total={total}
      disabled={loading}
      onPageChange={(p) => goToPage(p)}
      onSizeChange={(s) => changePageSize(s)}
    />
  );

  return (
    <>
      {/* 검색 필터 패널 */}
      <div className="border-t-4 border-blue-500 rounded-lg bg-white shadow-sm mb-4 p-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
          <SearchIcon className="size-4 text-blue-500" />
          <span className="text-sm font-bold text-gray-900">사용자 검색</span>
          <span className="text-xs text-gray-400">GET /api/v1/users/search</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* 검색 구분(사용자명/아이디) + 검색어 — 하나로 묶어서 표시 */}
          <div>
            <label className="block text-xs text-gray-600 font-semibold mb-1">검색 구분</label>
            <div className="flex items-stretch border border-gray-300 rounded overflow-hidden focus-within:border-blue-500">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as SearchField)}
                className="w-[110px] shrink-0 px-2 py-1.5 text-xs border-r border-gray-300 outline-none bg-gray-50 cursor-pointer"
              >
                <option value="user_name">사용자명</option>
                <option value="user_id">아이디</option>
              </select>
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(1, size)}
                placeholder={searchField === 'user_name' ? '예: 기맥' : '예: admin'}
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 font-semibold mb-1">거래처 코드</label>
            <input
              type="text"
              value={custCode}
              onChange={(e) => setCustCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(1, size)}
              placeholder="예: RM_000"
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            초기화
          </Button>
          <Button onClick={() => handleSearch(1, size)} disabled={loading} className="bg-gray-800 hover:bg-gray-900">
            {loading ? <Spinner className="size-4" /> : <SearchIcon className="size-4" />}
            {loading ? '검색 중...' : '검색'}
          </Button>
        </div>
      </div>

      {/* 상태 표시 */}
      {error && <div className="text-sm text-red-500 mb-2">에러: {error}</div>}
      {searched && !loading && (
        <div className="text-sm text-gray-500 mb-2">검색 결과 {rows.length}명</div>
      )}

      {/* 페이징 컨트롤 (상단) */}
      {pagination && <div className="mb-2">{pagination}</div>}

      {/* 결과 테이블 */}
      <ResizableTable
        tableId="user-search-list"
        initialColumns={USER_COLUMNS}
        data={toRecord(rows)}
        title={`사용자 검색 결과 (총 ${total}명)`}
        loading={loading}
        onExcelDownload={handleExport}
        exporting={exporting}
      />

      {/* 페이징 컨트롤 (하단) */}
      {pagination && <div className="mt-3">{pagination}</div>}
    </>
  );
}
