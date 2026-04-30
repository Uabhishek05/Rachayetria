import { Link } from 'react-router-dom';
import type { Book } from '@/types/domain';

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to={'/books/' + book.id}
      className="card-hover block min-w-[10.5rem] rounded-2xl border border-slate-100 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 md:min-w-48 md:p-3"
    >
      <img src={book.coverUrl} alt={book.title} className="h-44 w-full rounded-xl object-cover md:h-52" loading="lazy" />
      <p className="mt-3 line-clamp-1 text-sm font-semibold dark:text-slate-100">{book.title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{book.author}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-300">{book.rating.toFixed(1)} rating</span>
        {book.isPremium ? <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">Premium</span> : null}
      </div>
    </Link>
  );
}
