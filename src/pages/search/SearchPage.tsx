import { useLocation } from 'react-router-dom';
import { PageTitle } from '@/components/ui/PageTitle';
import { BookCard } from '@/components/books/BookCard';
import { useCatalogData } from '@/hooks/useCatalogData';

export function SearchPage() {
  const { books, loading } = useCatalogData();
  const searchParams = new URLSearchParams(useLocation().search);
  const query = searchParams.get('q')?.toLowerCase() ?? '';
  const result = books.filter((book) =>
    [book.title, book.author, book.tags.join(' ')].join(' ').toLowerCase().includes(query),
  );

  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Search Results" subtitle={'Showing matches for "' + query + '"'} />
      {loading ? <p className="mb-4 text-sm text-gray-500">Loading catalog...</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
