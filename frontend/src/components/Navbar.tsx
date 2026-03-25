'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Menu, X, Search, LogOut, Settings, Coins, Sun, Moon } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Search className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Urban<span className="text-primary">Leads</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className={cn(pathname === '/pricing' && 'bg-secondary')}>
                  Pricing
                </Button>
              </Link>
              {authed && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className={cn(pathname === '/dashboard' && 'bg-secondary')}>
                    Dashboard
                  </Button>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className={cn(pathname === '/admin' && 'bg-secondary')}>
                    <Settings className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {authed ? (
              <div className="hidden md:flex items-center gap-3">
                <Badge variant="accent" className="gap-1 px-3 py-1">
                  <Coins className="h-3 w-3" />
                  {user?.tokenBalance ?? 0} tokens
                </Badge>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-secondary cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2">
          <Link href="/pricing" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Pricing</Button>
          </Link>
          {authed ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Admin</Button>
                </Link>
              )}
              <div className="flex items-center justify-between px-4 py-2">
                <Badge variant="accent" className="gap-1 px-3 py-1">
                  <Coins className="h-3 w-3" />
                  {user?.tokenBalance ?? 0} tokens
                </Badge>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Log in</Button>
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
