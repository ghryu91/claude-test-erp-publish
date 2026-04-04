import { useState } from 'react';
import ResizableTable from './components/ResizableTable';
import { USER_COLUMNS, USER_DATA, type UserRow } from './data/userListData';
import { KEYWORD_COLUMNS, KEYWORD_DATA, type KeywordRow } from './data/keywordData';

type TabType = 'user' | 'keyword';

function toRecord<T extends object>(arr: T[]): Record<string, unknown>[] {
  return arr as unknown as Record<string, unknown>[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('user');
  const [userSearch, setUserSearch] = useState('');
  const [keywordSearch, setKeywordSearch] = useState('');

  const filteredUsers = USER_DATA.filter((row: UserRow) =>
    Object.values(row).some((v) =>
      String(v ?? '').toLowerCase().includes(userSearch.toLowerCase())
    )
  );

  const filteredKeywords = KEYWORD_DATA.filter((row: KeywordRow) =>
    Object.values(row).some((v) =>
      String(v ?? '').toLowerCase().includes(keywordSearch.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 헤더 */}
      <header className="bg-[#1a2e4a] text-white h-14 flex items-center px-6 gap-8 shrink-0">
        <h1 className="text-lg font-bold tracking-widest">ERP SYSTEM</h1>
        <nav className="flex gap-1">
          {(['user', 'keyword'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded text-sm transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab === 'user' ? '사용자 목록' : '기본 검색어 관리'}
            </button>
          ))}
        </nav>
      </header>

      {/* 본문 */}
      <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
        {activeTab === 'user' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="아이디, 이름, 프로그램 등 검색..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="max-w-sm w-full px-3.5 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-sm text-gray-500">총 {filteredUsers.length}명</span>
            </div>
            <ResizableTable
              tableId="user-list"
              initialColumns={USER_COLUMNS}
              data={toRecord(filteredUsers)}
              title={`사용자 목록 (${filteredUsers.length}명)`}
            />
          </>
        )}

        {activeTab === 'keyword' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="검색어, URL, 등록자 등 검색..."
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                className="max-w-sm w-full px-3.5 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-sm text-gray-500">총 {filteredKeywords.length}건</span>
            </div>
            <ResizableTable
              tableId="keyword-list"
              initialColumns={KEYWORD_COLUMNS}
              data={toRecord(filteredKeywords)}
              title="기본 검색어 관리"
            />
          </>
        )}
      </main>

      {/* 푸터 */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 bg-white">
        © 2026 ERP SYSTEM
      </footer>
    </div>
  );
}
