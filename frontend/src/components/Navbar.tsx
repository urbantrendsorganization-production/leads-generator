'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Menu, X, LogOut, Settings, Coins, ChevronRight } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setUser(getUser());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: 'Pricing', href: '/pricing' },
    ...(authed ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin', href: '/admin' }] : []),
  ];

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(13,13,13,0.92)'
            : 'rgba(13,13,13,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid transparent',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300"
                  style={{ background: 'var(--brand-primary)', boxShadow: '0 0 16px var(--brand-primary-glow)' }}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                    <path d="M3 14L8 7.5L12 11L17 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="17" cy="4" r="2" fill="white" opacity="0.9" />
                  </svg>
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  TRENDYY <span style={{ color: 'var(--brand-primary)' }}>LEADS</span>
                </span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href}>
                    <button
                      className={cn(
                        'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
                        pathname === link.href
                          ? 'text-white bg-white/08'
                          : 'text-[#777777] hover:text-white hover:bg-white/05'
                      )}
                      style={pathname === link.href ? { background: 'rgba(255,255,255,0.07)' } : undefined}
                    >
                      {link.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {authed ? (
                <div className="hidden md:flex items-center gap-3">
                  {/* Token balance */}
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-black"
                    style={{
                      background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent)',
                      color: 'var(--brand-primary)',
                    }}
                  >
                    <Coins className="h-3.5 w-3.5" />
                    {user?.tokenBalance ?? 0}
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                    style={{ color: '#555555' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555555'; }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <button
                      className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                      style={{ color: '#777777' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#777777'; }}
                    >
                      Log in
                    </button>
                  </Link>
                  <Link href="/register">
                    <button
                      className="btn-primary-hover inline-flex items-center gap-1.5 px-4 py-2 text-sm font-black rounded-lg transition-all duration-200"
                      style={{
                        background: 'var(--brand-primary)',
                        color: '#ffffff',
                        boxShadow: '0 0 20px var(--brand-primary-glow)',
                      }}
                    >
                      Get Started
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile menu trigger */}
              <button
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200"
                style={{ color: '#777777', background: menuOpen ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu — full-screen overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden flex flex-col"
          style={{ background: 'rgba(13,13,13,0.97)', top: '64px' }}
        >
          <div className="flex flex-col p-6 gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-4 text-base font-semibold transition-all duration-200"
                style={{
                  color: pathname === link.href ? 'var(--brand-primary)' : '#888888',
                  background: pathname === link.href ? 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {link.label}
                <ChevronRight className="h-4 w-4 opacity-40" />
              </Link>
            ))}
          </div>

          {/* Mobile auth actions */}
          <div className="mt-auto p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {authed ? (
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent)' }}
                >
                  <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>Token Balance</span>
                  <span className="inline-flex items-center gap-1.5 font-black text-sm" style={{ color: 'var(--brand-primary)' }}>
                    <Coins className="h-4 w-4" />
                    {user?.tokenBalance ?? 0} tokens
                  </span>
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <button
                    className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200"
                    style={{ color: '#888888', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}
                  >
                    Log in
                  </button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <button
                    className="w-full rounded-xl px-4 py-3.5 text-sm font-black transition-all duration-200"
                    style={{ background: 'var(--brand-primary)', color: '#ffffff' }}
                  >
                    Join Free
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
