import { PageTitle } from '@/components/ui/PageTitle';
import { useCatalogData } from '@/hooks/useCatalogData';

export function ReelsPage() {
  const { reels, loading } = useCatalogData();

  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Reels" subtitle="Author shorts, lore drops, and adaptation teasers." />
      {loading ? <p className="mb-4 text-sm text-gray-500">Loading reels...</p> : null}
      <div className="mx-auto grid max-w-lg gap-4">
        {reels.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-black">
            <video
              src={item.videoUrl}
              controls
              className="h-[70vh] max-h-[560px] w-full object-cover"
              poster={item.thumbnail}
            />
            <div className="bg-white p-3">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-slate-500">{item.author}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
