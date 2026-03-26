'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import { Loader2, Zap } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.auth.register({ email, password, name: name || undefined });
      setToken(result.token);
      setUser(result.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 hero-mesh overflow-hidden">
      {/* Glow orb */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl p-8 animate-fade-in"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(6,182,212,0.2)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-7">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl gradient-bg glow-cyan mb-4">
            <img src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774512463/t_x4jvlv.png" alt="" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Sign up and get 1 free lead search instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Name (optional)
            </label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(6,182,212,0.25)',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(6,182,212,0.25)',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(6,182,212,0.25)',
              }}
            />
          </div>
          {error && (
            <div
              className="rounded-xl p-3 text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full btn-shimmer gradient-bg text-white font-bold border-0 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] hover:opacity-95 transition-all duration-300"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account&hellip;
              </>
            ) : (
              'Create Account — Free'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#06b6d4' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
