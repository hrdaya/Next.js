/**
 * Next.js ミドルウェア認証機能
 *
 * このモジュールは、Next.js ミドルウェアレイヤーで実行される
 * 認証関連の処理を提供します。
 *
 * 役割と責任:
 * - リクエストレベルでの基本的な認証チェック
 * - 期限切れトークンの早期発見とクリア
 * - 適切なページ・APIルートへのルーティング制御
 * - 詳細な認証処理のコンポーネント層への委譲
 *
 * アーキテクチャ設計:
 * - ミドルウェア: 基本的な振り分けとトークン管理
 * - AuthRequired: 詳細な認証チェックと認可
 * - APIルート: 個別の認証・認可ロジック
 *
 * パフォーマンス考慮:
 * - 必要最小限の処理でレスポンス速度を重視
 * - 重い処理はコンポーネント層に委譲
 * - 適切なキャッシュとエラーハンドリング
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyTokenWithAuthServer } from './tokenVerification';

/**
 * 認証チェックをスキップする公開パスの定義
 *
 * これらのパスは認証状態に関係なくアクセス可能です。
 * パスの追加時は、セキュリティリスクを十分に検討してください。
 */
const PUBLIC_PATHS = [
  '/signin', // サインインページ（認証フォーム）
  '/unauthorized', // 401 Unauthorized エラーページ
  '/forbidden', // 403 Forbidden エラーページ
  '/not-found', // 404 Not Found エラーページ
  // 必要に応じて以下を追加:
  // '/signup',    // サインアップページ
  // '/reset',     // パスワードリセットページ
  // '/verify',    // メール確認ページ
] as const;

/**
 * 指定されたパスが認証不要の公開パスかどうかを判定
 *
 * この関数は、リクエストされたパスが認証チェックをスキップすべき
 * 公開リソースかどうかを効率的に判定します。
 *
 * マッチング方式:
 * - 前方一致によるパス判定
 * - 動的ルート（/signin/[token]等）にも対応
 *
 * @param pathname - チェック対象のパス（例: '/signin', '/api/auth'）
 * @returns true: 公開パス, false: 認証が必要なパス
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * サインインページへのアクセスかどうかを判定
 *
 * サインインページには特別な処理が必要なため、
 * 専用の判定関数を提供しています。
 *
 * 特別処理の内容:
 * - 既にログイン済みの場合はホームページへリダイレクト
 * - 期限切れトークンのクリア処理
 *
 * @param pathname - チェック対象のパス
 * @returns true: サインインページ, false: その他のページ
 */
export function isSigninPage(pathname: string): boolean {
  return pathname.startsWith('/signin');
}

/**
 * APIルートへのリクエストかどうかを判定
 *
 * APIルートは個別の認証・認可ロジックを持つため、
 * ミドルウェアレベルでの認証チェックをスキップします。
 *
 * APIルートでの認証処理:
 * - 各エンドポイントで適切な認証レベルを設定
 * - リクエスト内容に応じた細かい認可制御
 * - レスポンス形式の統一（JSON等）
 *
 * @param pathname - チェック対象のパス
 * @returns true: APIルート, false: ページルート
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

/**
 * サインインページでの認証状態チェックと適切な処理
 *
 * この関数は、サインインページにアクセスしたユーザーが
 * 既にログイン済みかどうかをチェックし、適切な処理を行います。
 *
 * 処理フロー:
 * 1. HTTPOnlyクッキーからJWTトークンを取得
 * 2. トークンが存在しない → サインインページを表示
 * 3. トークンが存在 → 外部認証サーバーで検証
 * 4. 有効なトークン → ホームページへリダイレクト
 * 5. 無効/期限切れ → トークンクリア後サインインページ表示
 *
 * セキュリティ考慮:
 * - 期限切れトークンの確実なクリア
 * - 不正なトークンの安全な処理
 * - リダイレクトループの防止
 *
 * UX考慮:
 * - 既にログイン済みユーザーの円滑なナビゲーション
 * - 期限切れ時の適切なメッセージ表示
 *
 * @param request - Next.js リクエストオブジェクト
 * @returns Next.js レスポンスオブジェクト（リダイレクトまたは続行）
 */
export async function handleSigninPageAuthentication(
  request: NextRequest
): Promise<NextResponse> {
  // リクエストクッキーからJWTトークンを取得
  const token = getAuthToken(request);

  // トークンが存在しない場合（未ログイン状態）
  if (!token) {
    // サインインページの表示を続行
    // AuthRequiredコンポーネントまたはページコンポーネントで
    // 適切な未認証処理が実行される
    return NextResponse.next();
  }

  // トークンが存在する場合、外部認証サーバーで検証
  try {
    const { isValid, isExpired } = await verifyTokenWithAuthServer(token);

    // トークンが無効または期限切れの場合
    if (!isValid) {
      if (isExpired) {
        // 期限切れトークンを削除してサインインページを表示
        return createTokenExpiredResponse();
      }
      // 無効なトークンの場合もページレンダリングを続行
      // unauthorized() が適切に実行される
      return NextResponse.next();
    }

    // トークンが有効な場合：既にログイン済み
    // ホームページにリダイレクトしてサインインページへの不要なアクセスを防ぐ
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    // 認証サーバーとの通信エラー等
    console.error(
      'Authentication check failed during signin page access:',
      error
    );
    // エラー時もサインインページの表示を続行
    return NextResponse.next();
  }
}

/**
 * HTTPリクエストから認証トークンを抽出
 *
 * HTTPOnlyクッキーから安全にJWTトークンを取得します。
 * この関数はミドルウェア専用で、クライアントサイドでは使用できません。
 *
 * クッキー仕様:
 * - 名前: 'auth-token'
 * - HttpOnly: true (XSS対策)
 * - SameSite: Strict (CSRF対策)
 * - Secure: true (本番環境でHTTPS必須)
 *
 * @param request - Next.js リクエストオブジェクト
 * @returns JWTトークン文字列、存在しない場合はundefined
 */
export function getAuthToken(request: NextRequest): string | undefined {
  return request.cookies.get('auth-token')?.value;
}

/**
 * 期限切れトークンをクリアするレスポンスを生成
 *
 * JWTトークンが期限切れの場合、セキュリティ上の理由で
 * 速やかにクッキーから削除する必要があります。
 *
 * 削除処理:
 * - Max-Age=0 により即座に期限切れに設定
 * - 同じパス・ドメイン・セキュリティ設定で上書き
 * - ブラウザキャッシュからも確実に削除
 *
 * レスポンス動作:
 * - ページレンダリングは続行
 * - クッキー削除後にサインインページの表示
 * - ユーザーには適切なメッセージを表示
 *
 * @returns トークンクリア処理を含むNext.jsレスポンス
 */
export function createTokenExpiredResponse(): NextResponse {
  const response = NextResponse.next();

  // 期限切れトークンを確実に削除
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // 即座に期限切れ
    path: '/',
  });

  return response;
}

/**
 * 認証ミドルウェアのメイン処理エントリーポイント
 *
 * この関数は、すべてのHTTPリクエストに対して実行され、
 * 適切な認証チェックとルーティング制御を行います。
 *
 * 処理フロー:
 * 1. 公開パスのチェック → 認証スキップ
 * 2. APIルートのチェック → 個別認証に委譲
 * 3. ページルートの場合 → 基本的なトークンチェック
 * 4. 期限切れトークンの早期クリア
 * 5. 詳細認証処理はAuthRequiredコンポーネントに委譲
 *
 * 責任分離:
 * - ミドルウェア: 基本的な振り分けとトークン管理
 * - AuthRequired: 詳細な認証チェックと認可
 * - APIルート: エンドポイント固有の認証・認可
 *
 * パフォーマンス最適化:
 * - 不要な認証チェックのスキップ
 * - 重い処理の後続層への委譲
 * - 適切なエラーハンドリング
 *
 * @param request - Next.js リクエストオブジェクト
 * @returns Next.js レスポンスオブジェクト（リダイレクト・続行・エラー）
 */
export async function handleAuthentication(
  request: NextRequest
): Promise<NextResponse> {
  // 1. 公開パス（認証不要）のチェック
  if (isPublicPath(request.nextUrl.pathname)) {
    // 認証チェックをスキップしてページレンダリングを続行
    return NextResponse.next();
  }

  // 2. APIルートの場合は個別の認証処理に委譲
  // 各APIエンドポイントで適切な認証・認可ロジックを実装
  if (isApiRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // 3. 認証が必要なページルートの処理
  // AuthRequiredコンポーネントが詳細な認証チェックを行うため、
  // ミドルウェアでは基本的なトークン状態の管理のみを実行

  const token = getAuthToken(request);

  // トークンが存在する場合、期限切れチェックを実行
  if (token) {
    try {
      const { isExpired } = await verifyTokenWithAuthServer(token);

      // 期限切れの場合、事前にクッキーをクリア
      // これによりAuthRequiredコンポーネントでの処理が効率化される
      if (isExpired) {
        return createTokenExpiredResponse();
      }
    } catch (error) {
      // 認証サーバーとの通信エラー等
      console.error('Token verification failed in middleware:', error);
      // エラーの場合もページレンダリングを続行し、
      // AuthRequiredコンポーネントで適切に処理される
    }
  }

  // 4. 詳細な認証・認可処理をAuthRequiredコンポーネントに委譲
  // - JWTの署名検証
  // - ユーザー権限のチェック
  // - 適切なエラーページの表示
  return NextResponse.next();
}
