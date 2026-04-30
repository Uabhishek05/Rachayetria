import { PageTitle } from '@/components/ui/PageTitle';

export function WikiPage() {
  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Author Wiki" subtitle="Characters, timelines, and lore mapping." />
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Characters</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>Mira Khatri - Archivist of Broken Clocks</li>
            <li>Juno Vale - Lorekeeper and hidden antagonist</li>
            <li>Aria Noor - Protagonist of Seven Winters</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Timelines</h2>
          <p className="mt-2 text-sm text-slate-600">
            Year 1: Fire Court rises. Year 4: Archive split. Year 8: Neon Accord collapse.
          </p>
        </section>
      </div>
    </div>
  );
}
