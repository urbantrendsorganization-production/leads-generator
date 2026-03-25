'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { isAuthenticated, getUser } from '@/lib/auth';
import {
  Loader2,
  Users,
  BarChart3,
  Tag,
  DollarSign,
  Search,
  Plus,
  Power,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'analytics' | 'users' | 'promos'>('analytics');

  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);

  const [newCode, setNewCode] = useState('');
  const [newTokens, setNewTokens] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [a, u, p] = await Promise.all([
        api.admin.analytics(),
        api.admin.users(),
        api.admin.promos(),
      ]);
      setAnalytics(a);
      setUsers(u);
      setPromos(p);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = getUser();
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [router, loadData]);

  async function handleCreatePromo(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      await api.admin.createPromo({
        code: newCode.toUpperCase().trim(),
        tokensGrant: parseInt(newTokens),
        maxUses: newMaxUses ? parseInt(newMaxUses) : null,
      });
      setNewCode('');
      setNewTokens('');
      setNewMaxUses('');
      const p = await api.admin.promos();
      setPromos(p);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create promo code');
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleTogglePromo(id: string, active: boolean) {
    try {
      await api.admin.togglePromo(id, !active);
      const p = await api.admin.promos();
      setPromos(p);
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, promos, and view analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[
          { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
          { id: 'users' as const, label: 'Users', icon: Users },
          { id: 'promos' as const, label: 'Promo Codes', icon: Tag },
        ].map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab(t.id)}
            className="gap-2"
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Button>
        ))}
      </div>

      {/* Analytics Tab */}
      {tab === 'analytics' && analytics && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: analytics.totalUsers, icon: Users },
              { label: 'Total Searches', value: analytics.totalSearches, icon: Search },
              { label: 'Searches (24h)', value: analytics.searchesLast24h, icon: BarChart3 },
              { label: 'Revenue', value: `$${analytics.totalRevenue.toFixed(2)}`, icon: DollarSign },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {analytics.topUsers?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Users by Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topUsers.map((u: any, i: number) => (
                    <div key={u.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-5">{i + 1}.</span>
                        <span className="font-medium">{u.email}</span>
                        {u.name && <span className="text-muted-foreground">({u.name})</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{u._count.searches} searches</Badge>
                        <Badge variant="outline">{u.tokenBalance} tokens</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Email</th>
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Role</th>
                      <th className="pb-3 pr-4 font-medium">Tokens</th>
                      <th className="pb-3 pr-4 font-medium">Searches</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border/50">
                        <td className="py-3 pr-4">{u.email}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{u.name || '-'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">{u.tokenBalance}</td>
                        <td className="py-3 pr-4">{u._count.searches}</td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promos Tab */}
      {tab === 'promos' && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePromo} className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="CODE"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="uppercase sm:w-40"
                  required
                />
                <Input
                  placeholder="Tokens to grant"
                  type="number"
                  min="1"
                  value={newTokens}
                  onChange={(e) => setNewTokens(e.target.value)}
                  className="sm:w-40"
                  required
                />
                <Input
                  placeholder="Max uses (blank = unlimited)"
                  type="number"
                  min="1"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                  className="sm:w-52"
                />
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </form>
              {createError && (
                <p className="mt-2 text-sm text-destructive">{createError}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Promo Codes ({promos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Code</th>
                      <th className="pb-3 pr-4 font-medium">Tokens</th>
                      <th className="pb-3 pr-4 font-medium">Uses</th>
                      <th className="pb-3 pr-4 font-medium">Max Uses</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promos.map((p) => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-mono font-medium">{p.code}</td>
                        <td className="py-3 pr-4">{p.tokensGrant}</td>
                        <td className="py-3 pr-4">{p.uses}</td>
                        <td className="py-3 pr-4">{p.maxUses ?? 'Unlimited'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={p.active ? 'default' : 'destructive'}>
                            {p.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePromo(p.id, p.active)}
                          >
                            <Power className="h-4 w-4" />
                            {p.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
