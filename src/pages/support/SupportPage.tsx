import { PageTitle } from '@/components/ui/PageTitle';

export function SupportPage() {
  return (
    <div className="p-4 md:p-6">
      <PageTitle title="FAQ and Contact" subtitle="Help center for subscriptions, reading tools, and account support." />
      <div className="space-y-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">How do I unlock premium chapters?</h2>
          <p className="mt-1 text-sm text-slate-600">Go to Subscription and choose monthly or yearly premium.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">How do paragraph comments work?</h2>
          <p className="mt-1 text-sm text-slate-600">Open reading mode, click a paragraph, and post contextual notes.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Contact</h2>
          <p className="mt-1 text-sm text-slate-600">support@rachayetria.com</p>
        </article>
      </div>
    </div>
  );
}
