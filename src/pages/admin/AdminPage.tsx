import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PageTitle } from '@/components/ui/PageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Book, Chapter, ReelItem, SubscriptionPlan } from '@/types/domain';
import { books as fallbackBooks, reels as fallbackReels, subscriptionPlans as fallbackPlans } from '@/lib/mockData';
import {
  createBook,
  createReel,
  fetchBooks,
  fetchPlans,
  fetchReels,
  removeBook,
  removePlan,
  removeReel,
  saveBook,
  saveReel,
  savePlan,
  seedCatalogData,
} from '@/features/catalog/catalog.service';
import { uploadCatalogFile } from '@/features/catalog/media.service';

type DashboardTab = 'overview' | 'books' | 'chapters' | 'videos' | 'plans' | 'featured';

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'books', label: 'Books' },
  { id: 'chapters', label: 'Chapters' },
  { id: 'videos', label: 'Videos' },
  { id: 'plans', label: 'Subscriptions' },
  { id: 'featured', label: 'Featured' },
];

async function withTimeout<T>(promise: Promise<T>, ms = 12000): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), ms);
    }),
  ]);
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [books, setBooks] = useState<Book[]>([]);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCoverFile, setNewBookCoverFile] = useState<File | null>(null);
  const [newBookCoverUrl, setNewBookCoverUrl] = useState('');
  const [newBookCoverPreview, setNewBookCoverPreview] = useState('');
  const [addingBook, setAddingBook] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [chapterBookId, setChapterBookId] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterText, setChapterText] = useState('');
  const [chapterPdfFile, setChapterPdfFile] = useState<File | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState('');
  const [editingChapterText, setEditingChapterText] = useState('');
  const [newReelTitle, setNewReelTitle] = useState('');
  const [newReelAuthor, setNewReelAuthor] = useState('');
  const [newReelUrl, setNewReelUrl] = useState('');
  const [newReelVideoFile, setNewReelVideoFile] = useState<File | null>(null);
  const [newReelThumbnailFile, setNewReelThumbnailFile] = useState<File | null>(null);
  const [addingVideo, setAddingVideo] = useState(false);
  const [editingReelId, setEditingReelId] = useState<string | null>(null);
  const [editingReelTitle, setEditingReelTitle] = useState('');
  const [editingReelAuthor, setEditingReelAuthor] = useState('');
  const [editingReelUrl, setEditingReelUrl] = useState('');
  const [featuredBookIds, setFeaturedBookIds] = useState<string[]>([]);
  const [newPlanId, setNewPlanId] = useState<SubscriptionPlan['id']>('monthly');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('499');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [newPlanBenefits, setNewPlanBenefits] = useState('');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    return () => {
      if (newBookCoverPreview.startsWith('blob:')) {
        URL.revokeObjectURL(newBookCoverPreview);
      }
    };
  }, [newBookCoverPreview]);

  const onBookCoverFileChange = (file: File | null) => {
    if (newBookCoverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(newBookCoverPreview);
    }
    setNewBookCoverFile(file);
    if (file) {
      setNewBookCoverPreview(URL.createObjectURL(file));
    } else {
      setNewBookCoverPreview(newBookCoverUrl.trim());
    }
  };

  useEffect(() => {
    let active = true;
    void Promise.all([fetchBooks(), fetchReels(), fetchPlans()])
      .then(([bookData, reelData, planData]) => {
        if (!active) return;
        setBooks(bookData);
        setReels(reelData);
        setPlans(planData);
        setChapterBookId(bookData[0]?.id ?? '');
        setFeaturedBookIds(bookData.filter((book) => book.tags.includes('featured')).map((book) => book.id));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setBooks(fallbackBooks);
        setReels(fallbackReels);
        setPlans(fallbackPlans);
        setChapterBookId(fallbackBooks[0]?.id ?? '');
        setFeaturedBookIds(fallbackBooks.filter((book) => book.tags.includes('featured')).map((book) => book.id));
        setLoading(false);
        toast.error('Firestore blocked/unavailable. Showing sample data.');
      });
    return () => {
      active = false;
    };
  }, []);

  const refreshFromFirestore = async () => {
    try {
      const [bookData, reelData, planData] = await Promise.all([fetchBooks(), fetchReels(), fetchPlans()]);
      setBooks(bookData);
      setReels(reelData);
      setPlans(planData);
      const hasSelected = bookData.some((book) => book.id === chapterBookId);
      if (!hasSelected) {
        setChapterBookId(bookData[0]?.id ?? '');
      }
      setFeaturedBookIds(bookData.filter((book) => book.tags.includes('featured')).map((book) => book.id));
    } catch {
      setBooks(fallbackBooks);
      setReels(fallbackReels);
      setPlans(fallbackPlans);
      setChapterBookId(fallbackBooks[0]?.id ?? '');
      setFeaturedBookIds(fallbackBooks.filter((book) => book.tags.includes('featured')).map((book) => book.id));
      toast.error('Could not refresh Firestore. Showing sample data.');
    }
  };

  const seedFirestoreNow = async () => {
    setSeeding(true);
    try {
      await seedCatalogData();
      await refreshFromFirestore();
      toast.success('Firestore seeded successfully.');
    } catch {
      toast.error('Failed to seed Firestore. Check rules and try again.');
    } finally {
      setSeeding(false);
    }
  };

  const selectedChapterBook = useMemo(
    () => books.find((book) => book.id === chapterBookId) ?? books[0],
    [books, chapterBookId],
  );

  const summary = useMemo(
    () => ({
      totalBooks: books.length,
      totalChapters: books.reduce((acc, book) => acc + book.chapters.length, 0),
      totalVideos: reels.length,
      premiumBooks: books.filter((book) => book.isPremium).length,
      activePlans: plans.filter((plan) => plan.isActive).length,
    }),
    [books, reels, plans],
  );

  const addBook = async () => {
    if (newBookTitle.trim() === '' || newBookAuthor.trim() === '') {
      toast.error('Book title and author are required.');
      return;
    }
    setAddingBook(true);
    try {
      let coverUrl = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800';
      if (newBookCoverUrl.trim() !== '') {
        coverUrl = newBookCoverUrl.trim();
      }
      if (newBookCoverFile) {
        try {
          coverUrl = await withTimeout(uploadCatalogFile(newBookCoverFile, 'books'));
        } catch {
          toast.error('Cover upload blocked/failed. Book will use default cover.');
        }
      }

      const payload: Omit<Book, 'id'> = {
        title: newBookTitle.trim(),
        author: newBookAuthor.trim(),
        coverUrl,
        description: 'New draft awaiting full metadata from admin.',
        tags: ['new'],
        ageRating: 'teen',
        isPremium: false,
        chapters: [],
        rating: 0,
      };

      let newBook: Book | null = null;
      try {
        const id = await withTimeout(createBook(payload));
        newBook = { id, ...payload };
        toast.success('Book created in Firestore.');
      } catch {
        newBook = { id: 'local-' + Date.now().toString(), ...payload };
        toast.error('Firestore request blocked. Added locally for this session.');
      }

      if (newBook) {
        setBooks((prev) => [newBook, ...prev]);
        setNewBookTitle('');
        setNewBookAuthor('');
        setNewBookCoverFile(null);
        setNewBookCoverUrl('');
        setNewBookCoverPreview('');
        if (chapterBookId === '') {
          setChapterBookId(newBook.id);
        }
      }
    } finally {
      setAddingBook(false);
    }
  };

  const persistBookPatch = async (bookId: string, patch: Partial<Book>) => {
    const target = books.find((book) => book.id === bookId);
    if (!target) {
      return;
    }
    const updated = { ...target, ...patch };
    setBooks((prev) => prev.map((book) => (book.id === bookId ? updated : book)));
    await saveBook(updated);
  };

  const deleteBook = async (bookId: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== bookId));
    setFeaturedBookIds((prev) => prev.filter((id) => id !== bookId));
    await removeBook(bookId);
    if (chapterBookId === bookId) {
      setChapterBookId('');
    }
  };

  const addChapter = async () => {
    if (!selectedChapterBook || chapterBookId === '' || chapterTitle.trim() === '') {
      toast.error('Select a book and add chapter title.');
      return;
    }

    if (chapterText.trim() === '' && !chapterPdfFile) {
      toast.error('Add chapter text or upload a PDF.');
      return;
    }

    let pdfUrl: string | undefined;
    if (chapterPdfFile) {
      try {
        pdfUrl = await withTimeout(uploadCatalogFile(chapterPdfFile, 'chapters'));
      } catch {
        toast.error('PDF upload blocked/failed. Try again.');
        return;
      }
    }

    const chapter: Chapter = {
      id: 'ch-' + Date.now().toString(),
      title: chapterTitle.trim(),
      content: chapterText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      pdfUrl,
      isPremiumLocked: selectedChapterBook.isPremium,
    };

    const updatedBook = { ...selectedChapterBook, chapters: [...selectedChapterBook.chapters, chapter] };
    setBooks((prev) => prev.map((book) => (book.id === selectedChapterBook.id ? updatedBook : book)));
    await saveBook(updatedBook);
    setChapterTitle('');
    setChapterText('');
    setChapterPdfFile(null);
    toast.success('Chapter created.');
  };

  const startEditChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingChapterTitle(chapter.title);
    setEditingChapterText(chapter.content.join('\n'));
  };

  const saveEditedChapter = async () => {
    if (!selectedChapterBook || !editingChapterId) {
      return;
    }
    const updatedChapters = selectedChapterBook.chapters.map((chapter) =>
      chapter.id === editingChapterId
        ? {
            ...chapter,
            title: editingChapterTitle.trim() || chapter.title,
            content: editingChapterText
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0),
          }
        : chapter,
    );
    const updatedBook = { ...selectedChapterBook, chapters: updatedChapters };
    setBooks((prev) => prev.map((book) => (book.id === selectedChapterBook.id ? updatedBook : book)));
    await saveBook(updatedBook);
    setEditingChapterId(null);
    setEditingChapterTitle('');
    setEditingChapterText('');
    toast.success('Chapter updated.');
  };

  const deleteChapter = async (chapterId: string) => {
    if (!selectedChapterBook) {
      return;
    }
    const updatedBook = {
      ...selectedChapterBook,
      chapters: selectedChapterBook.chapters.filter((chapter) => chapter.id !== chapterId),
    };
    setBooks((prev) => prev.map((book) => (book.id === selectedChapterBook.id ? updatedBook : book)));
    await saveBook(updatedBook);
    if (editingChapterId === chapterId) {
      setEditingChapterId(null);
    }
    toast.success('Chapter deleted.');
  };

  const addVideo = async () => {
    if (newReelTitle.trim() === '' || newReelAuthor.trim() === '') {
      return;
    }
    setAddingVideo(true);
    try {
      let videoUrl = newReelUrl.trim();
      if (newReelVideoFile) {
        videoUrl = await withTimeout(uploadCatalogFile(newReelVideoFile, 'reels'));
      }
      if (videoUrl === '') {
        toast.error('Provide video URL or choose a local video file.');
        return;
      }

      let thumbnail = 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800';
      if (newReelThumbnailFile) {
        try {
          thumbnail = await withTimeout(uploadCatalogFile(newReelThumbnailFile, 'thumbnails'));
        } catch {
          toast.error('Thumbnail upload blocked/failed. Using default thumbnail.');
        }
      }

      const payload = {
        title: newReelTitle.trim(),
        author: newReelAuthor.trim(),
        videoUrl,
        thumbnail,
      };
      const id = await withTimeout(createReel(payload));
      setReels((prev) => [{ id, ...payload }, ...prev]);
      setNewReelTitle('');
      setNewReelAuthor('');
      setNewReelUrl('');
      setNewReelVideoFile(null);
      setNewReelThumbnailFile(null);
      toast.success('Video created.');
    } catch {
      toast.error('Video create request blocked. Check browser shields/adblock and Firebase rules.');
    } finally {
      setAddingVideo(false);
    }
  };

  const startEditVideo = (reel: ReelItem) => {
    setEditingReelId(reel.id);
    setEditingReelTitle(reel.title);
    setEditingReelAuthor(reel.author);
    setEditingReelUrl(reel.videoUrl);
  };

  const saveEditedVideo = async () => {
    if (!editingReelId) {
      return;
    }
    const target = reels.find((item) => item.id === editingReelId);
    if (!target) {
      return;
    }
    const updated: ReelItem = {
      ...target,
      title: editingReelTitle.trim() || target.title,
      author: editingReelAuthor.trim() || target.author,
      videoUrl: editingReelUrl.trim() || target.videoUrl,
    };
    setReels((prev) => prev.map((item) => (item.id === editingReelId ? updated : item)));
    await saveReel(updated);
    setEditingReelId(null);
    setEditingReelTitle('');
    setEditingReelAuthor('');
    setEditingReelUrl('');
    toast.success('Video updated.');
  };

  const togglePlan = async (id: SubscriptionPlan['id']) => {
    const target = plans.find((plan) => plan.id === id);
    if (!target) {
      return;
    }
    const updated = { ...target, isActive: !target.isActive };
    setPlans((prev) => prev.map((plan) => (plan.id === id ? updated : plan)));
    await savePlan(updated);
  };

  const updatePlanPrice = async (id: SubscriptionPlan['id'], priceInr: number) => {
    const target = plans.find((plan) => plan.id === id);
    if (!target) {
      return;
    }
    const nextPrice = Number.isNaN(priceInr) ? target.priceInr : priceInr;
    const updated = { ...target, priceInr: nextPrice };
    setPlans((prev) => prev.map((plan) => (plan.id === id ? updated : plan)));
    await savePlan(updated);
  };

  const createPlan = async () => {
    if (newPlanName.trim() === '' || newPlanDescription.trim() === '') {
      return;
    }
    const plan: SubscriptionPlan = {
      id: newPlanId,
      name: newPlanName.trim(),
      priceInr: Number(newPlanPrice) || 0,
      description: newPlanDescription.trim(),
      benefits: newPlanBenefits
        .split(',')
        .map((benefit) => benefit.trim())
        .filter((benefit) => benefit.length > 0),
      isActive: true,
    };
    setPlans((prev) => {
      const withoutExisting = prev.filter((item) => item.id !== plan.id);
      return [...withoutExisting, plan];
    });
    await savePlan(plan);
    setNewPlanName('');
    setNewPlanPrice('499');
    setNewPlanDescription('');
    setNewPlanBenefits('');
    toast.success('Plan saved.');
  };

  const deletePlan = async (id: SubscriptionPlan['id']) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
    await removePlan(id);
    toast.success('Plan deleted.');
  };

  const toggleFeatured = async (bookId: string) => {
    const nextFeatured = featuredBookIds.includes(bookId)
      ? featuredBookIds.filter((id) => id !== bookId)
      : [...featuredBookIds, bookId];
    setFeaturedBookIds(nextFeatured);

    const target = books.find((book) => book.id === bookId);
    if (!target) {
      return;
    }
    const tags = target.tags.filter((tag) => tag !== 'featured');
    const updated = nextFeatured.includes(bookId) ? { ...target, tags: [...tags, 'featured'] } : { ...target, tags };
    setBooks((prev) => prev.map((book) => (book.id === bookId ? updated : book)));
    await saveBook(updated);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageTitle title="Admin Dashboard" subtitle="Manage books, chapters, videos, subscriptions, and featured placements." />
      {loading ? <p className="text-sm text-gray-500 dark:text-slate-400">Loading Firestore data...</p> : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          If Firestore collections are empty, click once to initialize `books`, `reels`, and `plans`.
        </p>
        <Button className="mt-3" onClick={() => void seedFirestoreNow()} disabled={seeding}>
          {seeding ? 'Seeding Firestore...' : 'Seed Firestore Data'}
        </Button>
      </section>

      <section className="scrollbar-hide flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {activeTab === 'overview' ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Books" value={summary.totalBooks.toString()} onClick={() => setActiveTab('books')} />
          <MetricCard title="Chapters" value={summary.totalChapters.toString()} onClick={() => setActiveTab('chapters')} />
          <MetricCard title="Videos" value={summary.totalVideos.toString()} onClick={() => setActiveTab('videos')} />
          <MetricCard title="Premium Books" value={summary.premiumBooks.toString()} onClick={() => setActiveTab('featured')} />
          <MetricCard title="Active Plans" value={summary.activePlans.toString()} onClick={() => setActiveTab('plans')} />
        </section>
      ) : null}

      {activeTab === 'books' ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100">Book CMS</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input value={newBookTitle} onChange={(event) => setNewBookTitle(event.target.value)} placeholder="Book title" />
            <Input value={newBookAuthor} onChange={(event) => setNewBookAuthor(event.target.value)} placeholder="Author" />
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-gray-600">
              Cover from system
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-xs"
                onChange={(event) => onBookCoverFileChange(event.target.files?.[0] ?? null)}
              />
            </label>
            <Input
              value={newBookCoverUrl}
              onChange={(event) => {
                const url = event.target.value;
                setNewBookCoverUrl(url);
                if (!newBookCoverFile) {
                  setNewBookCoverPreview(url.trim());
                }
              }}
              placeholder="Or paste cover image URL"
            />
            <Button onClick={() => void addBook()} disabled={addingBook}>
              {addingBook ? 'Adding...' : 'Add Book'}
            </Button>
          </div>
          {newBookCoverPreview ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm text-gray-600">Cover preview</p>
              <img src={newBookCoverPreview} alt="cover preview" className="h-40 w-28 rounded-lg object-cover" />
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  onBookCoverFileChange(null);
                  setNewBookCoverUrl('');
                  setNewBookCoverPreview('');
                }}
              >
                Remove cover
              </Button>
            </div>
          ) : null}
          {books.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-gray-600">
              No books yet. Add your first book above.
            </p>
          ) : null}
          <div className="space-y-2">
            {books.map((book) => (
              <article key={book.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="w-full space-y-2">
                    <Input
                      value={book.title}
                      onChange={(event) => void persistBookPatch(book.id, { title: event.target.value })}
                      className={editingBookId === book.id ? '' : 'pointer-events-none border-transparent bg-slate-50'}
                    />
                    <Input
                      value={book.author}
                      onChange={(event) => void persistBookPatch(book.id, { author: event.target.value })}
                      className={editingBookId === book.id ? '' : 'pointer-events-none border-transparent bg-slate-50'}
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-500">
                      <input
                        type="checkbox"
                        checked={book.isPremium}
                        onChange={(event) => void persistBookPatch(book.id, { isPremium: event.target.checked })}
                      />
                      Premium book
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => setEditingBookId((prev) => (prev === book.id ? null : book.id))}>
                      {editingBookId === book.id ? 'Lock' : 'Edit'}
                    </Button>
                    <Button variant="danger" onClick={() => void deleteBook(book.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === 'chapters' ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100">Chapter Upload Manager</h2>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={chapterBookId}
            onChange={(event) => setChapterBookId(event.target.value)}
          >
            <option value="" disabled>
              {books.length === 0 ? 'No books available' : 'Select book'}
            </option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} - {book.author}
              </option>
            ))}
          </select>
          <div className="grid gap-2">
            <Input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} placeholder="Chapter title" />
            <textarea
              className="min-h-28 rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none focus:ring focus:ring-primary/30"
              value={chapterText}
              onChange={(event) => setChapterText(event.target.value)}
              placeholder="Paste chapter content (optional if PDF is uploaded). Use line breaks for paragraph splits."
            />
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Chapter PDF (optional)
              <input
                type="file"
                accept="application/pdf"
                className="mt-1 block w-full text-xs"
                onChange={(event) => setChapterPdfFile(event.target.files?.[0] ?? null)}
              />
            </label>
            {chapterPdfFile ? <p className="text-xs text-gray-500 dark:text-slate-400">Selected: {chapterPdfFile.name}</p> : null}
            <Button onClick={() => void addChapter()} disabled={chapterBookId === '' || books.length === 0}>
              Create Chapter
            </Button>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-gray-900">
              Current chapters in {selectedChapterBook ? selectedChapterBook.title : 'No book selected'}
            </p>
            {editingChapterId ? (
              <div className="mb-3 mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3">
                <Input value={editingChapterTitle} onChange={(event) => setEditingChapterTitle(event.target.value)} />
                <textarea
                  className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none focus:ring focus:ring-primary/30"
                  value={editingChapterText}
                  onChange={(event) => setEditingChapterText(event.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={() => void saveEditedChapter()}>Update Chapter</Button>
                  <Button variant="ghost" onClick={() => setEditingChapterId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              {(selectedChapterBook?.chapters ?? []).map((chapter) => (
                <li key={chapter.id} className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span>{chapter.title}</span>
                      {chapter.pdfUrl ? (
                        <p className="text-xs text-primary">
                          PDF attached
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => startEditChapter(chapter)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="px-2 py-1 text-xs"
                        onClick={() => void deleteChapter(chapter.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {activeTab === 'videos' ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100">Video/Reels Manager</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={newReelTitle} onChange={(event) => setNewReelTitle(event.target.value)} placeholder="Video title" />
            <Input value={newReelAuthor} onChange={(event) => setNewReelAuthor(event.target.value)} placeholder="Creator name" />
            <Input
              className="sm:col-span-2"
              value={newReelUrl}
              onChange={(event) => setNewReelUrl(event.target.value)}
              placeholder="Video URL"
            />
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-gray-600">
              Video from system
              <input
                type="file"
                accept="video/*"
                className="mt-1 block w-full text-xs"
                onChange={(event) => setNewReelVideoFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-gray-600">
              Thumbnail from system
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-xs"
                onChange={(event) => setNewReelThumbnailFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <Button className="sm:col-span-2" onClick={() => void addVideo()} disabled={addingVideo}>
              {addingVideo ? 'Creating...' : 'Create Video'}
            </Button>
          </div>
          {editingReelId ? (
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
              <Input value={editingReelTitle} onChange={(event) => setEditingReelTitle(event.target.value)} placeholder="Video title" />
              <Input value={editingReelAuthor} onChange={(event) => setEditingReelAuthor(event.target.value)} placeholder="Creator" />
              <Input
                className="sm:col-span-2"
                value={editingReelUrl}
                onChange={(event) => setEditingReelUrl(event.target.value)}
                placeholder="Video URL"
              />
              <div className="sm:col-span-2 flex gap-2">
                <Button onClick={() => void saveEditedVideo()}>Update Video</Button>
                <Button variant="ghost" onClick={() => setEditingReelId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            {reels.map((reel) => (
              <article key={reel.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{reel.title}</p>
                  <p className="text-sm text-gray-600">{reel.author}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => startEditVideo(reel)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setReels((prev) => prev.filter((item) => item.id !== reel.id));
                    void removeReel(reel.id);
                    toast.success('Video deleted.');
                  }}
                >
                  Delete
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === 'plans' ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100">Subscription Controls</h2>
          <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
            <select
              value={newPlanId}
              onChange={(event) => setNewPlanId(event.target.value as SubscriptionPlan['id'])}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="free">free</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
            <Input value={newPlanName} onChange={(event) => setNewPlanName(event.target.value)} placeholder="Plan name" />
            <Input value={newPlanPrice} onChange={(event) => setNewPlanPrice(event.target.value)} placeholder="Price INR" />
            <Input
              value={newPlanDescription}
              onChange={(event) => setNewPlanDescription(event.target.value)}
              placeholder="Description"
            />
            <Input
              className="sm:col-span-2"
              value={newPlanBenefits}
              onChange={(event) => setNewPlanBenefits(event.target.value)}
              placeholder="Benefits comma separated"
            />
            <Button className="sm:col-span-2" onClick={() => void createPlan()}>
              Create/Update Plan
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                <label className="mt-3 block text-sm text-gray-500">Price (INR)</label>
                <Input
                  type="number"
                  value={plan.priceInr}
                  onChange={(event) => void updatePlanPrice(plan.id, Number(event.target.value))}
                />
                <Button
                  className="mt-3 w-full"
                  variant={plan.isActive ? 'secondary' : 'ghost'}
                  onClick={() => void togglePlan(plan.id)}
                >
                  {plan.isActive ? 'Disable Plan' : 'Enable Plan'}
                </Button>
                <Button className="mt-2 w-full" variant="danger" onClick={() => void deletePlan(plan.id)}>
                  Delete Plan
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === 'featured' ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100">Featured Content Control</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">Pick which books appear in homepage featured rails.</p>
          <div className="grid gap-2">
            {books.map((book) => (
              <label key={book.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-gray-700">{book.title}</span>
                <input
                  type="checkbox"
                  checked={featuredBookIds.includes(book.id)}
                  onChange={() => void toggleFeatured(book.id)}
                />
              </label>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MetricCard({ title, value, onClick }: { title: string; value: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">{value}</p>
    </button>
  );
}
