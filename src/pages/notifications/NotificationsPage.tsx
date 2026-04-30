import { PageTitle } from '@/components/ui/PageTitle';

const notificationList = [
  'A new chapter was released for The Clockwork Lotus.',
  'Your paragraph comment got 12 upvotes.',
  'Monthly premium expires in 5 days.',
];

export function NotificationsPage() {
  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Notifications" subtitle="Real-time account and content updates." />
      <div className="space-y-2">
        {notificationList.map((item) => (
          <article key={item} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            {item}
          </article>
        ))}
      </div>
    </div>
  );
}
