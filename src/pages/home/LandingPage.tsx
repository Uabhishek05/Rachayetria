import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center">
        <img src="/logo-r.jpeg" alt="Rachayetria logo" className="h-28 w-auto rounded-xl object-contain" />
        <h1 className="mt-6 text-4xl font-extrabold text-darkPurple md:text-6xl">
          Premium Digital Reading,
          <br />
          Reimagined
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-600 md:text-base">
          Read admin-curated books, watch author reels, join paragraph-level discussions, and unlock premium chapters.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
          <Link to="/explore">
            <Button variant="ghost">Explore Preview</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
