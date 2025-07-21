export const APP_CONFIG = {
  name: 'Next.js SSR App',
  version: '1.0.0',
  description: 'A modern web application built with Next.js',
} as const;

export const BACKEND_API_URL =
  process.env.BACKEND_API_URL || 'http://localhost:8000';

export const NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const ROUTES = {
  HOME: '/',
  HEALTH: '/api/healthcheck',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
