import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/ui/PageTitle';
import { useAuth } from '@/features/auth/AuthContext';
import { useCatalogData } from '@/hooks/useCatalogData';

export function BookPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { books, loading } = useCatalogData();

  const book = useMemo(
    () => (books.length === 0 ? undefined : books.find((item) => item.id === params.bookId) ?? books[0]),
    [books, params.bookId],
  );

  if (loading) {
    return <div className="p-4 text-sm text-gray-500 md:p-6">Loading book...</div>;
  }

  if (!book) {
    return <div className="p-4 text-sm text-gray-500 md:p-6">Book not found.</div>;
  }

  const startReading = (chapterId: string) => {
    const target = '/read/' + book.id + '/' + chapterId;
    if (user === null) {
      navigate('/auth', { state: { from: target } });
      return;
    }
    navigate(target);
  };

  return (
    <div className="p-4 md:p-6">
      <PageTitle title={book.title} subtitle={book.description} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <img src={book.coverUrl} alt={book.title} className="h-72 w-full rounded-2xl object-cover md:h-96" />
        <div>
          <p className="text-sm text-slate-500">By {book.author}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {book.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-6 text-xl font-semibold">Chapters</h2>
          <div className="mt-3 space-y-2">
            {book.chapters.map((chapter) => {
              const locked = chapter.isPremiumLocked && user?.subscriptionTier === 'free';
              return (
                <article key={chapter.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold">{chapter.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {chapter.pdfUrl
                      ? chapter.pdfStartPage
                        ? `PDF chapter • starts at page ${chapter.pdfStartPage}`
                        : 'PDF chapter'
                      : 'Text chapter'}
                  </p>
                  {locked ? (
                    <p className="mt-2 text-xs text-primary">Premium chapter. Upgrade to unlock.</p>
                  ) : (
                    <Button className="mt-3" onClick={() => startReading(chapter.id)}>
                      {user ? 'Start reading' : 'Login to read'}
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
