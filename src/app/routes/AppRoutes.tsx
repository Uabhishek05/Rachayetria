import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAdmin, RequireAuth } from './guards';
import { AuthPage } from '@/pages/auth/AuthPage';
import { HomePage } from '@/pages/home/HomePage';
import { ExplorePage } from '@/pages/explore/ExplorePage';
import { ReelsPage } from '@/pages/reels/ReelsPage';
import { LibraryPage } from '@/pages/home/LibraryPage';
import { DiscussionsPage } from '@/pages/discussions/DiscussionsPage';
import { ReviewsPage } from '@/pages/reviews/ReviewsPage';
import { SubscriptionPage } from '@/pages/subscription/SubscriptionPage';
import { BookPage } from '@/pages/book/BookPage';
import { ReadingPage } from '@/pages/reading/ReadingPage';
import { WikiPage } from '@/pages/wiki/WikiPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SearchPage } from '@/pages/search/SearchPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { SupportPage } from '@/pages/support/SupportPage';
import { NotFoundPage } from '@/pages/notfound/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/reels" element={<ReelsPage />} />
        <Route path="/library" element={<RequireAuth><LibraryPage /></RequireAuth>} />
        <Route path="/discussions" element={<RequireAuth><DiscussionsPage /></RequireAuth>} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/books/:bookId" element={<BookPage />} />
        <Route path="/read/:bookId/:chapterId" element={<RequireAuth><ReadingPage /></RequireAuth>} />
        <Route path="/wiki" element={<WikiPage />} />
        <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            </RequireAuth>
          }
        />
        <Route path="/faq-contact" element={<SupportPage />} />
      </Route>
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
