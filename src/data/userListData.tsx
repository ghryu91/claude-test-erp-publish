import type { ColumnDef } from '../hooks/useResizableColumns';
import { CopyButton } from '@/components/ui/copy-button';

export const USER_COLUMNS: ColumnDef[] = [
  {
    key: 'userId',
    label: '아이디',
    width: 140,
    render: (val) => (
      <span className="flex items-center gap-1">
        <span>{String(val)}</span>
        <CopyButton value={String(val)} />
      </span>
    ),
  },
  { key: 'userName',  label: '사용자명',    width: 90 },
  { key: 'custCode',  label: '업체코드',    width: 90 },
  // { key: 'password',  label: '비밀번호',    width: 90 },
  
  {
    key: 'password',
    label: '비밀번호',
    width: 140,
    render: (val) => (
      <span className="flex items-center gap-1">
        <span>{String(val)}</span>
        <CopyButton value={String(val)} />
      </span>
    ),
  },
  { key: 'position',  label: '직책',        width: 80 },
  { key: 'auth',      label: '권한',        width: 70 },
  {
    key: 'programs',
    label: '프로그램',
    width: 200,
    render: (val) => (
      <span style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        {((val ?? []) as string[]).map((p) => (
          <span
            key={p}
            style={{
              background: '#00bfa5',
              color: '#fff',
              borderRadius: 12,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {p}
          </span>
        ))}
      </span>
    ),
  },
  { key: 'lastLogin', label: '최종 접속일', width: 150 },
  { key: 'phone',     label: '휴대폰',      width: 130 },
];

export interface UserRow {
  userId: string;
  custCode: string;
  userName: string | null;
  password: string | null;
  position: string | null;
  auth: number;
  programs: string[];
  lastLogin: string;
  phone: string | null;
}

// API 응답 → UserRow 변환
export function mapApiUserToRow(apiUser: {
  user_id: string;
  cust_code: string;
  user_name: string | null;
  password: string | null;
  position: string | null;
  authority_code: number;
  last_login_at: string | null;
  phone_number: string | null;
  programs: { program_label: string }[];
}): UserRow {
  return {
    userId: apiUser.user_id,
    custCode: apiUser.cust_code,
    userName: apiUser.user_name,
    password: apiUser.password,
    position: apiUser.position,
    auth: apiUser.authority_code,
    programs: apiUser.programs.map((p) => p.program_label),
    lastLogin: apiUser.last_login_at
      ? apiUser.last_login_at.replace('T', ' ').slice(0, 16)
      : '',
    phone: apiUser.phone_number,
  };
}

export const USER_DATA: UserRow[] = [
  { userId: '081002',    custCode: 'RM_505', userName: '김성국', password: '1234', position: '차장',   auth: 212, programs: ['영업', '모바일'],                          lastLogin: '2026-04-02 15:40', phone: '01028512491' },
  { userId: '100700',    custCode: 'RM_505',    userName: '김성철', password: '0324', position: '이사',   auth: 186, programs: ['영업', '조합/세무', '모바일'],              lastLogin: '2026-03-30 14:38', phone: '01066652767' },
  { userId: '3588',     custCode: 'RM_505',     userName: '전화종', password: '3588', position: '이사',   auth: 120, programs: ['영업'],                                    lastLogin: '2025-02-24 00:00', phone: null },
  { userId: '6472',    custCode: 'RM_505',      userName: '박상무', password: '6472', position: null,     auth: 10,  programs: ['영업', '모바일'],                          lastLogin: '2026-04-03 06:54', phone: null },
  { userId: '관제관리',    custCode: 'RM_505',  userName: null,     password: '1234', position: null,     auth: 10,  programs: ['GPS/RT'],                                  lastLogin: '2026-01-09 00:00', phone: null },
  { userId: '신우출하',    custCode: 'RM_505',  userName: null,     password: '1234', position: null,     auth: 81,  programs: ['출하', 'GPS/RT'],                          lastLogin: '2026-04-03 00:00', phone: null },
  { userId: '전자테스트',    custCode: 'RM_505', userName: '변강옥', password: '1234', position: '과장', auth: 10,  programs: ['영업'],                                    lastLogin: '2017-06-14 00:00', phone: null },
  { userId: 'alstn',    custCode: 'RM_505',     userName: '최민수', password: '1234', position: '차장',   auth: 211, programs: ['영업', '품질', '모바일'],                  lastLogin: '2026-04-03 07:17', phone: '01071111522' },
  { userId: 'ditl2000',    custCode: 'RM_505',  userName: '이재성', password: '1234', position: '영화대표', auth: 70, programs: ['영업', '모바일'],                         lastLogin: '2026-04-03 10:06', phone: '01082518523' },
  { userId: 'gary5078',    custCode: 'RM_505',  userName: '문우진', password: '1234', position: null,     auth: 147, programs: ['출하', '영업', '품질', '조합/세무', 'GPS/RT', '모바일'], lastLogin: '2026-04-03 06:34', phone: '01072405078' },
];
