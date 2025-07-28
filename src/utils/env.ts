/**
 * 環境判定ユーティリティ
 *
 * isProd: 本番環境
 * isDev: 開発環境
 * isTest: テスト環境
 */

export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
