/**
 * @fileoverview バックエンドAPIプロキシエンドポイント
 *
 * このファイルは、フロントエンドとバックエンドAPI間の安全な通信を仲介するプロキシサーバーを実装しています。
 * 主な機能：
 * - セキュアなJWT管理（httpOnlyクッキー ⇔ Bearerトークン変換）
 * - 自動JWTリフレッシュ機能（401エラー時の自動再試行）
 * - 国際化対応（X-Languageヘッダー自動付与）
 * - CORS問題の解決
 * - 統一されたエラーハンドリング
 * - クライアントサイドからのJWT隠蔽
 *
 * セキュリティ特徴：
 * - httpOnlyクッキーによるXSS攻撃防止
 * - JWT情報のクライアントサイド隠蔽
 * - SameSite=Strictによるセッション保護
 * - プロダクション環境でのSecure Cookie強制
 * - 自動トークンリフレッシュによるセッション継続
 *
 * @route POST /api/proxy (supports multiple HTTP methods via method parameter)
 * @security JWT management, httpOnly cookies, CORS handling, automatic token refresh
 * @dependencies Backend API Server (BACKEND_API_URL), getJwtCookie for JWT extraction
 */

import { BACKEND_API_URL } from '@/constants';
import {
  secureJwtResponse,
  setJwtAuthHeader,
  tryRefreshJwt,
} from '@/lib/auth/jwtCookie';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * デフォルトのコンテンツタイプ
 * - JSONを使用する場合は 'application/json'
 * - ファイルアップロードの場合は 'multipart/form-data'
 */
const defaultContentsType = 'application/json';

/**
 * GETリクエストのbodyをクエリストリングに変換してURLに追加
 *
 * @param url - 元のURL
 * @param body - リクエストボディ（オブジェクト）
 * @returns クエリストリング付きのURL
 */
function appendQueryStringToUrl(
  url: string,
  body: Record<string, unknown>
): string {
  if (!body || typeof body !== 'object') {
    return url;
  }

  const queryParams = new URLSearchParams();

  // for...ofを使用してオブジェクトのエントリを処理
  for (const [key, value] of Object.entries(body)) {
    if (value !== null && value !== undefined) {
      queryParams.append(key, String(value));
    }
  }

  const queryString = queryParams.toString();
  if (queryString) {
    return url + (url.includes('?') ? '&' : '?') + queryString;
  }

  return url;
}

/**
 * リクエストから適切な言語コードを検出する
 *
 * @param request - NextRequestオブジェクト
 * @param language - リクエストボディで指定された言語（優先）
 * @returns 検出された言語コード、またはundefined
 */
function detectLanguage(
  request: NextRequest,
  language?: string
): string | undefined {
  // リクエストボディのlanguageパラメータを最優先
  if (language) {
    return language;
  }

  // Accept-Languageヘッダーから言語コードを抽出
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    // Accept-Languageから最初の言語コードを抽出（品質値やサブタグを除去）
    return acceptLanguage.split(',')[0].split(';')[0].trim();
  }

  return undefined;
}

/**
 * バックエンドレスポンスを処理してクライアント向けレスポンスを作成
 * JWTがレスポンスに含まれる場合はhttpOnlyクッキーに保存し、ヘッダーから削除
 *
 * @param backendResponse - バックエンドからのレスポンス
 * @param isGetAccessTokenUrl - アクセストークン取得URLかどうかのフラグ
 * @returns 処理済みのクライアントレスポンス
 */
async function processBackendResponse(
  backendResponse: Response,
  isGetAccessTokenUrl: boolean
): Promise<NextResponse> {
  // JWT処理を実行：JWTがあればhttpOnlyクッキーに保存し、ヘッダーから削除
  // レスポンスオブジェクトは参照渡しのため直接変更される
  await secureJwtResponse(backendResponse, isGetAccessTokenUrl);

  // バックエンドからのレスポンスがapplication/jsonの場合
  if (
    backendResponse.headers.get('Content-Type')?.includes(defaultContentsType)
  ) {
    // JSON解析（失敗時は空オブジェクトを返す）
    const responseData = await backendResponse.json().catch(() => ({}));

    // クライアント向けJSONレスポンスの作成
    return NextResponse.json(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });
  }

  // JSON以外のレスポンス（HTML、画像等）の場合はそのまま返す
  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: backendResponse.headers,
  });
}

/**
 * リクエストパラメータを解析・抽出する
 *
 * @param request - NextRequestオブジェクト
 * @returns 解析されたリクエストパラメータ
 */
async function parseRequestParams(request: NextRequest) {
  const contentType = request.headers.get('Content-Type');

  let url: string;
  let method: string;
  let language: string;
  let body: string | FormData | undefined;

  if (contentType === defaultContentsType) {
    const json = await request.json();

    url = json.url;
    method = json.method || 'POST';
    language = json.language;

    // GETメソッドの場合はbodyをクエリストリングに変換してURLに追加
    if (method.toUpperCase() === 'GET' && json.body) {
      url = appendQueryStringToUrl(url, json.body as Record<string, unknown>);
      body = undefined;
    } else {
      body = JSON.stringify(json.body);
    }
  } else {
    const formData = await request.formData();

    url = formData.get('proxy_url') as string;
    formData.delete('proxy_url');

    method = formData.get('proxy_method') as string;
    formData.delete('proxy_method');

    language = formData.get('proxy_language') as string;
    formData.delete('proxy_language');

    body = formData;
  }

  return { url, method, language, body };
}

/**
 * バックエンドAPIへのプロキシ処理メイン関数
 *
 * フロントエンドからのAPIリクエストを安全にバックエンドサーバーに転送し、
 * レスポンスを適切に処理してクライアントに返します。
 *
 * 処理フロー：
 * 1. リクエストボディから転送先URL、HTTPメソッド、ボディデータを抽出
 * 2. httpOnlyクッキーからJWTを取得
 * 3. 国際化対応：現在選択されている言語をX-Languageヘッダーに設定
 * 4. バックエンドAPIへリクエスト送信（JWT付き）
 * 5. 401エラー時：JWTリフレッシュを試行し、成功時に再リクエスト
 * 6. レスポンス処理：新しいJWTがあればhttpOnlyクッキーに保存
 * 7. セキュリティ：Authorizationヘッダーをクライアントレスポンスから削除
 *
 * セキュリティメカニズム：
 * - JWT管理：httpOnlyクッキー（読み取り専用）⇔ Bearerトークン（バックエンド用）変換
 * - 自動トークンリフレッシュ：401エラー検知時の自動JWT更新とリトライ
 * - クライアント隠蔽：JWTや認証情報をフロントエンドJavaScriptから完全に隠蔽
 * - セッション保護：SameSite=StrictとhttpOnlyによる包括的セキュリティ
 *
 * 国際化機能：
 * - リクエストボディのlanguageパラメータを最優先
 * - Accept-Languageヘッダーからの自動言語検出
 * - バックエンドAPIでの適切な言語レスポンス生成支援
 *
 * @param request - フロントエンドからのプロキシリクエスト
 * @returns Promise<NextResponse> - プロキシされたレスポンス（JWT情報除去済み）
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストパラメータの解析・抽出
    const { url, method, language, body } = await parseRequestParams(request);

    // 基本バリデーション：転送先URLは必須パラメータ
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // アクセストークンを取得するURLであるかどうかをチェック
    const isGetAccessTokenUrl =
      url.includes('/api/login') || url.includes('/api/refresh');

    // バックエンドリクエスト用ヘッダーの準備
    const headers: Record<string, string> = {};

    // application/jsonのときのみContent-Typeを追加
    const contentType = request.headers.get('Content-Type');
    if (contentType === defaultContentsType) {
      headers['Content-Type'] = defaultContentsType;
    }

    // JWT認証トークンをヘッダーに設定
    // httpOnlyクッキーから取得したJWTを安全にBearerヘッダーに設定
    await setJwtAuthHeader(headers);

    // 国際化対応：言語情報のX-Languageヘッダー設定
    // バックエンドAPIが適切な言語でレスポンスを返すための言語情報の送信
    const targetLanguage = detectLanguage(request, language);
    if (targetLanguage) {
      headers['X-Language'] = targetLanguage;
    }

    // バックエンドAPIへのリクエスト用のオプションを生成
    const requestOptions: RequestInit = { method, headers, body };

    // バックエンドAPIの完全なURLを構築
    const backendUrl = BACKEND_API_URL + url;

    // バックエンドAPIへのリクエスト送信
    let backendResponse = await fetch(backendUrl, requestOptions);

    // JWT認証エラー時の自動リフレッシュ処理
    // 401エラーの場合、JWTリフレッシュを試行して元のリクエストを再実行
    // これにより、ユーザーはログインし直すことなくセッションを継続できる
    if (backendResponse.status === 401) {
      const refreshResult = await tryRefreshJwt(requestOptions);

      if (refreshResult.success && refreshResult.jwt) {
        // 新しいJWTを取得した場合、元のリクエストオプションを更新
        const retryOptions: RequestInit = {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            Authorization: `Bearer ${refreshResult.jwt}`,
          },
        };

        // リフレッシュ成功後、元のリクエストを再実行
        backendResponse = await fetch(backendUrl, retryOptions);
      }
    }

    // バックエンドレスポンスを処理してクライアント向けレスポンスを作成
    return await processBackendResponse(backendResponse, isGetAccessTokenUrl);
  } catch (error) {
    // エラーハンドリング
    // ネットワークエラー、JSONパースエラー、バックエンド接続エラー等の包括的処理
    // セキュリティのため詳細なエラー情報は隠蔽し、ログにのみ出力
    console.error('Backend proxy error:', error);

    // 統一されたエラーレスポンス（500 Internal Server Error）
    // 攻撃者に内部システム情報を漏洩させないよう一般的なメッセージを返す
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
