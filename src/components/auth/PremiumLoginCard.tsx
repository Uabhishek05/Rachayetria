import { useState } from 'react';
import { Link } from 'react-router-dom';

interface PremiumLoginCardProps {
  onSubmit: (payload: { email: string; password: string }) => Promise<void> | void;
  loading?: boolean;
  signupHref?: string;
}

export function PremiumLoginCard({
  onSubmit,
  loading = false,
  signupHref = '/auth?mode=signup',
}: PremiumLoginCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F9F7FF] px-4 py-10">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#E6D6FF] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-12 h-80 w-80 rounded-full bg-[#E6D6FF]/80 blur-3xl" />

      <section className="w-full max-w-md rounded-2xl border border-white/70 bg-white/70 p-6 shadow-[0_15px_40px_rgba(108,59,255,0.10)] backdrop-blur-xl sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Welcome back</h1>
        <p className="mt-2 text-sm text-[#555555]">Continue your reading journey</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({ email, password });
          }}
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#6C3BFF]/50 focus:ring-4 focus:ring-[#6C3BFF]/15"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#6C3BFF]/50 focus:ring-4 focus:ring-[#6C3BFF]/15"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#7A4DFF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(108,59,255,0.28)] transition duration-200 hover:scale-[1.02] hover:from-[#5D31EB] hover:to-[#6B3EFA] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#555555]">
          New to Rachayetria?{' '}
          <Link to={signupHref} className="font-semibold text-[#6C3BFF] transition hover:text-[#5D31EB]">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
