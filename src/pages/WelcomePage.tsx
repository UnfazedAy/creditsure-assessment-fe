import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <section className="card w-full max-w-lg p-8 text-center sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Welcome to CrediSure</h1>
        <p className="mt-2 text-sm text-ink-500">A simple and secure user management dashboard.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link to="/admin/login" className="btn-secondary w-full">
            Administrator Login
          </Link>
          <Link to="/login" className="btn-primary w-full">
            User Login
          </Link>
        </div>
        <p className="mt-5 text-sm text-ink-600">
          Need an account?{' '}
          <Link to="/register" className="font-medium text-brand-700 hover:text-brand-800">
            Create Account
          </Link>
        </p>
      </section>
    </main>
  );
}
