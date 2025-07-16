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

import { BACKEND_API_URL } from '@/constants';
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
