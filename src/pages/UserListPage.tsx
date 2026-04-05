import { useState } from 'react';
import ResizableTable from '@/components/ResizableTable';
import { USER_COLUMNS, USER_DATA, type UserRow } from '@/data/userListData';
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
import { SearchIcon } from 'lucide-react';

function toRecord<T extends object>(arr: T[]): Record<string, unknown>[] {
  return arr as unknown as Record<string, unknown>[];
}

export default function UserListPage() {
  const [search, setSearch] = useState('');
  const [dialogSearch, setDialogSearch] = useState('');

  const handleSearch = () => {
    setSearch(dialogSearch);
  };

  const filteredUsers = USER_DATA.filter((row: UserRow) =>
    Object.values(row).some((v) =>
      String(v ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline" />}
          >
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
              <Button variant="outline" onClick={() => {
                setDialogSearch('');
                setSearch('');
              }}>
                초기화
              </Button>
              <Button onClick={handleSearch}>
                검색
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {search && (
          <span className="text-sm text-blue-600">
            검색어: "{search}"
          </span>
        )}
        <span className="text-sm text-gray-500">총 {filteredUsers.length}명</span>
      </div>
      <ResizableTable
        tableId="user-list"
        initialColumns={USER_COLUMNS}
        data={toRecord(filteredUsers)}
        title={`사용자 목록 (${filteredUsers.length}명)`}
      />
    </>
  );
}
