import { PageTitle } from '@/components/ui/PageTitle';

const reviews = [
  { user: 'Isha', rating: 5, text: 'Stunning pacing and world-building.' },
  { user: 'Rahul', rating: 4, text: 'Character arcs are addictive.' },
  { user: 'Mira', rating: 5, text: 'Premium chapters are worth it.' },
];

export function ReviewsPage() {
  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Reviews" subtitle="Goodreads style review and rating feed." />
      <div className="space-y-3">
        {reviews.map((review) => (
          <article key={review.user} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold">{review.user}</p>
            <p className="text-xs text-primary">{'★'.repeat(review.rating)}</p>
            <p className="mt-2 text-sm text-slate-700">{review.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
