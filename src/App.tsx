import { useState } from 'react';
import UserListPage from '@/pages/UserListPage';
import KeywordPage from '@/pages/KeywordPage';

type TabType = 'user' | 'keyword';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('user');

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
        {activeTab === 'user' && <UserListPage />}
        {activeTab === 'keyword' && <KeywordPage />}
      </main>

      {/* 푸터 */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 bg-white">
        © 2026 ERP SYSTEM
      </footer>
    </div>
  );
}
