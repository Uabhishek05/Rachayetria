import { useEffect, useState } from 'react';
import type { Book, ReelItem, SubscriptionPlan } from '@/types/domain';
import { fetchBooks, fetchPlans, fetchReels } from '@/features/catalog/catalog.service';
import { books as fallbackBooks, reels as fallbackReels, subscriptionPlans as fallbackPlans } from '@/lib/mockData';

interface CatalogState {
  books: Book[];
  reels: ReelItem[];
  plans: SubscriptionPlan[];
  loading: boolean;
}

export function useCatalogData() {
  const [state, setState] = useState<CatalogState>({
    books: [],
    reels: [],
    plans: [],
    loading: true,
  });

  useEffect(() => {
    let active = true;
    void Promise.all([fetchBooks(), fetchReels(), fetchPlans()])
      .then(([books, reels, plans]) => {
        if (!active) return;
        setState({ books, reels, plans, loading: false });
      })
      .catch(() => {
        if (!active) return;
        setState({
          books: fallbackBooks,
          reels: fallbackReels,
          plans: fallbackPlans,
          loading: false,
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
