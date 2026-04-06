import { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
