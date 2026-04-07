import { useState, useEffect } from 'react';
import ResizableTable from '@/components/ResizableTable';
import { USER_COLUMNS, mapApiUserToRow, type UserRow } from '@/data/userListData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import AffiliateSelector, { type Affiliate } from '@/components/AffiliateSelector';
import { CopyButton } from '@/components/ui/copy-button';
import { SearchIcon, DatabaseIcon, HardDriveIcon } from 'lucide-react';
import { MOCK_MASTER_DATA, MOCK_AFFILIATES_DATA } from '@/data/mockCompanyData';

const API_BASE = '/api/v1/master';
const AFFILIATES_API = '/api/v1/affiliates';

/** Record<string, unknown>[] 변환 헬퍼 — ResizableTable에 데이터 전달용 */
function toRecord<T extends object>(arr: T[]): Record<string, unknown>[] {
  return arr as unknown as Record<string, unknown>[];
}

interface CompanyInfo {
  cust_code: string;
  company_name: string;
  address: string;
  representative: string;
  business_no: string;
  business_type: string;
  business_item: string;
  tel_1: string;
  fax: string;
  email_1: string;
  remark_1: string;
}

interface ApiUser {
  user_id: string;
  user_name: string | null;
  password: string | null;
  position: string | null;
  authority_code: number;
  last_login_at: string | null;
  phone_number: string | null;
  programs: {
    program_no: number;
    program_path: string | null;
    program_name: string | null;
    user_program_path: string | null;
    user_program_name: string | null;
    program_label: string;
  }[];
}

/**
 * UserListPage - 사용자 목록 화면
 *
 * 거래처 코드로 조회하면 회사 정보 + 사용자 목록 + 프로그램 상세를 표시한다.
 * Mock/API 모드 전환 가능. 조회 시 계열사 목록도 함께 로딩된다.
 */
export default function UserListPage() {
  const [search, setSearch] = useState('');
  const [dialogSearch, setDialogSearch] = useState('');
  const [useApi, setUseApi] = useState(true);
  const [apiData, setApiData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [searchCode, setSearchCode] = useState('RM_55C');
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);

  /** API/Mock 응답 데이터를 상태에 반영 */
  const loadData = (json: { company: CompanyInfo; users: ApiUser[] }) => {
    setCompany(json.company);
    setApiUsers(json.users);
    setSelectedUser(json.users[0] || null);
    setApiData(json.users.map(mapApiUserToRow));
  };

  /** 거래처 데이터 + 계열사 목록을 함께 조회 */
  const fetchAll = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (useApi) {
        const [masterRes, affRes] = await Promise.all([
          fetch(`${API_BASE}/${code.trim()}`),
          fetch(`${AFFILIATES_API}/${code.trim()}`),
        ]);
        if (!masterRes.ok) throw new Error(`HTTP ${masterRes.status}`);
        const masterJson = await masterRes.json();
        loadData(masterJson);

        if (affRes.ok) {
          const affJson = await affRes.json();
          setAffiliates(affJson.affiliates);
        }
      } else {
        loadData(MOCK_MASTER_DATA as { company: CompanyInfo; users: ApiUser[] });
        setAffiliates(MOCK_AFFILIATES_DATA.affiliates);
      }
    } catch (err) {
      setError((err as Error).message);
      setCompany(null);
      setApiUsers([]);
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  /** 계열사 선택 시 해당 회사 데이터 조회 */
  const handleSelectAffiliate = (code: string) => {
    setSearchCode(code);
    fetchAll(code);
  };

  // useApi 모드 변경 시 자동 조회
  useEffect(() => {
    fetchAll(searchCode);
  }, [useApi]);

  /** 사용자 필터 검색 적용 */
  const handleSearch = () => {
    setSearch(dialogSearch);
  };

  const data = apiData;

  const filteredUsers = data.filter((row: UserRow) =>
    Object.values(row).some((v) =>
      String(v ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  /** 테이블 행 클릭 시 프로그램 상세 패널에 해당 사용자 표시 */
  const handleRowClick = (row: Record<string, unknown>) => {
    const user = apiUsers.find((u) => u.user_id === row.userId);
    if (user) setSelectedUser(user);
  };

  return (
    <>
      {/* 상단 컨트롤 */}
      <div className="flex items-center gap-3 mb-4">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            <SearchIcon className="size-4" />
            검색
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>사용자 검색</DialogTitle>
              <DialogDescription>
                아이디, 이름, 프로그램 등으로 검색할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              value={dialogSearch}
              onChange={(e) => setDialogSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogSearch(''); setSearch(''); }}>
                초기화
              </Button>
              <Button onClick={handleSearch}>검색</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant={useApi ? 'default' : 'outline'}
          onClick={() => setUseApi(!useApi)}
        >
          {useApi ? <DatabaseIcon className="size-4" /> : <HardDriveIcon className="size-4" />}
          {useApi ? 'API 데이터' : 'Mock 데이터'}
        </Button>

        {/* 거래처 코드 검색 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="거래처 코드 (예: RM_55C)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAll(searchCode)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
          />
          <AffiliateSelector
            affiliates={affiliates}
            currentCode={searchCode}
            onSelect={handleSelectAffiliate}
          />
          <Button onClick={() => fetchAll(searchCode)}>조회</Button>
        </div>

        {search && (
          <span className="text-sm text-blue-600">검색어: &quot;{search}&quot;</span>
        )}
        <span className="text-sm text-gray-500">총 {filteredUsers.length}명</span>
      </div>

      {loading && <div className="text-sm text-gray-500 mb-4">로딩 중...</div>}
      {error && <div className="text-sm text-red-500 mb-4">에러: {error}</div>}

      {/* 회사 정보 카드 */}
      <div className="border-t-4 border-blue-500 rounded-lg bg-white shadow-sm mb-4 p-4">
        {company ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-bold">
                  {company.cust_code?.trim()}
                </span>
                <CopyButton value={company.cust_code?.trim() ?? ''} />
                <strong className="text-lg text-gray-900">{company.company_name}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 border border-gray-200 rounded-md overflow-hidden text-sm">
              {[
                { label: '상 호', value: company.company_name },
                { label: '사업자번호', value: company.business_no },
                { label: '주 소', value: company.address },
                { label: '대표자', value: company.representative },
                { label: '전 화', value: company.tel_1 },
                { label: '업 태', value: company.business_type },
                { label: '팩 스', value: company.fax },
                { label: '종 목', value: company.business_item },
                { label: '이메일', value: company.email_1 },
                { label: '비 고', value: company.remark_1 },
              ].map((item, i) => (
                <div key={i} className={`flex ${i < 8 ? 'border-b border-gray-200' : ''} ${i % 2 === 0 ? 'border-r border-gray-200' : ''}`}>
                  <div className="w-[90px] min-w-[90px] bg-gray-50 px-2.5 py-1.5 text-gray-500 font-semibold border-r border-gray-200 text-center">
                    {item.label}
                  </div>
                  <div className="px-3 py-1.5 text-gray-900 flex-1">
                    {item.value || '-'}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-sm text-gray-400">
            거래처 정보가 없습니다. 거래처 코드를 입력하고 조회하세요.
          </div>
        )}
      </div>

      {/* 사용자 목록 + 프로그램 상세 */}
      <div className="grid grid-cols-[1fr_350px] gap-4 items-start">
        {/* 사용자 목록 테이블 */}
        <div className="overflow-hidden min-w-0">
          <ResizableTable
            tableId="user-list"
            initialColumns={USER_COLUMNS}
            data={toRecord(filteredUsers)}
            title={`사용자 목록 (${filteredUsers.length}명)`}
            onRowClick={handleRowClick}
          />
        </div>

        {/* 프로그램 상세 패널 */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-[500px] overflow-y-auto">
          <h3 className="font-bold text-sm text-gray-900 mb-3">접속 프로그램 상세</h3>

          {selectedUser ? (
            <>
              {/* 선택 유저 헤더 */}
              <div className="flex items-center gap-3 bg-white rounded-lg border border-blue-200 p-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {(selectedUser.user_name || selectedUser.user_id).charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">{selectedUser.user_id}</div>
                  <div className="text-xs text-gray-500">
                    {selectedUser.user_name || '이름없음'}
                    {selectedUser.position && ` · ${selectedUser.position}`}
                  </div>
                </div>
              </div>

              {/* 프로그램 뱃지 */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedUser.programs.map((pgm, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-600 border border-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {pgm.program_label}
                  </span>
                ))}
              </div>

              {/* 프로그램 상세 카드 */}
              {selectedUser.programs.map((pgm, i) => (
                <div key={i} className="bg-white border border-emerald-200 border-l-[3px] border-l-emerald-500 rounded-md p-2.5 mb-2 text-xs">
                  <div className="font-bold text-emerald-800 mb-1.5">
                    <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                      {pgm.program_label}
                    </span>
                    {pgm.program_name || '기본 프로그램'}
                  </div>
                  <div className="text-gray-500 leading-relaxed">
                    <div><span className="inline-block w-[50px] text-gray-400">서버</span>{pgm.program_path || '-'}</div>
                    <div><span className="inline-block w-[50px] text-gray-400">로컬</span>{pgm.user_program_path || '-'}</div>
                  </div>
                </div>
              ))}

              {selectedUser.programs.length === 0 && (
                <div className="text-center py-10 text-gray-400">등록된 프로그램이 없습니다.</div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-sm text-gray-400">
              사용자를 선택하면 프로그램 상세가 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
