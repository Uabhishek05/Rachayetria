import { useMemo, useState } from 'react';
import { BookCard } from '@/components/books/BookCard';
import { PageTitle } from '@/components/ui/PageTitle';
import { Button } from '@/components/ui/Button';
import { useCatalogData } from '@/hooks/useCatalogData';

export function ExplorePage() {
  const [itemsCount, setItemsCount] = useState(6);
  const { books, loading } = useCatalogData();
  const list = useMemo(() => Array.from({ length: 5 }).flatMap(() => books), [books]);
  const visible = list.slice(0, itemsCount);

  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Explore" subtitle="Books, visuals, and creator clips in one discovery feed." />
      {loading ? <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">Loading books...</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((book, idx) => (
          <BookCard key={book.id + idx.toString()} book={book} />
        ))}
      </div>
      {!loading && visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No books found. Seed Firestore from Admin or check browser blockers.
        </p>
      ) : null}
      <div className="mt-6 flex justify-center">
        <Button variant="ghost" onClick={() => setItemsCount((v) => v + 6)}>
          Load more
        </Button>
      </div>
    </div>
  );
}
