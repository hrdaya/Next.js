/**
 * JWT関連のユーティリティ関数
 * ローカルでのJWT有効期限チェック機能を提供
 *
 * このモジュールは、JWTトークンの検証を2つの方法で提供します:
 * 1. ローカル検証: 有効期限のみをチェック（高速、オフライン対応）
 * 2. サーバー検証: 外部認証サーバーで完全な検証（安全、ネットワーク必要）
 *
 * パフォーマンス考慮事項:
 * - ローカル検証は即座に結果を返すため、ページレンダリングを高速化
 * - サーバー検証は完全な署名検証を行うが、ネットワーク遅延が発生
 * - 通常はローカル検証を使用し、セキュリティが重要な操作ではサーバー検証を使用
 */

/**
 * JWT payload の型定義
 */
export interface JWTPayload {
  exp: number; // 有効期限 (Unix timestamp)
  iat: number; // 発行時刻 (Unix timestamp)
  sub?: string; // subject (通常はユーザーID)
  email?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * トークン検証結果を表すインターフェース
 *
 * 検証処理の結果として返される情報を定義します。
 */
export interface TokenVerificationResult {
  /** トークンが有効かどうか（形式チェック + 有効期限チェック） */
  isValid: boolean;
  /** トークンが期限切れかどうか */
  isExpired: boolean;
  /** トークンから抽出されたユーザー情報（有効な場合のみ） */
  user?: {
    /** ユーザーID（JWTのsubjectクレーム） */
    id: string;
    /** ユーザーのメールアドレス */
    email: string;
    /** ユーザーの表示名（オプション） */
    name?: string;
    /** ユーザーの権限ロール（オプション） */
    roles?: string[];
  };
}

/**
 * Base64URLエンコードされた文字列をデコードします
 * @param base64url - Base64URLエンコードされた文字列
 * @returns デコードされた文字列
 */
function base64UrlDecode(base64url: string): string {
  // Base64URL から Base64 に変換
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

  // パディングを追加
  switch (base64.length % 4) {
    case 2:
      base64 += '==';
      break;
    case 3:
      base64 += '=';
      break;
  }

  return atob(base64);
}

/**
 * JWTトークンをデコードしてペイロードを取得します
 * @param token - JWTトークン
 * @returns デコードされたペイロード
 * @throws JWT形式が無効な場合はエラーをスロー
 */
export function decodeJWT(token: string): JWTPayload {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  try {
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload) as JWTPayload;
  } catch (error) {
    throw new Error('Failed to decode JWT payload');
  }
}

/**
 * JWTトークンの有効期限をチェックします
 * @param token - 検証するJWTトークン
 * @returns トークンが有効期限内かどうか
 */
export function isJWTValid(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000); // 現在時刻（Unix timestamp）

    // exp (expiration time) が現在時刻より後であれば有効
    return payload.exp > currentTime;
  } catch (error) {
    // JWT のデコードに失敗した場合は無効
    return false;
  }
}

/**
 * JWTトークンが期限切れかどうかをチェックします
 * @param token - 検証するJWTトークン
 * @returns トークンが期限切れかどうか
 */
export function isJWTExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000);

    // exp (expiration time) が現在時刻より前であれば期限切れ
    return payload.exp <= currentTime;
  } catch (error) {
    // JWT のデコードに失敗した場合は期限切れとして扱う
    return true;
  }
}

/**
 * JWTトークンから有効期限の残り時間（秒）を取得します
 * @param token - JWTトークン
 * @returns 有効期限までの残り時間（秒）、無効な場合は0
 */
export function getJWTExpirationTime(token: string): number {
  try {
    const payload = decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = payload.exp - currentTime;

    return Math.max(0, remainingTime);
  } catch (error) {
    return 0;
  }
}

/**
 * JWTトークンからユーザー情報を取得します
 * @param token - JWTトークン
 * @returns ユーザー情報、無効な場合はnull
 */
export function getJWTUserInfo(
  token: string
): { id: string; email?: string; name?: string } | null {
  try {
    const payload = decodeJWT(token);

    return {
      id: payload.sub || '',
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    return null;
  }
}

/**
 * ローカルでJWTトークンの有効期限のみを検証します（高速検証）
 *
 * この関数は外部サーバーに問い合わせることなく、JWTトークンの
 * 形式チェックと有効期限のみをローカルで検証します。
 *
 * 検証内容:
 * - JWT形式の妥当性（3つのパートに分かれているか）
 * - Base64URLデコードの成功
 * - ペイロードのJSON形式
 * - 有効期限（exp）の確認
 *
 * 使用場面:
 * - ページ表示時の高速な認証チェック
 * - APIリクエスト前の事前チェック
 * - リアルタイムUI更新での認証状態確認
 *
 * 利点:
 * - 瞬時に結果を返すためUXが向上
 * - ネットワーク不要でオフラインでも動作
 * - サーバー負荷を軽減
 *
 * 制限事項:
 * - JWT署名の検証は行わない（信頼できる環境での使用を前提）
 * - トークン取り消しリストとの照合は行わない
 * - 改ざんされたトークンを検出できない可能性
 *
 * @param token - 検証するJWTトークン
 * @returns TokenVerificationResult 検証結果（同期）
 */
export function verifyTokenLocally(token: string): TokenVerificationResult {
  try {
    // JWTの基本的な形式チェックと有効期限チェック
    const isValid = isJWTValid(token);
    const isExpired = isJWTExpired(token);

    // 有効なトークンの場合、ペイロードからユーザー情報を抽出
    const userInfo = isValid ? getJWTUserInfo(token) : null;

    return {
      isValid,
      isExpired,
      user: userInfo
        ? {
            id: userInfo.id,
            email: userInfo.email || '',
            name: userInfo.name,
            // 必要に応じて他のクレームも追加可能
          }
        : undefined,
    };
  } catch (error) {
    // JWT解析エラーやその他の予期しないエラーをハンドリング
    console.error('Local token verification error:', error);
    // エラーが発生した場合は期限切れとして扱う（安全側に倒す）
    return { isValid: false, isExpired: true };
  }
}
