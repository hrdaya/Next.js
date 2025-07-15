/**
 * JWTトークン検証機能
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

import { getJWTUserInfo, isJWTExpired, isJWTValid } from './jwt';

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
 * 外部認証サーバーでJWTトークンを検証します
 *
 * この関数は外部の認証サーバーにトークンを送信し、完全な検証を行います。
 * JWTの署名検証、有効期限チェック、取り消しリストとの照合などが実行されます。
 *
 * 使用場面:
 * - 重要な操作（支払い、データ変更など）の前
 * - 管理者権限が必要な操作
 * - セキュリティが最優先の場合
 *
 * 注意事項:
 * - ネットワーク通信が発生するため遅延が生じる可能性
 * - 外部サーバーが利用不可の場合は無効として扱う
 * - レート制限や認証サーバーの負荷に注意
 *
 * @param token - 検証するJWTトークン
 * @returns Promise<TokenVerificationResult> 検証結果（非同期）
 */
export async function verifyTokenWithAuthServer(
  token: string
): Promise<TokenVerificationResult> {
  // 環境変数から認証サーバーのURLを取得
  const authServerUrl = process.env.BACKEND_API_URL;

  // 外部認証サーバーのURLが設定されていない場合
  // 開発環境やサーバー設定不備を防ぐため無効として扱う
  if (!authServerUrl) {
    console.warn(
      'BACKEND_API_URL is not configured. Token verification failed.'
    );
    return { isValid: false, isExpired: false };
  }

  try {
    // 外部認証サーバーのトークン検証エンドポイントにリクエスト
    const response = await fetch(`${authServerUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        // Bearerトークン形式でトークンを送信
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        // キャッシュを無効化して常に最新の検証結果を取得
        'Cache-Control': 'no-store',
      },
      // Next.jsのfetchキャッシュも無効化
      cache: 'no-store',
    });

    // 認証サーバーが401 Unauthorizedを返した場合
    if (response.status === 401) {
      // 401エラーの詳細を解析して期限切れかどうかを判断
      const errorData = await response.json().catch(() => ({}));
      const isExpired =
        errorData.error === 'token_expired' ||
        errorData.expired === true ||
        errorData.code === 'TOKEN_EXPIRED';

      return { isValid: false, isExpired };
    }

    // 200 OKの場合、トークンは有効
    if (response.ok) {
      const data = await response.json();
      return {
        isValid: true,
        isExpired: false,
        // サーバーからのレスポンス形式に応じてユーザー情報を抽出
        user: data.user || data, // APIの仕様に応じて調整
      };
    }

    // その他のステータスコード（500番台など）は無効として扱う
    console.warn(`Auth server returned status ${response.status}`);
    return { isValid: false, isExpired: false };
  } catch (error) {
    // ネットワークエラー、タイムアウト、サーバーダウンなどをハンドリング
    console.error('Auth server verification error:', error);
    // 外部サーバーへの接続エラーの場合は無効として扱う
    // プロダクション環境では適切なフォールバック処理を検討
    return { isValid: false, isExpired: false };
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
