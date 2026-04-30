export type UserRole = 'admin' | 'user';
export type AgeBracket = 'under13' | 'teen' | 'adult';
export type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  ageBracket: AgeBracket;
  subscriptionTier: SubscriptionTier;
  genrePreferences?: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  tags: string[];
  ageRating: AgeBracket;
  isPremium: boolean;
  chapters: Chapter[];
  rating: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string[];
  pdfUrl?: string;
  pdfStartPage?: number;
  isPremiumLocked?: boolean;
}

export interface ReelItem {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  videoUrl: string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceInr: number;
  description: string;
  benefits: string[];
  isActive: boolean;
}
