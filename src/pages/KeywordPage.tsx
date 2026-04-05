import { useState } from 'react';
import ResizableTable from '@/components/ResizableTable';
import { KEYWORD_COLUMNS, KEYWORD_DATA, type KeywordRow } from '@/data/keywordData';

function toRecord<T extends object>(arr: T[]): Record<string, unknown>[] {
  return arr as unknown as Record<string, unknown>[];
}

export default function KeywordPage() {
  const [search, setSearch] = useState('');

  const filteredKeywords = KEYWORD_DATA.filter((row: KeywordRow) =>
    Object.values(row).some((v) =>
      String(v ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="검색어, URL, 등록자 등 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
  );
}
