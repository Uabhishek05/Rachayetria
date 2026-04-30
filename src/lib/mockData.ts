import type { Book, ReelItem } from '@/types/domain';
import type { SubscriptionTier } from '@/types/domain';

export const books: Book[] = [
  {
    id: 'book-the-alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverUrl: '/books/purusharth-book-cover.avif',
    description:
      'A reflective journey about following one\'s purpose, trusting intuition, and finding meaning through courage and persistence. This edition is added as a full PDF reading experience with in-app reader tools.',
    tags: ['philosophy', 'inspirational', 'journey', 'classic'],
    ageRating: 'teen',
    isPremium: false,
    rating: 4.8,
    chapters: [
      {
        id: 'ch-1',
        title: 'Chapter 1: Introduction',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 5,
      },
      {
        id: 'ch-2',
        title: 'Chapter 2: Prologue',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 9,
      },
      {
        id: 'ch-3',
        title: 'Chapter 3: One',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 12,
      },
      {
        id: 'ch-4',
        title: 'Chapter 4: Two',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 50,
      },
      {
        id: 'ch-5',
        title: 'Chapter 5: Epilogue',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 141,
      },
      {
        id: 'ch-6',
        title: 'Chapter 6: About the Author',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 143,
      },
      {
        id: 'ch-7',
        title: 'Chapter 7: International Acclaim',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 145,
      },
      {
        id: 'ch-8',
        title: 'Chapter 8: Books by Paulo Coelho',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 150,
      },
      {
        id: 'ch-9',
        title: 'Chapter 9: Credits',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 151,
      },
      {
        id: 'ch-10',
        title: 'Chapter 10: Copyright',
        content: [],
        pdfUrl: '/books/the-alchemist-ebook.pdf',
        pdfStartPage: 152,
      },
    ],
  },
  {
    id: 'book-1',
    title: 'The Clockwork Lotus',
    author: 'Aarav Sen',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    description: 'A mystery fantasy set in a city where stories shape reality.',
    tags: ['fantasy', 'mystery'],
    ageRating: 'teen',
    isPremium: false,
    rating: 4.7,
    chapters: [
      {
        id: 'ch-1',
        title: 'Whispers Under Neon Rain',
        content: [
          'Rain fell like static across the brass rooftops.',
          'Mira unfolded the letter again, tracing a name she had never seen.',
          'By dawn, the city had already decided she was lying.'
        ]
      },
      {
        id: 'ch-2',
        title: 'The Library Without Doors',
        isPremiumLocked: true,
        content: [
          'The staircase bent in impossible angles as the lamps dimmed.',
          'Every book on the shelf had Mira\'s face on the spine.'
        ]
      }
    ]
  },
  {
    id: 'book-2',
    title: 'Seven Winters of Solitude',
    author: 'Naina Rao',
    coverUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800',
    description: 'A slow-burning literary saga about grief and second chances.',
    tags: ['drama', 'literary'],
    ageRating: 'adult',
    isPremium: true,
    rating: 4.9,
    chapters: [
      {
        id: 'ch-1',
        title: 'Ice at the Window',
        content: [
          'On the seventh winter, the house began to answer back.',
          'Aria stopped writing letters and started collecting silence.'
        ]
      }
    ]
  }
];

export const reels: ReelItem[] = [
  {
    id: 'reel-1',
    title: 'Author Q and A: Building Villains',
    author: 'Aarav Sen',
    thumbnail: 'https://images.unsplash.com/photo-1522125670776-3c7abb882bc2?w=800',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
  },
  {
    id: 'reel-2',
    title: 'Lore Drop: The Fire Court Timeline',
    author: 'Naina Rao',
    thumbnail: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }
];

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceInr: number;
  description: string;
  benefits: string[];
  isActive: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceInr: 0,
    description: 'Entry access with limited chapters',
    benefits: ['Limited free chapters', 'Community access', 'Basic notifications'],
    isActive: true,
  },
  {
    id: 'monthly',
    name: 'Premium Monthly',
    priceInr: 499,
    description: 'Full premium access billed monthly',
    benefits: ['All premium chapters', 'Ad-free reading', 'Early reel drops'],
    isActive: true,
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    priceInr: 4999,
    description: 'Best value for frequent readers',
    benefits: ['All monthly benefits', 'Two months free', 'Priority beta features'],
    isActive: true,
  },
];
