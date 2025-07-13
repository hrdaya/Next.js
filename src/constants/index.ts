export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const APP_CONFIG = {
  name: 'Next.js SSR App',
  version: '1.0.0',
  description: 'A modern web application built with Next.js',
} as const;

export const ROUTES = {
  HOME: '/',
  HEALTH: '/api/healthcheck',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
