import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookRow } from '@/components/books/BookRow';
import { Button } from '@/components/ui/Button';
import { useCatalogData } from '@/hooks/useCatalogData';

const quickStats = [
  { label: 'Reading Streak', value: '12 days' },
  { label: 'Books Completed', value: '8' },
  { label: 'Highlights', value: '146' },
  { label: 'Discussion Karma', value: '312' },
];

export function HomePage() {
  const { books, loading } = useCatalogData();

  if (loading) {
    return <div className="p-4 text-sm text-gray-500 dark:text-slate-400 md:p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-gradient-to-r from-darkPurple to-primary p-6 text-white"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-white/80">Featured Story</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">The Clockwork Lotus</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">
          Continue where you left off. Unlock premium arcs, add paragraph comments, and join deep lore threads.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/books/book-1">
            <Button className="bg-slate-100 text-darkPurple hover:bg-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
              Continue Reading
            </Button>
          </Link>
          <Link to="/subscription">
            <Button variant="ghost" className="border border-white/30 bg-white/15 text-white hover:bg-white/20">
              Upgrade Premium
            </Button>
          </Link>
        </div>
      </motion.section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-gray-500 dark:text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">Continue Reading</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
            Jump back into your most recent chapter with synced progress and notes.
          </p>
          <div className="mt-4">
            <BookRow title="Your Shelf" items={books} />
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">Today in Community</h2>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
            <li>• 23 new comments on paragraph discussions</li>
            <li>• 2 new chapters released across followed books</li>
            <li>• 1 premium reel added by featured author</li>
          </ul>
          <Link to="/discussions" className="mt-4 inline-block text-sm font-medium text-primary">
            Open discussions
          </Link>
        </article>
      </section>

      <BookRow title="Trending This Week" items={[...books].reverse()} />
      <BookRow title="Because You Like Mystery" items={books} />
    </div>
  );
}
