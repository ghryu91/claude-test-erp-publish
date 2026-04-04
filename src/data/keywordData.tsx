import type { ColumnDef } from '../hooks/useResizableColumns';

export const KEYWORD_COLUMNS: ColumnDef[] = [
  { key: 'no',        label: 'No.',        width: 60 },
  { key: 'keyword',   label: '검색어',     width: 120 },
  { key: 'url',       label: '검색어 URL', width: 200 },
  { key: 'period',    label: '노출 기간',  width: 190 },
  {
    key: 'isActive',
    label: '사용 여부',
    width: 90,
    render: (val) => (
      <span style={{ color: val === '사용' ? '#1a8a1a' : '#c00', fontWeight: 600 }}>
        {val as string}
      </span>
    ),
  },
  { key: 'createdAt', label: '등록일',  width: 110 },
  { key: 'updatedAt', label: '수정일',  width: 110 },
  { key: 'createdBy', label: '등록자',  width: 80 },
  { key: 'updatedBy', label: '수정자',  width: 80 },
  {
    key: 'actions',
    label: '관리',
    width: 110,
    render: () => (
      <span style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        <button
          style={{ padding: '2px 8px', fontSize: 12, background: '#555', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}
        >
          수정
        </button>
        <button
          style={{ padding: '2px 8px', fontSize: 12, background: '#c00', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}
        >
          삭제
        </button>
      </span>
    ),
  },
];

export interface KeywordRow {
  no: number;
  keyword: string;
  url: string;
  period: string;
  isActive: '사용' | '미사용';
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export const KEYWORD_DATA: KeywordRow[] = [
  { no: 3, keyword: '검색어3', url: '/product/detail/1234567', period: '2020-04-17 ~ 2020-04-18', isActive: '미사용', createdAt: '2020-04-17', updatedAt: '2020-04-15', createdBy: '홍길동', updatedBy: '홍길동' },
  { no: 2, keyword: '검색어1', url: '/product/detail/1234567', period: '2020-04-17 ~ 2020-04-18', isActive: '미사용', createdAt: '2020-04-17', updatedAt: null,         createdBy: '홍길동', updatedBy: null },
  { no: 1, keyword: '검색어1', url: '/product/detail/1234567', period: '2020-04-17 ~ 2020-04-18', isActive: '사용',   createdAt: '2020-04-17', updatedAt: null,         createdBy: '홍길동', updatedBy: null },
];
