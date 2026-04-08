/**
 * RemoteDbQueryPage — 원격 DB 쿼리 테스트 페이지
 *
 * POST /api/v1/remote-db/query 엔드포인트에 임의의 SELECT 쿼리를 던지고
 * 응답을 표 형태로 보여주는 단순 디버그 화면.
 *
 * Body: { query, server, database }
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function RemoteDbQueryPage() {
  const [query, setQuery] = useState('SELECT TOP 10 * FROM INFORMATION_SCHEMA.TABLES');
  const [server, setServer] = useState('DBSer2');
  const [database, setDatabase] = useState('RA_141');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  /** API 호출 — POST /api/v1/remote-db/query */
  const runQuery = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/v1/remote-db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, server, database }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const data = await res.json();
      setResult(data);
      console.log(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /** 결과에서 행 배열 추출 — { rows } | { items } | 배열 자체 모두 대응 */
  const rows: Record<string, unknown>[] = (() => {
    if (!result) return [];
    if (Array.isArray(result)) return result as Record<string, unknown>[];
    const r = result as Record<string, unknown>;
    if (Array.isArray(r.rows)) return r.rows as Record<string, unknown>[];
    if (Array.isArray(r.items)) return r.items as Record<string, unknown>[];
    if (Array.isArray(r.data)) return r.data as Record<string, unknown>[];
    return [];
  })();

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <>
      {/* 상단: 입력 폼 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-900">원격 DB 쿼리 테스트</span>
          <span className="text-xs text-gray-400">POST /api/v1/remote-db/query</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-600 font-semibold mb-1">서버 (server)</label>
            <input
              type="text"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 font-semibold mb-1">DB (database)</label>
            <input
              type="text"
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-600 font-semibold mb-1">쿼리 (query)</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="w-full px-2.5 py-1.5 text-xs font-mono border border-gray-300 rounded outline-none focus:border-blue-500"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={runQuery} disabled={loading} className="bg-gray-800 hover:bg-gray-900">
            {loading ? '실행 중...' : '쿼리 실행'}
          </Button>
          {error && <span className="text-xs text-red-600">에러: {error}</span>}
          {!error && rows.length > 0 && (
            <span className="text-xs text-gray-500">{rows.length}개 행</span>
          )}
        </div>
      </div>

      {/* 결과: 테이블 */}
      {rows.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-2.5 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
                    {columns.map((col) => (
                      <td key={col} className="px-2.5 py-1.5 text-gray-800 whitespace-nowrap">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 결과: Raw JSON */}
      {result !== null && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-700 mb-2">Raw Response</div>
          <pre className="text-[11px] font-mono text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto max-h-[300px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}
