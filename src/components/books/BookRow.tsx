import { BookCard } from './BookCard';
import type { Book } from '@/types/domain';

export function BookRow({ title, items }: { title: string; items: Book[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-darkPurple">{title}</h2>
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
        {items.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
