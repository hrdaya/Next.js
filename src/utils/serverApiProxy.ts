/**
 * サーバーコンポーネント用のプロキシ経由API通信ユーティリティ
 *
 * Server ComponentsでのSSR初期データ取得専用
 * 内部的にプロキシルートを使用して適切なクッキー管理を実現
 */

import { NEXT_PUBLIC_API_BASE_URL } from '@/constants';
import { getServerI18n } from '@/lib/i18n/server';
import type { ResponseBase } from '@/types/response';
import { forbidden, notFound, unauthorized } from 'next/navigation';

/**
 * サーバーコンポーネントからプロキシ経由でバックエンドAPIにリクエストを送信
 * JWTリフレッシュとクッキー管理が正常に動作する
 *
 * @param url - バックエンドAPIのURL
 * @param method - HTTPメソッド
 * @param body - リクエストボディ
 * @param headers - 追加のヘッダー
 * @returns レスポンスデータ
 * @internal 内部使用のみ - getServerDataまたはpostServerDataを使用してください
 */
async function fetchViaProxy<T, V = unknown>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: V,
  headers?: Record<string, string>
): Promise<ResponseBase<T>> {
  // サーバーサイドi18n初期化
  const { i18n, language } = await getServerI18n();

  const defaultResponseData: ResponseBase<T> = {
    ok: false,
    status: -1,
    statusText: 'Unknown',
    message: '',
    data: undefined as T,
  };

  try {
    // プロキシAPIに送信するペイロード
    const proxyPayload = {
      url,
      method,
      body,
      language, // 現在の言語を追加
    };

    // プロキシAPI経由でリクエスト送信
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(proxyPayload),
      credentials: 'include', // httpOnlyクッキーを含める
      cache: 'no-store',
    });

    const { ok, status, statusText } = response;
    defaultResponseData.status = status;
    defaultResponseData.statusText = statusText;

    // レスポンスボディを初期化
    let payload = undefined;

    try {
      // レスポンスボディをJSONとしてパース
      payload = (await response.json()) || {};
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return {
        ...defaultResponseData,
        message: i18n.t('common.ApiErrors.invalidResponseFormat'),
      };
    }

    // 正常レスポンスもしくはバリデーションエラーの場合
    if (ok || status === 422) {
      return {
        ...defaultResponseData,
        ok: true,
        ...(payload as T),
      };
    }

    // エラーハンドリング
    if (status === 401) {
      // 認証エラー（プロキシで自動リフレッシュが失敗した場合）
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

    // その他のエラーメッセージを翻訳対応で追加
    switch (status) {
      case 405:
        defaultResponseData.message = i18n.t(
          'common.ApiErrors.methodNotAllowed'
        );
        break;
      case 409:
        defaultResponseData.message = i18n.t('common.ApiErrors.optimisticLock');
        break;
      case 500:
        defaultResponseData.message = i18n.t(
          'common.ApiErrors.internalServerError'
        );
        break;
      case 503:
        defaultResponseData.message = i18n.t('common.ApiErrors.maintenance');
        break;
      default:
        console.error('Unhandled API error:', response);
        defaultResponseData.message = `${response.status}: ${response.statusText}`;
    }

    return defaultResponseData;
  } catch (error) {
    console.error('Server API proxy request error:', error);
    defaultResponseData.message = i18n.t('common.ApiErrors.networkError');

    return {
      ...defaultResponseData,
      statusText: 'Network Error',
    };
  }
}

/**
 * サーバーコンポーネントでのGETリクエスト（データ取得）
 */
export async function getServerData<T, V = unknown>(
  url: string,
  body?: V,
  headers?: Record<string, string>
): Promise<ResponseBase<T>> {
  return fetchViaProxy<T, V>(url, 'GET', body, headers);
}

/**
 * サーバーコンポーネントでのPOSTリクエスト（データ作成）
 */
export async function postServerData<T, V = unknown>(
  url: string,
  body?: V,
  headers?: Record<string, string>
): Promise<ResponseBase<T>> {
  return fetchViaProxy<T, V>(url, 'POST', body, headers);
}
