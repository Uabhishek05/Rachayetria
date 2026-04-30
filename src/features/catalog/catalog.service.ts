import {
  addDoc,
  writeBatch,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { books as fallbackBooks, reels as fallbackReels, subscriptionPlans as fallbackPlans } from '@/lib/mockData';
import type { Book, Chapter, ReelItem, SubscriptionPlan } from '@/types/domain';

function toBook(id: string, data: Record<string, unknown>): Book {
  return {
    id,
    title: String(data.title ?? 'Untitled'),
    author: String(data.author ?? 'Unknown'),
    coverUrl: String(data.coverUrl ?? fallbackBooks[0]?.coverUrl ?? ''),
    description: String(data.description ?? ''),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    ageRating: (data.ageRating as Book['ageRating']) ?? 'teen',
    isPremium: Boolean(data.isPremium),
    rating: Number(data.rating ?? 0),
    chapters: Array.isArray(data.chapters)
      ? data.chapters.map((item, idx) => {
          const raw = item as Partial<Chapter>;
          return {
            id: raw.id ?? `ch-${idx + 1}`,
            title: raw.title ?? `Chapter ${idx + 1}`,
            content: Array.isArray(raw.content) ? raw.content.map(String) : [],
            pdfUrl: typeof raw.pdfUrl === 'string' ? raw.pdfUrl : undefined,
            pdfStartPage:
              typeof raw.pdfStartPage === 'number' && Number.isFinite(raw.pdfStartPage)
                ? Math.max(1, Math.floor(raw.pdfStartPage))
                : undefined,
            isPremiumLocked: Boolean(raw.isPremiumLocked),
          };
        })
      : [],
  };
}

function toReel(id: string, data: Record<string, unknown>): ReelItem {
  return {
    id,
    title: String(data.title ?? 'Untitled Reel'),
    author: String(data.author ?? 'Unknown'),
    thumbnail: String(data.thumbnail ?? fallbackReels[0]?.thumbnail ?? ''),
    videoUrl: String(data.videoUrl ?? ''),
  };
}

function toPlan(id: string, data: Record<string, unknown>): SubscriptionPlan {
  return {
    id: id as SubscriptionPlan['id'],
    name: String(data.name ?? 'Plan'),
    priceInr: Number(data.priceInr ?? 0),
    description: String(data.description ?? ''),
    benefits: Array.isArray(data.benefits) ? data.benefits.map(String) : [],
    isActive: Boolean(data.isActive),
  };
}

export async function fetchBooks(): Promise<Book[]> {
  const snapshot = await getDocs(collection(firestore, 'books'));
  if (snapshot.empty) {
    return fallbackBooks;
  }
  return snapshot.docs.map((item) => toBook(item.id, item.data() as Record<string, unknown>));
}

export async function fetchReels(): Promise<ReelItem[]> {
  const snapshot = await getDocs(collection(firestore, 'reels'));
  if (snapshot.empty) {
    return fallbackReels;
  }
  return snapshot.docs.map((item) => toReel(item.id, item.data() as Record<string, unknown>));
}

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  const snapshot = await getDocs(collection(firestore, 'plans'));
  if (snapshot.empty) {
    return fallbackPlans;
  }
  return snapshot.docs.map((item) => toPlan(item.id, item.data() as Record<string, unknown>));
}

export async function createBook(payload: Omit<Book, 'id'>) {
  const ref = await addDoc(collection(firestore, 'books'), payload);
  return ref.id;
}

export async function saveBook(book: Book) {
  await setDoc(doc(firestore, 'books', book.id), { ...book }, { merge: true });
}

export async function removeBook(bookId: string) {
  await deleteDoc(doc(firestore, 'books', bookId));
}

export async function createReel(payload: Omit<ReelItem, 'id'>) {
  const ref = await addDoc(collection(firestore, 'reels'), payload);
  return ref.id;
}

export async function removeReel(id: string) {
  await deleteDoc(doc(firestore, 'reels', id));
}

export async function saveReel(reel: ReelItem) {
  await setDoc(doc(firestore, 'reels', reel.id), reel, { merge: true });
}

export async function savePlan(plan: SubscriptionPlan) {
  await setDoc(doc(firestore, 'plans', plan.id), plan, { merge: true });
}

export async function togglePlanActive(id: SubscriptionPlan['id'], isActive: boolean) {
  await updateDoc(doc(firestore, 'plans', id), { isActive });
}

export async function removePlan(id: SubscriptionPlan['id']) {
  await deleteDoc(doc(firestore, 'plans', id));
}

export async function seedCatalogData() {
  const batch = writeBatch(firestore);

  fallbackBooks.forEach((book) => {
    const ref = doc(firestore, 'books', book.id);
    batch.set(
      ref,
      {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        description: book.description,
        tags: book.tags,
        ageRating: book.ageRating,
        isPremium: book.isPremium,
        chapters: book.chapters,
        rating: book.rating,
      },
      { merge: true },
    );
  });

  fallbackReels.forEach((reel) => {
    const ref = doc(firestore, 'reels', reel.id);
    batch.set(
      ref,
      {
        title: reel.title,
        author: reel.author,
        thumbnail: reel.thumbnail,
        videoUrl: reel.videoUrl,
      },
      { merge: true },
    );
  });

  fallbackPlans.forEach((plan) => {
    const ref = doc(firestore, 'plans', plan.id);
    batch.set(ref, plan, { merge: true });
  });

  await batch.commit();
}
