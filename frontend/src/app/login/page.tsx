'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.auth.login({ email, password });
      setToken(result.token);
      setUser(result.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* Left brand panel — hidden on mobile, visible lg+ */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden auth-brand-panel">
        <Image
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80"
          alt="City skyline at night"
          fill
          className="object-cover opacity-30"
          sizes="50vw"
          priority
        />
        {/* Gold gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,184,0,0.18) 0%, rgba(13,13,13,0.85) 60%, rgba(13,13,13,0.95) 100%)',
          }}
        />
        {/* Brand content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
              style={{ background: '#FFB800' }}
            >
              <img
                src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774512463/t_x4jvlv.png"
                alt=""
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="font-black text-white text-xl tracking-tight">
              TRENDYY <span style={{ color: '#FFB800' }}>LEADS</span>
            </span>
          </div>

          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Your next client<br />
              <span className="hero-gradient-text">is one search away.</span>
            </h2>
            <p className="text-zinc-400 text-base mb-8 max-w-sm leading-relaxed">
              Join thousands of sales professionals who trust TrendyyLeads for verified, high-quality business contacts.
            </p>
            <div className="space-y-3">
              {[
                'Verified emails & direct dials',
                'Filter by industry, location & size',
                'Export to CSV in one click',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#FFB800' }} />
                  <span className="text-zinc-300 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} TrendyyLeads. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: '#0d0d0d' }}
      >
        {/* Subtle glow — mobile only (on large screens the brand panel covers left) */}
        <div
          className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-10 blur-3xl lg:opacity-5"
          style={{ background: 'radial-gradient(circle, #FFB800 0%, transparent 70%)' }}
        />

        <div className="relative w-full max-w-md animate-fade-in">

          {/* Mobile logo — only shown when brand panel is hidden */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
              style={{ background: '#FFB800' }}
            >
              <img
                src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774512463/t_x4jvlv.png"
                alt=""
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="font-black text-white text-xl tracking-tight">
              TRENDYY <span style={{ color: '#FFB800' }}>LEADS</span>
            </span>
          </div>

          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,184,0,0.15)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="mt-1 text-sm text-zinc-500">Sign in to access your lead dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
                    borderColor: 'rgba(255,184,0,0.2)',
                    minHeight: '44px',
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,184,0,0.2)',
                    minHeight: '44px',
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
                className="w-full btn-shimmer btn-primary-hover font-black border-0"
                size="lg"
                disabled={loading}
                style={{ background: '#FFB800', color: '#0a0a0a', minHeight: '48px' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in&hellip;
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: '#FFB800' }}>
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
