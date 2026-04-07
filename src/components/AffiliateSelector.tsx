/**
 * AffiliateSelector - 계열사 선택 드롭다운 컴포넌트
 *
 * 계열사 목록을 Popover로 표시하고, 선택 시 해당 회사로 전환한다.
 * - affiliates: 계열사 목록 데이터
 * - currentCode: 현재 선택된 거래처 코드
 * - onSelect: 계열사 선택 시 호출되는 콜백 (cust_code 전달)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { BuildingIcon, ChevronDownIcon } from 'lucide-react';

export interface Affiliate {
  cust_code: string;
  sangho: string;
  group_cust: string;
}

interface AffiliateSelectorProps {
  affiliates: Affiliate[];
  currentCode: string;
  onSelect: (code: string) => void;
}

export default function AffiliateSelector({ affiliates, currentCode, onSelect }: AffiliateSelectorProps) {
  const [open, setOpen] = useState(false);

  /** 계열사 항목 클릭 시 선택 처리 후 팝오버 닫기 */
  const handleSelect = (code: string) => {
    onSelect(code);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>
        <BuildingIcon className="size-4" />
        계열사
        <ChevronDownIcon className="size-3 ml-0.5" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-xs font-semibold text-gray-600">
            계열사 목록 ({affiliates.length}개)
          </span>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {affiliates.map((a) => (
            <button
              key={a.cust_code}
              onClick={() => handleSelect(a.cust_code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-between ${
                a.cust_code.trim() === currentCode.trim()
                  ? 'bg-blue-50 font-semibold text-blue-700'
                  : 'text-gray-700'
              }`}
            >
              <span>{a.sangho}</span>
              <span className="text-xs text-gray-400">{a.cust_code.trim()}</span>
            </button>
          ))}
          {affiliates.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-400">계열사 없음</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
