import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Copy, Eye, EyeOff, Info, ShieldCheck } from 'lucide-react';
import { ApiError } from '../api/client';
import { FullScreenLoader, Spinner } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/api';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const DEMO_ADMIN_ACCESS = {
  email: 'admin@credisure.com',
  password: 'Password123@',
} as const;

interface LoginPageProps {
  mode: 'admin' | 'user';
}

interface LoginLocationState {
  from?: { pathname?: string };
  registered?: boolean;
  email?: string;
}

function destinationFor(user: User, requestedPath?: string): string {
  const allowedPaths =
    user.role === 'admin'
      ? ['/dashboard', '/users', '/profile']
      : ['/my-dashboard', '/profile'];

  return requestedPath && allowedPaths.includes(requestedPath)
    ? requestedPath
    : user.role === 'admin'
      ? '/dashboard'
      : '/my-dashboard';
}

export default function LoginPage({ mode }: LoginPageProps) {
  const { status, user, login, notice, clearNotice } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as LoginLocationState | null;
  const isAdminLogin = mode === 'admin';
  const [email, setEmail] = useState(routeState?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');

  if (status === 'loading') return <FullScreenLoader label="Checking your session…" />;
  if (status === 'authenticated') {
    return <Navigate to={user ? destinationFor(user, routeState?.from?.pathname) : '/'} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    clearNotice();
    setSubmitting(true);
    try {
      const authenticatedUser = await login(email.trim(), password, isAdminLogin ? 'admin' : undefined);
      navigate(destinationFor(authenticatedUser, routeState?.from?.pathname), { replace: true });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      if (apiError && Object.keys(apiError.fieldErrors).length > 0) {
        setErrors({ email: apiError.fieldErrors.email, password: apiError.fieldErrors.password });
      }
      setFormError(apiError?.message ?? 'Unable to sign in. Please try again.');
      setSubmitting(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_ADMIN_ACCESS.email);
      setCopyFeedback('Email copied.');
    } catch {
      setCopyFeedback('Clipboard access is unavailable. You can select and copy the email above.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className={`w-full ${isAdminLogin ? 'max-w-md' : 'max-w-sm'}`}>
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">CrediSure</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isAdminLogin ? 'Administration Dashboard' : 'Secure account access'}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold">{isAdminLogin ? 'Administrator Sign In' : 'User Sign In'}</h2>

          {routeState?.registered && !isAdminLogin && (
            <div role="status" className="flex gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Your account was created. Sign in to continue.</span>
            </div>
          )}
          {notice && (
            <div role="status" className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}
          {formError && (
            <div role="alert" className="flex gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && (
              <p id="email-error" className="mt-1.5 text-xs text-red-700">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-ink-500 hover:text-ink-900"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1.5 text-xs text-red-700">
                {errors.password}
              </p>
            )}
          </div>

          {isAdminLogin && (
            <aside className="rounded-lg border border-brand-100 bg-brand-50/60 p-3 text-sm">
              <h3 className="font-semibold text-ink-900">Demo Administrator Access</h3>
              <dl className="mt-2 space-y-1 text-ink-700">
                <div className="flex flex-wrap gap-x-1">
                  <dt className="font-medium">Email:</dt>
                  <dd>{DEMO_ADMIN_ACCESS.email}</dd>
                </div>
                <div className="flex flex-wrap gap-x-1">
                  <dt className="font-medium">Password:</dt>
                  <dd>{DEMO_ADMIN_ACCESS.password}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs leading-5 text-ink-500">
                These credentials are provided exclusively for assessment review. The account has administrative
                access to fictional demo records.
              </p>
              <button type="button" onClick={() => void copyEmail()} className="btn-secondary mt-3 min-h-9 px-3 text-xs">
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy email
              </button>
              {copyFeedback && <p role="status" className="mt-2 text-xs text-ink-600">{copyFeedback}</p>}
            </aside>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Spinner />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center text-sm text-ink-600">
          {!isAdminLogin && (
            <p>
              New to CrediSure?{' '}
              <Link to="/register" className="font-medium text-brand-700 hover:text-brand-800">
                Create an account
              </Link>
            </p>
          )}
          <p>
            {isAdminLogin ? 'Signing in as a user?' : 'Administrator?'}{' '}
            <Link
              to={isAdminLogin ? '/login' : '/admin/login'}
              className="font-medium text-brand-700 hover:text-brand-800"
            >
              {isAdminLogin ? 'User login' : 'Administrator login'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
