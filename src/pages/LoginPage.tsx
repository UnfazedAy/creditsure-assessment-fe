import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Info, ShieldCheck } from 'lucide-react';
import { ApiError } from '../api/client';
import { FullScreenLoader, Spinner } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function LoginPage() {
  const { status, login, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') return <FullScreenLoader label="Checking your session…" />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;

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
      await login(email.trim(), password);
      // AuthContext flips to "authenticated"; the redirect above sends the admin to /dashboard.
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      if (apiError && Object.keys(apiError.fieldErrors).length > 0) {
        setErrors({ email: apiError.fieldErrors.email, password: apiError.fieldErrors.password });
      }
      setFormError(apiError?.message ?? 'Unable to sign in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">CrediSure</h1>
          <p className="mt-1 text-sm text-ink-500">Administration Dashboard</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Sign in</h2>

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
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-ink-500 hover:text-ink-900"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1.5 text-xs text-red-700">
                {errors.password}
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Spinner />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
