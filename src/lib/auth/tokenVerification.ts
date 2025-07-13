import { getJWTUserInfo, isJWTExpired, isJWTValid } from '@/lib/auth/jwt';

/**
 * トークン検証結果を表すインターフェース
 */
export interface TokenVerificationResult {
  isValid: boolean;
  isExpired: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    roles?: string[];
  };
}

/**
 * 外部認証サーバーでJWTトークンを検証します。
 * @param token - 検証するJWTトークン
 * @returns トークンの有効性（isValid）と期限切れ（isExpired）を示すオブジェクト
 */
export async function verifyTokenWithAuthServer(
  token: string
): Promise<TokenVerificationResult> {
  const authServerUrl = process.env.BACKEND_API_URL;

  // 外部認証サーバーのURLが設定されていない場合は無効として扱う
  if (!authServerUrl) {
    return { isValid: false, isExpired: false };
  }

  try {
    // 外部認証サーバーにトークンの検証をリクエストします
    const response = await fetch(`${authServerUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store', // キャッシュを無効化
      },
      cache: 'no-store', // Next.jsのfetchキャッシュも無効化
    });

    // 認証サーバーが401 Unauthorizedを返した場合
    if (response.status === 401) {
      // 401の場合、期限切れかトークン無効かをレスポンスから判断
      const errorData = await response.json().catch(() => ({}));
      const isExpired =
        errorData.error === 'token_expired' || errorData.expired === true;
      return { isValid: false, isExpired };
    }

    // 200 OKの場合、ユーザー情報も取得
    if (response.ok) {
      const data = await response.json();
      return {
        isValid: true,
        isExpired: false,
        user: data.user || data, // レスポンス形式に応じて調整
      };
    }

    return { isValid: false, isExpired: false };
  } catch (error) {
    console.error('Auth server verification error:', error);
    // 外部サーバーへの接続エラーなどが発生した場合は無効として扱う
    return { isValid: false, isExpired: false };
  }
}

/**
 * ローカルでJWTトークンの有効期限のみを検証します（外部サーバーへの問い合わせなし）
 * @param token - 検証するJWTトークン
 * @returns トークンの有効性（isValid）と期限切れ（isExpired）を示すオブジェクト
 */
export function verifyTokenLocally(token: string): TokenVerificationResult {
  try {
    // JWTの形式チェックと有効期限チェック
    const isValid = isJWTValid(token);
    const isExpired = isJWTExpired(token);

    // 有効なトークンの場合、ユーザー情報も取得
    const userInfo = isValid ? getJWTUserInfo(token) : null;

    return {
      isValid,
      isExpired,
      user: userInfo
        ? {
            id: userInfo.id,
            email: userInfo.email || '',
            name: userInfo.name,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Local token verification error:', error);
    return { isValid: false, isExpired: true };
  }
}
