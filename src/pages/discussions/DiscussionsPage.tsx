import { PageTitle } from '@/components/ui/PageTitle';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function DiscussionsPage() {
  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Community Discussions" subtitle="Threaded conversations around stories and fan theories." />
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <Input placeholder="Start a discussion..." />
          <Button>Post</Button>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <article className="rounded-xl bg-slate-50 p-3">Who is the hidden archivist in chapter 2?</article>
          <article className="rounded-xl bg-slate-50 p-3">Timeline mismatch in the Fire Court wiki, thoughts?</article>
        </div>
      </div>
    </div>
  );
}
