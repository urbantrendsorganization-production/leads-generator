const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trendyyleads.com';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(body.error || 'Request failed', res.status);
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name?: string }) =>
      request<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<any>('/api/auth/me'),
  },

  leads: {
    search: (query: {
      industry?: string;
      location?: string;
      companySize?: string;
      keywords?: string;
    }) =>
      request<{ searchId: string; results: any[]; remainingTokens: number }>(
        '/api/leads/search',
        { method: 'POST', body: JSON.stringify(query) }
      ),
    history: () => request<any[]>('/api/leads/history'),
  },

  promos: {
    redeem: (code: string) =>
      request<{ tokensAdded: number; newBalance: number }>('/api/promos/redeem', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
  },

  payments: {
    checkout: (tierId: string) =>
      request<{ reference: string; url: string }>('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          tierId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      }),
    verify: (reference: string) =>
      request<{ alreadyCredited: boolean; tokenBalance: number }>('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({ reference }),
      }),
  },

  pricing: {
    list: () =>
      request<
        {
          id: string;
          name: string;
          price: number;
          tokens: number;
          description: string;
          popular: boolean;
        }[]
      >('/api/pricing'),
  },

  admin: {
    users: () => request<any[]>('/api/admin/users'),
    createUser: (data: { email: string; name?: string; role: string }) =>
      request<any>('/api/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id: string, data: { role?: string; tokenBalance?: number }) =>
      request<any>(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteUser: (id: string) =>
      request<any>(`/api/admin/users/${id}`, { method: 'DELETE' }),
    resetPassword: (id: string) =>
      request<{ tempPassword: string }>(`/api/admin/users/${id}/reset-password`, { method: 'POST' }),
    promos: () => request<any[]>('/api/admin/promos'),
    createPromo: (data: { code: string; tokensGrant: number; maxUses?: number | null }) =>
      request<any>('/api/admin/promos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    togglePromo: (id: string, active: boolean) =>
      request<any>(`/api/admin/promos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      }),
    analytics: () => request<any>('/api/admin/analytics'),
    getPricing: () => request<any[]>('/api/admin/pricing'),
    updatePricing: (tierId: string, data: any) =>
      request<any>(`/api/admin/pricing/${tierId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    createPricing: (data: any) =>
      request<any>('/api/admin/pricing', { method: 'POST', body: JSON.stringify(data) }),
    getLeadTemplates: () => request<any[]>('/api/admin/lead-templates'),
    upsertLeadTemplate: (industry: string, companies: string[]) =>
      request<any>(`/api/admin/lead-templates/${encodeURIComponent(industry)}`, {
        method: 'PUT',
        body: JSON.stringify({ companies }),
      }),
    getAuditLog: () => request<any[]>('/api/admin/audit-log'),
  },
};

export { ApiError };
