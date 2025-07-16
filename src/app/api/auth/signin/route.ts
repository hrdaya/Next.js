/**
 * @fileoverview ユーザー認証（サインイン）APIルート
 *
 * このファイルは、Next.js App Routerの認証エンドポイント (/api/auth/signin) を実装しています。
 * 以下の機能を提供します：
 * - JSONとForm Dataの両方の形式でのリクエスト受付
 * - プロキシAPIを通じた安全なバックエンド認証サーバーへの接続
 * - 認証成功時のJWTクッキー設定とリダイレクト処理
 * - Form Data送信時のRedirectとJSON送信時のJSONレスポンスの使い分け
 * - 包括的なエラーハンドリングとログ出力
 *
 * @route POST /api/auth/signin
 * @security Uses httpOnly cookies for JWT storage, CSRF protection through same-origin requests
 * @dependencies
 * - Backend API Server (BACKEND_API_URL)
 * - Proxy API (/api/proxy) for secure backend communication
 */

import { BACKEND_API_URL } from '@/constants';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * リクエストからemail/passwordを抽出する関数
 *
 * 複数のContent-Typeに対応してユーザー認証情報を抽出します。
 * - application/json: API呼び出し（fetch、axios等）から送信されたJSON形式のデータ
 * - application/x-www-form-urlencoded: HTML form要素から送信されたForm Data
 *
 * @param request - Next.jsのリクエストオブジェクト
 * @returns Promise<{email: string, password: string, isFormData: boolean}>
 * @throws Error - サポートされていないContent-Typeの場合
 *
 * @example
 * // JSON形式の場合
 * const { email, password, isFormData } = await extractCredentials(request);
 * // isFormData = false, email = "user@example.com", password = "password123"
 *
 * @example
 * // Form Data形式の場合
 * const { email, password, isFormData } = await extractCredentials(request);
 * // isFormData = true, email = "user@example.com", password = "password123"
 */
async function extractCredentials(request: NextRequest) {
  // Content-Typeヘッダーを取得（デフォルト値として空文字を設定）
  const contentType = request.headers.get('content-type') || '';

  // JSON形式のリクエストを処理
  // 主にAPIクライアント（fetch、axios等）からの呼び出しで使用
  if (contentType.includes('application/json')) {
    const jsonData = await request.json();
    return {
      email: jsonData.email,
      password: jsonData.password,
      isFormData: false, // JSONレスポンスを返すことを示すフラグ
    };
  }

  // Form Data形式のリクエストを処理
  // 主にHTML formタグからの直接送信で使用
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    return {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      isFormData: true, // リダイレクトレスポンスを返すことを示すフラグ
    };
  }

  // サポートされていないContent-Typeの場合はエラーを投げる
  throw new Error('Unsupported content type');
}

/**
 * エラーレスポンスを作成する関数
 *
 * リクエストの種類（JSON or Form Data）に応じて適切なエラーレスポンスを生成します。
 * - Form Data: ユーザーをサインインページにリダイレクトし、URLパラメータにエラーメッセージを含める
 * - JSON: APIクライアント向けにJSONエラーレスポンスを返す
 *
 * @param request - Next.jsのリクエストオブジェクト（リダイレクトURL生成に使用）
 * @param error - エラーメッセージ（ユーザーに表示される）
 * @param status - HTTPステータスコード（400, 401, 403, 500等）
 * @param isFormData - Form Dataからのリクエストかどうかのフラグ
 * @returns NextResponse - リダイレクトまたはJSONエラーレスポンス
 *
 * @example
 * // Form Dataの場合: /signin?error=Invalid%20credentials にリダイレクト
 * createErrorResponse(request, "Invalid credentials", 401, true);
 *
 * @example
 * // JSONの場合: {"error": "Invalid credentials"} をステータス401で返す
 * createErrorResponse(request, "Invalid credentials", 401, false);
 */
function createErrorResponse(
  request: NextRequest,
  error: string,
  status: number,
  isFormData: boolean
) {
  // Form Dataの場合：サインインページにリダイレクト
  // エラーメッセージをURLパラメータとして渡すことで、
  // クライアントサイドでエラー表示が可能
  if (isFormData) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/signin?error=${encodeURIComponent(error)}`
    );
  }

  // JSON APIの場合：構造化されたエラーレスポンスを返す
  // フロントエンドのAPIクライアントが適切にエラーハンドリング可能
  return NextResponse.json({ error }, { status });
}

/**
 * 成功レスポンスを作成する関数
 *
 * 認証成功時のレスポンスを生成し、JWTクッキーの設定も行います。
 * リクエストの種類に応じて適切なレスポンス形式を選択：
 * - Form Data: ダッシュボードページ（/）にリダイレクト
 * - JSON: APIクライアント向けにユーザー情報を含むJSONレスポンス
 *
 * プロキシAPIから返されたSet-Cookieヘッダーを転送することで、
 * httpOnlyのJWTクッキーがブラウザに安全に設定されます。
 *
 * @param request - Next.jsのリクエストオブジェクト（リダイレクトURL生成に使用）
 * @param authData - 認証サーバーから返されたユーザー情報
 * @param proxyResponse - プロキシAPIからのレスポンス（Set-Cookieヘッダー取得用）
 * @param isFormData - Form Dataからのリクエストかどうかのフラグ
 * @returns NextResponse - リダイレクトまたはJSONレスポンス（JWTクッキー付き）
 *
 * @example
 * // Form Dataの場合: / にリダイレクト + JWTクッキー設定
 * createSuccessResponse(request, {user: {...}}, proxyResponse, true);
 *
 * @example
 * // JSONの場合: {"success": true, "user": {...}} + JWTクッキー設定
 * createSuccessResponse(request, {user: {...}}, proxyResponse, false);
 */
function createSuccessResponse(
  request: NextRequest,
  authData: { user?: unknown },
  proxyResponse: Response,
  isFormData: boolean
) {
  let response: NextResponse;

  // Form Dataの場合：認証成功後にダッシュボードページにリダイレクト
  // これによりユーザーは自動的にアプリケーションのメイン画面に遷移
  if (isFormData) {
    response = NextResponse.redirect(`${request.nextUrl.origin}/`);
  } else {
    // JSON APIの場合：成功フラグとユーザー情報を含むレスポンス
    // フロントエンドはこの情報を使ってUI状態を更新可能
    response = NextResponse.json({
      success: true,
      user: authData.user,
    });
  }

  // プロキシAPIで設定されたJWTクッキーを転送
  // これにより、httpOnlyフラグ付きのセキュアなJWTがブラウザに設定される
  // XSSやCSRF攻撃からの保護が強化される
  const cookies = proxyResponse.headers.get('set-cookie');
  if (cookies) {
    response.headers.set('set-cookie', cookies);
  }

  return response;
}

/**
 * メインの認証エンドポイント（POST /api/auth/signin）
 *
 * ユーザーのサインイン処理を行うNext.js App Routerのエンドポイントです。
 * 以下の流れで認証を実行します：
 *
 * 1. リクエストからユーザー認証情報（email/password）を抽出
 * 2. 入力値の基本バリデーション（必須項目チェック）
 * 3. プロキシAPIを通じてバックエンド認証サーバーに認証要求
 * 4. 認証結果に応じたレスポンス生成（成功時はJWTクッキー設定含む）
 * 5. エラー時の適切なハンドリングとログ出力
 *
 * セキュリティ特徴：
 * - プロキシAPIを使用してバックエンドサーバーとの直接通信を避ける
 * - httpOnlyクッキーによるJWT保存でXSS攻撃を防止
 * - Same-originポリシーによるCSRF攻撃対策
 * - 包括的なエラーハンドリングで情報漏洩を防止
 *
 * @param request - Next.jsのPOSTリクエストオブジェクト
 * @returns Promise<NextResponse> - 成功時：ユーザー情報 or リダイレクト、失敗時：エラーレスポンス
 *
 * @example
 * // JSON API呼び出し例
 * fetch('/api/auth/signin', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
 * });
 *
 * @example
 * // HTML Form送信例
 * <form action="/api/auth/signin" method="POST">
 *   <input name="email" type="email" />
 *   <input name="password" type="password" />
 *   <button type="submit">Sign In</button>
 * </form>
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: リクエストから認証情報を抽出
    // JSON形式とForm Data形式の両方に対応
    const { email, password, isFormData } = await extractCredentials(request);

    // Step 2: 基本的な入力値バリデーション
    // 必須フィールドの存在確認（より詳細なバリデーションはバックエンドで実行）
    if (!email || !password) {
      return createErrorResponse(
        request,
        'Email and password are required',
        400,
        isFormData
      );
    }

    // Step 3: プロキシAPIを使用して認証を行う
    // 直接バックエンドに接続せず、内部プロキシを経由することで：
    // - CORS問題の回避
    // - 統一されたエラーハンドリング
    // - セキュリティの向上（内部通信の隠蔽）
    const proxyResponse = await fetch(`${request.nextUrl.origin}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${BACKEND_API_URL}/auth/signin`,
        method: 'POST',
        body: { email, password },
      }),
    });

    // Step 4: 認証結果の処理
    if (!proxyResponse.ok) {
      // 認証失敗時：バックエンドからのエラーメッセージを取得
      // JSON解析に失敗した場合は空オブジェクトを使用（安全なフォールバック）
      const errorData = await proxyResponse.json().catch(() => ({}));
      return createErrorResponse(
        request,
        errorData.error || 'Invalid credentials',
        proxyResponse.status,
        isFormData
      );
    }

    // Step 5: 認証成功時の処理
    // ユーザー情報の取得とJWTクッキーの設定を含む成功レスポンス生成
    const authData = await proxyResponse.json();
    return createSuccessResponse(request, authData, proxyResponse, isFormData);
  } catch (error) {
    // Step 6: 予期しないエラーのハンドリング
    // ネットワークエラー、JSONパースエラー、その他のシステムエラー
    console.error('Auth server connection error:', error);

    // エラー時にもContent-Typeを再確認してレスポンス形式を決定
    // extractCredentials()でエラーが発生した場合の安全な処理
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes(
      'application/x-www-form-urlencoded'
    );

    // サービス利用不可エラー（503）で統一的にエラーレスポンスを返す
    return createErrorResponse(
      request,
      'Authentication server unavailable',
      503,
      isFormData
    );
  }
}
