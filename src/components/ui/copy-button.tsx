/**
 * CopyButton — 클립보드 복사 버튼
 *
 * ⚠️ 클립보드 API의 Secure Context 제약 메모
 * ─────────────────────────────────────────────
 * `navigator.clipboard`는 브라우저가 "secure context"로 판단한 페이지에서만 노출된다.
 *
 *   ✅ 동작함 (secure context)
 *     - https://...                       (모든 HTTPS)
 *     - http://localhost                  (예외적으로 허용)
 *     - http://127.0.0.1                  (예외적으로 허용)
 *
 *   ❌ 동작 안 함 (insecure context → navigator.clipboard === undefined)
 *     - http://135.1.1.119:5173 처럼 LAN IP로 접속한 경우
 *     - http://<도메인> 일반 HTTP 전부
 *
 * 즉, `npm run dev -- --host` 로 띄운 뒤 폰/다른 PC에서 LAN IP로 접속하면
 * `navigator.clipboard.writeText(...)` 호출이 "undefined" 에러로 터진다.
 *
 * 해결: `window.isSecureContext` 로 분기하여,
 *   - secure context  → 표준 `navigator.clipboard.writeText`
 *   - insecure context → 레거시 fallback `document.execCommand('copy')`
 *     (deprecated 이지만 HTTP 환경에서 동작하는 거의 유일한 방법)
 */

import { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        // HTTP(LAN IP) 환경 fallback — execCommand 사용
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center size-5 rounded hover:bg-gray-200 transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
      title="복사"
    >
      {copied ? <CheckIcon className="size-3 text-green-500" /> : <CopyIcon className="size-3" />}
    </button>
  );
}
