'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import { Loader2, ArrowRight, CheckCircle2, Gift } from 'lucide-react';

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
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* Left brand panel — hidden on mobile, visible lg+ */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden auth-brand-panel">
        <Image
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80"
          alt="Technology data visualization"
          fill
          className="object-cover opacity-25"
          sizes="50vw"
          priority
        />
        {/* Gold gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, rgba(13,13,13,0.8) 55%, rgba(13,13,13,0.95) 100%)',
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
            {/* Free search highlight */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-sm font-bold"
              style={{
                background: 'rgba(255,184,0,0.12)',
                border: '1px solid rgba(255,184,0,0.3)',
                color: '#FFB800',
              }}
            >
              <Gift className="h-4 w-4" />
              1 Free Lead Search on Sign Up
            </div>

            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Start finding leads<br />
              <span className="hero-gradient-text">in under 60 seconds.</span>
            </h2>
            <p className="text-zinc-400 text-base mb-8 max-w-sm leading-relaxed">
              Create your free account and instantly access our lead database. No credit card required.
            </p>
            <div className="space-y-3">
              {[
                'Free to get started — no card needed',
                '50+ industries, 30+ countries',
                'Verified data updated every 24 hours',
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
        {/* Subtle glow */}
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

          {/* Mobile free search badge */}
          <div
            className="flex items-center justify-center gap-2 rounded-full px-4 py-2 mb-6 text-sm font-bold mx-auto w-fit lg:hidden"
            style={{
              background: 'rgba(255,184,0,0.12)',
              border: '1px solid rgba(255,184,0,0.3)',
              color: '#FFB800',
            }}
          >
            <Gift className="h-4 w-4" />
            1 Free Lead Search on Sign Up
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
              <h1 className="text-2xl font-bold text-white">Create your account</h1>
              <p className="mt-1 text-sm text-zinc-500">Sign up and get 1 free lead search instantly</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Name (optional)
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,184,0,0.2)',
                    minHeight: '44px',
                  }}
                />
              </div>
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
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
                    Creating account&hellip;
                  </>
                ) : (
                  <>
                    Create Account — Free
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: '#FFB800' }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
