import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyTokenWithAuthServer } from './tokenVerification';

/**
 * 認証が不要な公開パスのリスト
 */
const PUBLIC_PATHS = [
  '/signin', // サインインページ
  '/unauthorized', // 未認証エラーページ
  '/forbidden', // 権限エラーページ
  '/not-found', // 404エラーページ
];

/**
 * 認証チェックをスキップするパスかどうかを判定します。
 * @param pathname - チェックするパス
 * @returns 公開パスの場合はtrue、そうでなければfalse
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * サインインページかどうかを判定します。
 * @param pathname - チェックするパス
 * @returns サインインページの場合はtrue、そうでなければfalse
 */
export function isSigninPage(pathname: string): boolean {
  return pathname.startsWith('/signin');
}

/**
 * APIルートかどうかを判定します。
 * @param pathname - チェックするパス
 * @returns APIルートの場合はtrue、そうでなければfalse
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

/**
 * サインインページの認証処理を実行します。
 * ログイン済みの場合は/にリダイレクト、未ログインの場合はunauthorized()を実行
 * @param request - NextRequestオブジェクト
 * @returns NextResponseオブジェクト
 */
export async function handleSigninPageAuthentication(
  request: NextRequest
): Promise<NextResponse> {
  const token = getAuthToken(request);

  // トークンが存在しない場合は、unauthorized()を実行するためにページレンダリングを続行
  if (!token) {
    return NextResponse.next();
  }

  // トークンを検証します
  const { isValid, isExpired } = await verifyTokenWithAuthServer(token);

  // トークンが無効または期限切れの場合
  if (!isValid) {
    if (isExpired) {
      // 期限切れトークンをクリアしてからページレンダリングを続行
      return createTokenExpiredResponse();
    }
    // 無効なトークンの場合はページレンダリングを続行（unauthorized()が実行される）
    return NextResponse.next();
  }

  // トークンが有効な場合は、ホームページにリダイレクト
  return NextResponse.redirect(new URL('/', request.url));
}

/**
 * リクエストから認証トークンを取得します。
 * @param request - NextRequestオブジェクト
 * @returns 認証トークン（存在しない場合はundefined）
 */
export function getAuthToken(request: NextRequest): string | undefined {
  return request.cookies.get('auth-token')?.value;
}

/**
 * 期限切れのトークンをクリアするレスポンスを作成します。
 * @returns 期限切れトークンをクリアしたNextResponseオブジェクト
 */
export function createTokenExpiredResponse(): NextResponse {
  const response = NextResponse.next();

  // 期限切れの場合はCookieを削除
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}

/**
 * 認証ミドルウェアのメイン処理を実行します。
 * @param request - NextRequestオブジェクト
 * @returns NextResponseオブジェクト
 */
export async function handleAuthentication(
  request: NextRequest
): Promise<NextResponse> {
  // 認証が不要な公開パスの場合は、認証チェックをスキップします
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // APIルートへのリクエストは認証チェックをスキップします
  // APIルート側で個別の認証処理を実装することを想定しています
  if (isApiRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // すべての認証が必要なページについて、AuthRequiredコンポーネントが
  // サーバーサイドで認証チェックを行うため、ミドルウェアでは
  // 基本的なトークンの有効性チェックのみを行い、
  // 詳細な認証処理はページコンポーネント側に委譲します

  const token = getAuthToken(request);

  // トークンが期限切れの場合はクッキーをクリア
  if (token) {
    try {
      const { isExpired } = await verifyTokenWithAuthServer(token);
      if (isExpired) {
        return createTokenExpiredResponse();
      }
    } catch (error) {
      console.error('Token verification failed in middleware:', error);
      // エラーの場合もページレンダリングを続行し、
      // AuthRequiredコンポーネントで適切に処理
    }
  }

  // AuthRequiredコンポーネントに認証処理を委譲
  return NextResponse.next();
}
