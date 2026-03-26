'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  Database,
  Shield,
  Pencil,
  Trash2,
  KeyRound,
  X,
  Check,
  Copy,
} from 'lucide-react';

type Tab = 'analytics' | 'users' | 'promos' | 'pricing' | 'lead-data' | 'audit-log';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('analytics');
  const [currentUserId, setCurrentUserId] = useState('');

  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [pricingTiers, setPricingTiers] = useState<any[]>([]);
  const [leadTemplates, setLeadTemplates] = useState<any[]>([]);
  const [auditEntries, setAuditEntries] = useState<any[]>([]);

  // Promo creation
  const [newCode, setNewCode] = useState('');
  const [newTokens, setNewTokens] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Staff creation
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('CLIENT');
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [tempPasswordModal, setTempPasswordModal] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // User editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editTokens, setEditTokens] = useState('');

  // Delete confirmation
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Pricing editing
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState({ name: '', price: '', tokens: '', description: '', popular: false, active: true });
  const [showAddTier, setShowAddTier] = useState(false);
  const [newTierForm, setNewTierForm] = useState({ tierId: '', name: '', price: '', tokens: '', description: '', popular: false, sortOrder: '' });
  const [tierLoading, setTierLoading] = useState(false);
  const [tierError, setTierError] = useState('');

  // Lead data editing
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [companiesText, setCompaniesText] = useState('');
  const [leadDataLoading, setLeadDataLoading] = useState(false);
  const [leadDataMessage, setLeadDataMessage] = useState('');

  const industries = [
    'technology', 'healthcare', 'finance', 'real estate', 'marketing',
    'e-commerce', 'education', 'manufacturing', 'consulting', 'legal',
    'retail', 'logistics',
  ];

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

  const loadPricing = useCallback(async () => {
    try {
      const tiers = await api.admin.getPricing();
      setPricingTiers(tiers);
    } catch { /* ignore */ }
  }, []);

  const loadLeadTemplates = useCallback(async () => {
    try {
      const templates = await api.admin.getLeadTemplates();
      setLeadTemplates(templates);
    } catch { /* ignore */ }
  }, []);

  const loadAuditLog = useCallback(async () => {
    try {
      const entries = await api.admin.getAuditLog();
      setAuditEntries(entries);
    } catch { /* ignore */ }
  }, []);

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
    setCurrentUserId(user.id);
    loadData();
  }, [router, loadData]);

  useEffect(() => {
    if (tab === 'pricing') loadPricing();
    if (tab === 'lead-data') loadLeadTemplates();
    if (tab === 'audit-log') loadAuditLog();
  }, [tab, loadPricing, loadLeadTemplates, loadAuditLog]);

  // ─── Promo handlers ────────────────────────────────────────────────────────

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
    } catch { /* silently fail */ }
  }

  // ─── Staff handlers ────────────────────────────────────────────────────────

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    setStaffError('');
    setStaffLoading(true);
    try {
      const result = await api.admin.createUser({
        email: staffEmail,
        name: staffName || undefined,
        role: staffRole,
      });
      setTempPasswordModal(result.tempPassword);
      setStaffEmail('');
      setStaffName('');
      setStaffRole('CLIENT');
      setShowAddStaff(false);
      const u = await api.admin.users();
      setUsers(u);
    } catch (err: any) {
      setStaffError(err.message || 'Failed to create user');
    } finally {
      setStaffLoading(false);
    }
  }

  async function handleUpdateUser(userId: string) {
    try {
      const data: any = {};
      if (editRole) data.role = editRole;
      if (editTokens !== '') data.tokenBalance = parseInt(editTokens);
      await api.admin.updateUser(userId, data);
      setEditingUserId(null);
      const u = await api.admin.users();
      setUsers(u);
    } catch { /* ignore */ }
  }

  async function handleDeleteUser(userId: string) {
    try {
      await api.admin.deleteUser(userId);
      setDeletingUserId(null);
      const u = await api.admin.users();
      setUsers(u);
    } catch { /* ignore */ }
  }

  async function handleResetPassword(userId: string) {
    try {
      const result = await api.admin.resetPassword(userId);
      setTempPasswordModal(result.tempPassword);
    } catch { /* ignore */ }
  }

  function copyPassword() {
    if (tempPasswordModal) {
      navigator.clipboard.writeText(tempPasswordModal);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  }

  // ─── Pricing handlers ──────────────────────────────────────────────────────

  function startEditTier(tier: any) {
    setEditingTierId(tier.tierId);
    setTierForm({
      name: tier.name,
      price: String(tier.price),
      tokens: String(tier.tokens),
      description: tier.description,
      popular: tier.popular,
      active: tier.active !== undefined ? tier.active : true,
    });
  }

  async function handleSaveTier() {
    if (!editingTierId) return;
    setTierLoading(true);
    setTierError('');
    try {
      await api.admin.updatePricing(editingTierId, {
        name: tierForm.name,
        price: parseFloat(tierForm.price),
        tokens: parseInt(tierForm.tokens),
        description: tierForm.description,
        popular: tierForm.popular,
        active: tierForm.active,
      });
      setEditingTierId(null);
      await loadPricing();
    } catch (err: any) {
      setTierError(err.message || 'Failed to update tier');
    } finally {
      setTierLoading(false);
    }
  }

  async function handleCreateTier(e: React.FormEvent) {
    e.preventDefault();
    setTierLoading(true);
    setTierError('');
    try {
      await api.admin.createPricing({
        tierId: newTierForm.tierId,
        name: newTierForm.name,
        price: parseFloat(newTierForm.price),
        tokens: parseInt(newTierForm.tokens),
        description: newTierForm.description,
        popular: newTierForm.popular,
        sortOrder: newTierForm.sortOrder ? parseInt(newTierForm.sortOrder) : 0,
      });
      setShowAddTier(false);
      setNewTierForm({ tierId: '', name: '', price: '', tokens: '', description: '', popular: false, sortOrder: '' });
      await loadPricing();
    } catch (err: any) {
      setTierError(err.message || 'Failed to create tier');
    } finally {
      setTierLoading(false);
    }
  }

  // ─── Lead data handlers ────────────────────────────────────────────────────

  function handleSelectIndustry(industry: string) {
    setSelectedIndustry(industry);
    setLeadDataMessage('');
    const existing = leadTemplates.find(t => t.industry === industry);
    if (existing) {
      setCompaniesText(existing.companies.join('\n'));
    } else {
      setCompaniesText('');
    }
  }

  async function handleSaveLeadTemplate() {
    if (!selectedIndustry) return;
    setLeadDataLoading(true);
    setLeadDataMessage('');
    try {
      const companies = companiesText.split('\n').map(c => c.trim()).filter(Boolean);
      await api.admin.upsertLeadTemplate(selectedIndustry, companies);
      setLeadDataMessage('Saved successfully');
      await loadLeadTemplates();
    } catch (err: any) {
      setLeadDataMessage(err.message || 'Failed to save');
    } finally {
      setLeadDataLoading(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

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
        <p className="text-muted-foreground">Manage users, promos, pricing, and more</p>
      </div>

      {/* Temp password modal */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-lg">Temporary Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share this password with the user. It will only be shown once.
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 font-mono text-lg">
                <span className="flex-1 select-all">{tempPasswordModal}</span>
                <Button variant="ghost" size="sm" onClick={copyPassword}>
                  {copiedPassword ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                className="w-full"
                onClick={() => { setTempPasswordModal(null); setCopiedPassword(false); }}
              >
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {([
          { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
          { id: 'users' as const, label: 'Users', icon: Users },
          { id: 'promos' as const, label: 'Promo Codes', icon: Tag },
          { id: 'pricing' as const, label: 'Pricing', icon: DollarSign },
          { id: 'lead-data' as const, label: 'Lead Data', icon: Database },
          { id: 'audit-log' as const, label: 'Audit Log', icon: Shield },
        ] as const).map((t) => (
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

      {/* ════════════════════ Analytics Tab ════════════════════ */}
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

      {/* ════════════════════ Users Tab ════════════════════ */}
      {tab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          {/* Add Staff Button / Form */}
          {!showAddStaff ? (
            <Button onClick={() => setShowAddStaff(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Staff Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStaff} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="sm:w-56"
                    required
                  />
                  <Input
                    placeholder="Name (optional)"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="sm:w-40"
                  />
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-32"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <Button type="submit" disabled={staffLoading}>
                    {staffLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddStaff(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
                {staffError && <p className="mt-2 text-sm text-destructive">{staffError}</p>}
              </CardContent>
            </Card>
          )}

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
                      <th className="pb-3 pr-4 font-medium">Joined</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <React.Fragment key={u.id}>
                        <tr className="border-b border-border/50">
                          <td className="py-3 pr-4">{u.email}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{u.name || '-'}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">{u.tokenBalance}</td>
                          <td className="py-3 pr-4">{u._count.searches}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (editingUserId === u.id) {
                                    setEditingUserId(null);
                                  } else {
                                    setEditingUserId(u.id);
                                    setEditRole(u.role);
                                    setEditTokens(String(u.tokenBalance));
                                  }
                                }}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetPassword(u.id)}
                                title="Reset Password"
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
                              {u.id !== currentUserId && (
                                <>
                                  {deletingUserId === u.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteUser(u.id)}
                                      >
                                        Confirm
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeletingUserId(null)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeletingUserId(u.id)}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {editingUserId === u.id && (
                          <tr className="border-b border-border/50 bg-muted/30">
                            <td colSpan={7} className="py-3 px-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <label className="text-sm font-medium">Role:</label>
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                                  disabled={u.id === currentUserId}
                                >
                                  <option value="CLIENT">CLIENT</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                                <label className="text-sm font-medium">Tokens:</label>
                                <Input
                                  type="number"
                                  value={editTokens}
                                  onChange={(e) => setEditTokens(e.target.value)}
                                  className="w-24"
                                  min="0"
                                />
                                <Button size="sm" onClick={() => handleUpdateUser(u.id)}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingUserId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════ Promos Tab ════════════════════ */}
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

      {/* ════════════════════ Pricing Tab ════════════════════ */}
      {tab === 'pricing' && (
        <div className="space-y-4 animate-fade-in">
          {!showAddTier ? (
            <Button onClick={() => setShowAddTier(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Tier
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Pricing Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTier} className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Tier ID (e.g. enterprise)"
                      value={newTierForm.tierId}
                      onChange={(e) => setNewTierForm({ ...newTierForm, tierId: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Name"
                      value={newTierForm.name}
                      onChange={(e) => setNewTierForm({ ...newTierForm, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Price (USD)"
                      type="number"
                      step="0.01"
                      value={newTierForm.price}
                      onChange={(e) => setNewTierForm({ ...newTierForm, price: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Tokens"
                      type="number"
                      value={newTierForm.tokens}
                      onChange={(e) => setNewTierForm({ ...newTierForm, tokens: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Description"
                      value={newTierForm.description}
                      onChange={(e) => setNewTierForm({ ...newTierForm, description: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Sort order"
                      type="number"
                      value={newTierForm.sortOrder}
                      onChange={(e) => setNewTierForm({ ...newTierForm, sortOrder: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newTierForm.popular}
                        onChange={(e) => setNewTierForm({ ...newTierForm, popular: e.target.checked })}
                        className="rounded"
                      />
                      Popular
                    </label>
                    <Button type="submit" disabled={tierLoading}>
                      {tierLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowAddTier(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
                {tierError && <p className="mt-2 text-sm text-destructive">{tierError}</p>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Tiers ({pricingTiers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Tier ID</th>
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Price</th>
                      <th className="pb-3 pr-4 font-medium">Tokens</th>
                      <th className="pb-3 pr-4 font-medium">Description</th>
                      <th className="pb-3 pr-4 font-medium">Popular</th>
                      <th className="pb-3 pr-4 font-medium">Active</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTiers.map((tier) => (
                      <React.Fragment key={tier.tierId}>
                        <tr className="border-b border-border/50">
                          <td className="py-3 pr-4 font-mono">{tier.tierId}</td>
                          <td className="py-3 pr-4">{tier.name}</td>
                          <td className="py-3 pr-4">${tier.price}</td>
                          <td className="py-3 pr-4">{tier.tokens}</td>
                          <td className="py-3 pr-4 max-w-48 truncate">{tier.description}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={tier.popular ? 'default' : 'outline'}>
                              {tier.popular ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={tier.active ? 'default' : 'destructive'}>
                              {tier.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editingTierId === tier.tierId ? setEditingTierId(null) : startEditTier(tier)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                        {editingTierId === tier.tierId && (
                          <tr className="border-b border-border/50 bg-muted/30">
                            <td colSpan={8} className="py-3 px-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                                  <Input
                                    value={tierForm.name}
                                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Price (USD)</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={tierForm.price}
                                    onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Tokens</label>
                                  <Input
                                    type="number"
                                    value={tierForm.tokens}
                                    onChange={(e) => setTierForm({ ...tierForm, tokens: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                                  <Input
                                    value={tierForm.description}
                                    onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={tierForm.popular}
                                    onChange={(e) => setTierForm({ ...tierForm, popular: e.target.checked })}
                                    className="rounded"
                                  />
                                  Popular
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={tierForm.active}
                                    onChange={(e) => setTierForm({ ...tierForm, active: e.target.checked })}
                                    className="rounded"
                                  />
                                  Active
                                </label>
                                <Button size="sm" onClick={handleSaveTier} disabled={tierLoading}>
                                  {tierLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingTierId(null)}>
                                  Cancel
                                </Button>
                              </div>
                              {tierError && <p className="mt-2 text-sm text-destructive">{tierError}</p>}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════ Lead Data Tab ════════════════════ */}
      {tab === 'lead-data' && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Lead Template Companies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => handleSelectIndustry(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-64"
                >
                  <option value="">Select industry...</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {selectedIndustry && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Companies (one per line)
                    </label>
                    <textarea
                      value={companiesText}
                      onChange={(e) => setCompaniesText(e.target.value)}
                      rows={12}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
                      placeholder="Enter company names, one per line..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleSaveLeadTemplate} disabled={leadDataLoading}>
                      {leadDataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                    {leadDataMessage && (
                      <span className={`text-sm ${leadDataMessage.includes('success') ? 'text-green-600' : 'text-destructive'}`}>
                        {leadDataMessage}
                      </span>
                    )}
                  </div>
                </>
              )}

              {leadTemplates.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Saved Templates</h3>
                  <div className="flex flex-wrap gap-2">
                    {leadTemplates.map((t) => (
                      <Badge
                        key={t.id}
                        variant={selectedIndustry === t.industry ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleSelectIndustry(t.industry)}
                      >
                        {t.industry} ({t.companies.length})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════ Audit Log Tab ════════════════════ */}
      {tab === 'audit-log' && (
        <div className="animate-fade-in">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Recent Admin Actions
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={loadAuditLog}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {auditEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No admin actions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Time</th>
                        <th className="pb-3 pr-4 font-medium">Admin</th>
                        <th className="pb-3 pr-4 font-medium">Action</th>
                        <th className="pb-3 pr-4 font-medium">Target</th>
                        <th className="pb-3 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditEntries.map((entry, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">{entry.adminEmail}</td>
                          <td className="py-3 pr-4">
                            <Badge variant="outline">{entry.action}</Badge>
                          </td>
                          <td className="py-3 pr-4">{entry.target}</td>
                          <td className="py-3 text-muted-foreground max-w-48 truncate">{entry.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
