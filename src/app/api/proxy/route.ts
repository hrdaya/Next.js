/**
 * @fileoverview バックエンドAPIプロキシエンドポイント
 *
 * このファイルは、フロントエンドとバックエンドAPI間の安全な通信を仲介するプロキシサーバーを実装しています。
 * 主な機能：
 * - セキュアなJWT管理（httpOnlyクッキー ⇒ Bearerトークン変換）
 * - プロキシによるCORS問題の解決
 * - 国際化対応（X-Languageヘッダー自動付与）
 * - 統一されたエラーハンドリング
 * - クライアントサイドからのJWT隠蔽
 *
 * セキュリティ特徴：
 * - httpOnlyクッキーによるXSS攻撃防止
 * - JWT情報のクライアントサイド隠蔽
 *
 * @route POST /api/proxy (supports multiple HTTP methods via method parameter)
 * @security JWT management, httpOnly cookies, CORS handling, automatic token refresh
 * @dependencies Backend API Server (BACKEND_API_URL), getJwtCookie for JWT extraction
 */

import { BACKEND_API_URL } from '@/constants';
import { getJwtFromCookie } from '@/lib/auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * デフォルトのコンテンツタイプ
 * - JSONを使用する場合は 'application/json'
 * - ファイルアップロードの場合は 'multipart/form-data'
 */
const defaultContentsType = 'application/json';

/**
 * バックエンドAPIへのプロキシリクエストを処理するエンドポイント（POSTのリクエストのみ受け付け）
 *
 * @param request - Next.jsのリクエストオブジェクト
 * @returns NextResponse - プロキシされたレスポンス
 */
export async function POST(request: NextRequest) {
  return handleRequest(request);
}

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
    // JSONリクエストの場合
    const json = await request.json().catch(() => ({}));

    url = json?.url;
    method = json?.method || 'POST';
    language = json?.language;

    const requestMethod = method.toUpperCase();

    // GETメソッドの場合はbodyをクエリストリングに変換してURLに追加
    url =
      requestMethod === 'GET'
        ? appendQueryStringToUrl(url, json.body as Record<string, unknown>)
        : url;

    // POST/PUT/DELETEメソッドの場合はbodyをJSON文字列に変換
    // bodyはGET/HEAD以外のメソッドでのみ使用
    body =
      requestMethod === 'GET' || requestMethod === 'HEAD'
        ? undefined
        : JSON.stringify(json.body);
  } else {
    // フォームデータリクエストの場合（ファイルのアップロード）
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
 * 5. レスポンス処理：クッキーのドメインを削除して、Next.jsのレスポンスに設定
 * 6. レスポンスをクライアントに返却
 *
 * セキュリティメカニズム：
 * - JWT管理：httpOnlyクッキー（読み取り専用）⇒ Bearerトークン（バックエンド用）に変換
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
async function handleRequest(request: NextRequest) {
  try {
    // リクエストパラメータの解析・抽出
    const { url, method, language, body } = await parseRequestParams(request);

    // 基本バリデーション：転送先URLは必須パラメータ
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // バックエンドリクエスト用ヘッダーの準備
    const headers: Record<string, string> = {};

    // application/jsonのときのみContent-Typeを追加
    const contentType = request.headers.get('Content-Type')?.toLowerCase();
    if (contentType === defaultContentsType) {
      headers['Content-Type'] = contentType;
    }

    // JWTトークンをhttpOnlyクッキーから取得し、Authorizationヘッダーに設定
    const jwt = await getJwtFromCookie();
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }

    // 国際化対応：言語情報のX-Languageヘッダー設定
    // バックエンドAPIが適切な言語でレスポンスを返すための言語情報の送信
    const targetLanguage = detectLanguage(request, language);
    if (targetLanguage) {
      headers['X-Language'] = targetLanguage;
    }

    // バックエンドAPIへのリクエスト用のオプションを生成
    const requestOptions: RequestInit = {
      method,
      headers,
      body,
      cache: 'no-store',
    };

    // リクエストをバックエンドAPIに転送
    const laravelResponse = await fetch(
      `${BACKEND_API_URL}${url}`,
      requestOptions
    );

    // Next.jsのレスポンス用のヘッダーを初期化
    const responseHeaders = new Headers();

    // Laravel からのレスポンスヘッダーをすべてコピー
    // Set-Cookie 以外のヘッダーは基本そのまま転送
    for (const [key, value] of laravelResponse.headers.entries()) {
      if (key.toLowerCase() !== 'set-cookie') {
        // Set-Cookie は後で特別に処理するため除外
        responseHeaders.set(key, value);
      }
    }

    // LaravelのSet-Cookieヘッダーを取得
    const setCookieHeaders = laravelResponse.headers.getSetCookie();

    // Set-Cookieヘッダーが存在する場合、Next.jsのレスポンスに追加
    // LaravelのSet-Cookieヘッダーはドメイン属性が含まれるため、Next.jsのドメインに合わせて調整
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      // Laravel から返された Set-Cookie ヘッダーを処理
      const newSetCookieHeaders = setCookieHeaders.map((cookieString) => {
        let newCookie = cookieString;

        // ドメイン属性を削除または Next.js のドメインに書き換える
        newCookie = newCookie.replace(/Domain=[^;]+;?/i, '');

        // パス属性を調整 (例: ルート '/' に設定)
        newCookie = newCookie.replace(/Path=[^;]+;?/i, 'Path=/');

        // 開発環境の場合、Secure属性を削除
        if (process.env.NODE_ENV !== 'production') {
          newCookie = newCookie.replace(/; Secure/i, '');
        }

        return newCookie;
      });

      // 処理した Cookie ヘッダーを Next.js のレスポンスに設定
      // NextResponse.json や NextResponse.text を使う場合、headers を明示的に設定
      for (const cookie of newSetCookieHeaders) {
        responseHeaders.append('Set-Cookie', cookie);
      }
    }

    // バックエンドからのレスポンスがapplication/jsonの場合
    if (
      laravelResponse.headers
        .get('Content-Type')
        ?.toLowerCase()
        .includes(defaultContentsType)
    ) {
      // JSON解析（失敗時は空オブジェクトを返す）
      const responseData = await laravelResponse.json().catch(() => ({}));

      // クライアント向けJSONレスポンスの作成
      return NextResponse.json(responseData, {
        status: laravelResponse.status,
        statusText: laravelResponse.statusText,
        headers: responseHeaders,
      });
    }

    // application/json以外の場合はファイルのダウンロード

    // Content-Length を設定しない (ストリーミングの場合)
    // ただし、一部のクライアントは Content-Length を期待するため注意が必要
    responseHeaders.delete('Content-Length');

    // カスタムの ReadableStream を作成し、それを NextResponse に渡す
    // そして、元の Laravel レスポンスのボディをこのカスタムストリームにパイプする
    const customStream = new ReadableStream({
      async start(controller) {
        // Laravel のレスポンスボディをチャンクごとに読み込み、カスタムストリームにエンキュー
        const reader = laravelResponse.body?.getReader();
        while (reader) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          controller.enqueue(value);
        }

        controller.close();
      },
    });

    return new NextResponse(customStream, {
      status: laravelResponse.status,
      statusText: laravelResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    // エラーハンドリング
    // ネットワークエラー、JSONパースエラー、バックエンド接続エラー等の包括的処理
    // セキュリティのため詳細なエラー情報は隠蔽し、ログにのみ出力
    console.error('Proxy request failed:', error);

    // 統一されたエラーレスポンス（500 Internal Server Error）
    // 攻撃者に内部システム情報を漏洩させないよう一般的なメッセージを返す
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
