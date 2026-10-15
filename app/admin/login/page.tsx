'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { COMPANY } from '@/lib/constants';

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_MS = 15 * 60 * 1000;
const RATE_LIMIT_STORAGE_KEY = 'gav-admin-login-rate-limit';

type LoginRateLimit = {
  failedAttempts: number;
  lockedUntil: number;
};

function getRateLimitKey(email: string) {
  return `${RATE_LIMIT_STORAGE_KEY}:${encodeURIComponent(email.trim().toLowerCase())}`;
}

function readRateLimit(email: string): LoginRateLimit {
  const key = getRateLimitKey(email);
  const stored = window.localStorage.getItem(key);
  if (!stored) return { failedAttempts: 0, lockedUntil: 0 };

  let record: LoginRateLimit;
  try {
    record = JSON.parse(stored);
  } catch {
    throw new Error("Unable to read login rate-limit data. Clear this site's stored data and try again.");
  }

  if (
    !record ||
    !Number.isInteger(record.failedAttempts) ||
    record.failedAttempts < 0 ||
    !Number.isFinite(record.lockedUntil) ||
    record.lockedUntil < 0
  ) {
    throw new Error('Login rate-limit data is invalid. Clear this site’s stored data and try again.');
  }

  if (record.lockedUntil > 0 && record.lockedUntil <= Date.now()) {
    window.localStorage.removeItem(key);
    return { failedAttempts: 0, lockedUntil: 0 };
  }

  return record;
}

function recordFailedLogin(email: string): LoginRateLimit {
  const record = readRateLimit(email);
  if (record.lockedUntil > Date.now()) return record;

  const failedAttempts = record.failedAttempts + 1;
  const updated = {
    failedAttempts,
    lockedUntil: failedAttempts >= MAX_FAILED_ATTEMPTS ? Date.now() + COOLDOWN_MS : 0,
  };

  window.localStorage.setItem(getRateLimitKey(email), JSON.stringify(updated));
  return updated;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedEmail, setLockedEmail] = useState('');
  const [lockedUntil, setLockedUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!lockedUntil) {
      setCooldownSeconds(0);
      return;
    }

    const updateCooldown = () => {
      const seconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCooldownSeconds(seconds);
      if (seconds === 0) {
        setLockedEmail('');
        setLockedUntil(0);
      }
    };

    updateCooldown();
    const interval = window.setInterval(updateCooldown, 1000);
    return () => window.clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    try {
      const rateLimit = readRateLimit(email);
      if (rateLimit.lockedUntil > Date.now()) {
        setLockedEmail(email.trim().toLowerCase());
        setLockedUntil(rateLimit.lockedUntil);
        toast.error('Too many failed attempts. Try again in 15 minutes.');
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to check login rate limit.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        const rateLimit = recordFailedLogin(email);
        if (rateLimit.lockedUntil > 0) {
          setLockedEmail(email.trim().toLowerCase());
          setLockedUntil(rateLimit.lockedUntil);
          toast.error('Too many failed attempts. Try again in 15 minutes.');
        } else {
          toast.error(error);
        }
        return;
      }

      window.localStorage.removeItem(getRateLimitKey(email));
      toast.success('Welcome back.');
      router.push('/admin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isCoolingDown =
    lockedEmail === email.trim().toLowerCase() && cooldownSeconds > 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 grain-overlay">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-sm border border-primary/40 flex items-center justify-center bg-primary/5">
              <span className="font-serif text-primary text-xl font-semibold">GA</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{COMPANY.name}</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard Sign In</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border/40 rounded-sm p-6 lg:p-8">
          <div>
            <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isCoolingDown}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-sm text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCoolingDown ? (
              <>Try again in {Math.floor(cooldownSeconds / 60)}:{String(cooldownSeconds % 60).padStart(2, '0')}</>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Authorized personnel only. Contact your administrator for access.
        </p>
      </div>
    </div>
  );
}
