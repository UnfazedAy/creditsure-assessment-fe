import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { register } from '../api/auth';
import { ApiError } from '../api/client';
import { FullScreenLoader, Spinner } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

type RegistrationErrors = Partial<Record<'full_name' | 'email' | 'password' | 'confirm_password', string>>;

export default function RegisterPage() {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') return <FullScreenLoader label="Checking your session…" />;
  if (status === 'authenticated') {
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/my-dashboard'} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: RegistrationErrors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) next.full_name = 'Enter your full name.';
    else if (trimmedName.length < 2 || trimmedName.length > 150) {
      next.full_name = 'Full name must be between 2 and 150 characters.';
    }
    if (!trimmedEmail) next.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(trimmedEmail)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter a password.';
    else if (password.length < 8 || password.length > 128) {
      next.password = 'Password must be between 8 and 128 characters.';
    }
    if (!confirmPassword) next.confirm_password = 'Confirm your password.';
    else if (password !== confirmPassword) next.confirm_password = 'Passwords do not match.';

    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await register({ full_name: trimmedName, email: trimmedEmail, password });
      navigate('/login', { replace: true, state: { registered: true, email: trimmedEmail } });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      if (apiError && Object.keys(apiError.fieldErrors).length > 0) {
        setErrors((previous) => ({
          ...previous,
          full_name: apiError.fieldErrors.full_name,
          email: apiError.fieldErrors.email,
          password: apiError.fieldErrors.password,
        }));
      }
      setFormError(
        apiError?.status === 409
          ? apiError.message || 'An account with this email already exists.'
          : apiError?.message ?? 'Unable to create your account. Please try again.',
      );
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">CrediSure</h1>
          <p className="mt-1 text-sm text-ink-500">Create your user account</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Create Account</h2>

          {formError && (
            <div role="alert" className="flex gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label htmlFor="full-name" className="label">Full name</label>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              maxLength={150}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              aria-invalid={Boolean(errors.full_name)}
              aria-describedby={errors.full_name ? 'full-name-error' : undefined}
              className={`input ${errors.full_name ? 'input-error' : ''}`}
            />
            {errors.full_name && <p id="full-name-error" className="mt-1.5 text-xs text-red-700">{errors.full_name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p id="email-error" className="mt-1.5 text-xs text-red-700">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password && <p id="password-error" className="mt-1.5 text-xs text-red-700">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="label">Confirm password</label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={Boolean(errors.confirm_password)}
                aria-describedby={errors.confirm_password ? 'confirm-password-error' : undefined}
                className={`input pr-11 ${errors.confirm_password ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                aria-pressed={showConfirmPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-ink-500 hover:text-ink-900"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p id="confirm-password-error" className="mt-1.5 text-xs text-red-700">{errors.confirm_password}</p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Spinner />}
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
