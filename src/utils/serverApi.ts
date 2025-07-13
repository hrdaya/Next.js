/**
 * サーバーサイド用のAPI通信ユーティリティ
 *
 * Server ComponentsでのSSR初期データ取得専用
 * POST通信のみをサポートし、httpOnlyのcookieからJWTトークンを自動取得
 */

import { getServerSession } from '@/lib/auth/session';
import type { ResponseBase } from '@/types/response';
import { forbidden, notFound, unauthorized } from 'next/navigation';

/**
 * サーバーサイド用のAPIリクエストオプションを構成する（POST専用）
 * @param body - リクエストボディ（JSON文字列）
 * @param headers - 追加のヘッダー
 * @returns RequestInit オブジェクト
 */
export async function getServerApiOptions(
  body?: string,
  headers?: Record<string, string>
): Promise<RequestInit> {
  const jwt = await getServerSession();

  return {
    cache: 'no-store',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt && { Authorization: `Bearer ${jwt}` }),
      ...headers,
    },
    body,
  };
}

/**
 * サーバーサイドでAPIリクエストを実行する（POST専用）
 * @param url - リクエストURL
 * @param body - リクエストボディ
 * @param headers - 追加のヘッダー
 * @returns レスポンスデータ
 */
export async function serverPost<T, V = unknown>(
  url: string,
  body?: V,
  headers?: Record<string, string>
): Promise<ResponseBase<T>> {
  const message: string[] = [];
  const defaultResponseData: ResponseBase<T> = {
    ok: false,
    status: -1,
    statusText: 'Unknown',
    message,
    data: undefined as T,
  };

  try {
    const options = await getServerApiOptions(JSON.stringify(body), headers);
    const response = await fetch(url, options);

    return await serverHandler<T>(response, defaultResponseData, message);
  } catch (error) {
    console.error('Server API request error:', error);
    message.push('サーバーAPI通信に失敗しました。');
    return {
      ...defaultResponseData,
      status: -1,
      statusText: 'Network Error',
      message,
    };
  }
}

/**
 * SSR初期データ取得用のシンプルなAPI関数
 * Server Componentsでの使用を想定
 *
 * 使用例:
 * ```typescript
 * // Server Component
 * export default async function UsersPage() {
 *   const response = await fetchServerData<User[]>('/api/users');
 *   if (!response.ok) return <div>エラーが発生しました</div>;
 *   return <div>{response.data?.map(user => ...)}</div>;
 * }
 * ```
 */
export async function fetchServerData<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<ResponseBase<T>> {
  return serverPost<T>(url, body, headers);
}

/**
 * サーバーサイドAPIレスポンスハンドラー
 * ステータスコードに応じた適切な処理を行う
 * @param response - fetchのレスポンス
 * @param defaultResponseData - デフォルトのレスポンスデータ
 * @param message - エラーメッセージ配列
 * @returns 処理されたレスポンスデータ
 */
const serverHandler = async <T>(
  response: Response,
  defaultResponseData: ResponseBase<T>,
  message: string[]
): Promise<ResponseBase<T>> => {
  const { ok, status, url, statusText } = response;

  // 204(データ削除の場合のレスポンス)はレスポンスボディが存在しないので別処理
  if (status === 204) {
    return {
      ...defaultResponseData,
      ok: true,
      status,
      statusText,
    };
  }

  // 正常レスポンスもしくはバリデーションエラーの場合
  if (ok || status === 422) {
    try {
      const payload = await response.json();
      return {
        ...defaultResponseData,
        ok: true,
        status,
        statusText,
        ...(payload as T),
      };
    } catch (error) {
      console.warn('Failed to parse JSON response:', error);
      return {
        ...defaultResponseData,
        ok: true,
        status,
        statusText,
      };
    }
  }

  if (status === 401) {
    // 認証エラー
    unauthorized();
  }

  if (status === 403) {
    // 認可エラー
    forbidden();
  }

  if (status === 404) {
    // ページもしくはデータが存在しない
    notFound();
  }

  // エラーステータスコードに応じた処理
  switch (status) {
    case 405: // メソッドが許可されていない
      message.push(`メソッドが許可されていません。[${url}]`);
      break;
    case 409: // 楽観的ロック
      message.push(
        '他の人によって更新されています。再度データを読み込みなおしてください。'
      );
      break;
    case 500: // サーバーエラー
      message.push('サーバーエラーが発生しました。');
      break;
    case 503: // メンテナンス中
      message.push('メンテナンス中です。');
      break;
    default:
      message.push(
        `Server API request failed: ${status} ${statusText} for ${url}`
      );
      break;
  }

  return {
    ...defaultResponseData,
    ok: false,
    status,
    statusText,
    message,
  };
};
