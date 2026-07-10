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
