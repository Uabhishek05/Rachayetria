import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { FirebaseError } from 'firebase/app';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/AuthContext';
import type { AgeBracket } from '@/types/domain';
import { useTheme } from '@/features/theme/ThemeContext';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ageBracket, setAgeBracket] = useState<AgeBracket>('adult');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/home';

  const ageOptions: Array<{ label: string; value: AgeBracket }> = [
    { label: 'Under 13', value: 'under13' },
    { label: '13-17', value: 'teen' },
    { label: '18-21', value: 'adult' },
    { label: '21+', value: 'adult' },
  ];
  const genres = ['Romance', 'Fantasy', 'Thriller', 'Mystery', 'Horror', 'Sci-Fi', 'Drama'];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsSignup(params.get('mode') === 'signup');
  }, [location.search]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre],
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const displayName = [firstName, lastName].join(' ').trim() || 'Reader';
        await signUp({ email, password, displayName, ageBracket, genrePreferences: selectedGenres });
      } else {
        await signIn({ email, password });
      }
      toast.success('Welcome to Rachayetria');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const firebaseError = error as FirebaseError;
      const code = firebaseError?.code ?? '';
      const messageMap: Record<string, string> = {
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/user-not-found': 'No account found. Please sign up first.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'This email is already registered. Please log in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
        'auth/network-request-failed': 'Network error. Check internet and try again.',
        'auth/invalid-api-key': 'Firebase API key is invalid. Check your .env config.',
        'permission-denied': 'Firestore permission denied. Check Firestore rules deployment.',
      };
      toast.error(messageMap[code] ?? `Authentication failed (${code || 'unknown error'}).`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F9F7FF] p-3 dark:bg-slate-950 md:p-6">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-20 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
      <div className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-[#E6D6FF] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-[#E6D6FF]/80 blur-3xl" />
      <div className="relative grid w-full max-w-5xl gap-3 rounded-2xl border border-white/70 bg-white/70 p-3 shadow-[0_20px_50px_rgba(108,59,255,0.09)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/70 md:grid-cols-[1.4fr_1fr] md:gap-4 md:p-4">
        <form onSubmit={onSubmit} className="rounded-xl border border-slate-200/80 bg-white/85 p-5 dark:border-slate-700 dark:bg-slate-900/90 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <img src="/logo-r.jpeg" alt="Rachayetria" className="h-8 w-8 rounded object-cover" />
            <p className="text-xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">Rachayetria</p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
            {isSignup ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="mb-6 mt-2 text-base leading-relaxed text-gray-600 dark:text-slate-400">
            {isSignup ? 'Start your reading journey' : 'Continue your reading journey'}
          </p>

          {isSignup ? (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          ) : null}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-gray-500 dark:text-slate-400">Email or Phone Number</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or phone number"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-gray-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary transition hover:text-primary/80"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {isSignup ? (
            <>
              <p className="mb-1.5 text-sm text-gray-500 dark:text-slate-400">Age</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {ageOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setAgeBracket(option.value)}
                    className={[
                      'rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                      ageBracket === option.value
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <p className="mb-1.5 text-sm text-gray-500 dark:text-slate-400">Genre Preferences</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={[
                      'rounded-md border px-2.5 py-1 text-xs font-medium transition duration-200',
                      selectedGenres.includes(genre)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-primary/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-[#6C3BFF] to-[#7A4DFF] shadow-[0_10px_24px_rgba(108,59,255,0.25)] transition duration-200 hover:scale-[1.02]"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isSignup ? 'GET STARTED' : 'LOGIN'}
          </Button>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-gray-600 dark:text-slate-400"
            onClick={() => {
              setIsSignup((prev) => prev === false);
              setSelectedGenres([]);
            }}
          >
            {isSignup ? 'Already have an account? Log In' : 'Don’t have an account? Sign Up'}
          </button>
        </form>

        <aside className="rounded-xl bg-[#E6D6FF]/70 p-4 dark:bg-slate-800/70 md:p-6">
          <div className="rounded-xl bg-white/90 p-4 dark:bg-slate-900/90">
            <img src="/logo-r.jpeg" alt="Rachayetria visual" className="h-40 w-full rounded-xl object-contain" />
          </div>
          <div className="mt-4 rounded-xl bg-white/90 p-4 dark:bg-slate-900/90">
            <p className="text-xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">Read. Discuss. Belong.</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              Unlock premium stories, add paragraph comments, and join fandom-style discussions.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
