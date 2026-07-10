'use client';

// Minimal client-side auth/session storage shared by login/register/profile.

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const saveSession = ({ token, user }) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY));

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = () => !!getToken();

// Demo sign-in — creates a local session without any backend, so the dashboard
// and account pages are testable before the API/seed exist. `demo: true` marks it.
export const demoLogin = (role = 'admin') => {
  const user = {
    id: 0,
    username: role === 'admin' ? 'Demo Admin' : 'Demo User',
    email: 'demo@nishree.com',
    role,
    demo: true,
  };
  saveSession({ token: 'demo-token', user });
  return user;
};
