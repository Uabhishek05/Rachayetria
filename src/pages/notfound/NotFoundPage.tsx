import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-darkPurple">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The story you are looking for may have moved.</p>
      <Link className="mt-4" to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
