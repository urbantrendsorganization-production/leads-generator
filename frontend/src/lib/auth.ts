'use client';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUser(user: any): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem('user');
}

export function logout(): void {
  removeToken();
  removeUser();
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
