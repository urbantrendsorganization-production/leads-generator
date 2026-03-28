'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Menu, X, LogOut, Settings, Coins, Sun, Moon } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setUser(getUser());
    const isDark = document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group min-w-0">
              <img
                src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774512463/t_x4jvlv.png"
                alt="Logo"
                className="h-8 w-8 object-contain shrink-0 transition-transform group-hover:scale-105"
              />
              <span className="text-lg sm:text-xl font-black tracking-tight text-foreground truncate">
                TRENDYY <span style={{ color: '#FFB800' }}>LEADS</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/pricing">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'font-semibold',
                    pathname === '/pricing' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Pricing
                </Button>
              </Link>
              {authed && (
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'font-semibold',
                      pathname === '/dashboard' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Dashboard
                  </Button>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'font-semibold',
                      pathname === '/admin' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right-side Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {authed ? (
              <div className="hidden md:flex items-center gap-3">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
                  style={{
                    background: 'rgba(255,184,0,0.1)',
                    border: '1px solid rgba(255,184,0,0.3)',
                    color: '#FFB800',
                  }}
                >
                  <Coins className="h-3.5 w-3.5" />
                  {user?.tokenBalance ?? 0}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="font-black shadow-md hover:opacity-90 transition-all"
                    style={{ background: '#FFB800', color: '#0a0a0a' }}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden rounded-lg p-2 text-muted-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t p-4 space-y-1 bg-background animate-fade-in">
          <Link href="/pricing" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start font-semibold" style={{ minHeight: '44px' }}>
              Pricing
            </Button>
          </Link>
          {authed && (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start font-semibold"
                style={{ minHeight: '44px' }}
              >
                Dashboard
              </Button>
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-semibold" style={{ minHeight: '44px' }}>
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          )}
          {authed ? (
            <div className="pt-2 border-t mt-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold"
                  style={{
                    background: 'rgba(255,184,0,0.12)',
                    border: '1px solid rgba(255,184,0,0.3)',
                    color: '#FFB800',
                  }}
                >
                  <Coins className="h-4 w-4" />
                  {user?.tokenBalance ?? 0} tokens
                </span>
                <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full font-semibold" style={{ minHeight: '44px' }}>Log in</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full font-black" style={{ background: '#FFB800', color: '#0a0a0a', minHeight: '44px' }}>
                  Join Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}