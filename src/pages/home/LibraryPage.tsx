import { BookCard } from '@/components/books/BookCard';
import { PageTitle } from '@/components/ui/PageTitle';
import { useCatalogData } from '@/hooks/useCatalogData';

export function LibraryPage() {
  const { books, loading } = useCatalogData();

  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Library" subtitle="Saved books, current streaks, and reading history." />
      {loading ? <p className="mb-4 text-sm text-gray-500">Loading library...</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
