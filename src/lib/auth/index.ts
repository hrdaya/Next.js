/**
 * 認証ライブラリのエントリーポイント
 *
 * このファイルは、認証システムの主要なコンポーネント、関数、
 * および型定義を統一的にエクスポートします。
 *
 * 設計原則:
 * - 関連機能ごとにグループ化されたエクスポート
 * - 明確な命名規則と型安全性
 * - 開発者体験を重視したAPI設計
 * - モジュール間の依存関係を最小化
 *
 * 使用方法:
 * ```tsx
 * // 必要な機能のみをインポート
 * import { AuthRequired, verifyTokenLocally, getJwtFromCookie } from '@/lib/auth';
 *
 * // または特定モジュールから直接インポート
 * import { isJWTValid } from '@/lib/auth/jwt';
 * ```
 */

// ===== React コンポーネント =====
/**
 * 認証が必要なページを保護するラッパーコンポーネント
 * サーバーサイドで認証チェックを行い、未認証時は401ページを表示
 */
export { default as AuthRequired } from './AuthRequired';

// ===== JWT トークン操作と検証システム =====
/**
 * JWTトークンの操作、ローカル検証、および関連型定義
 *
 * 主要関数:
 * - decodeJWT: JWTペイロードのデコード
 * - isJWTValid: トークンの有効性チェック
 * - isJWTExpired: 有効期限チェック
 * - getJWTExpirationTime: 残り有効時間の取得
 * - getJWTUserInfo: ユーザー情報の抽出
 * - getJwtFromCookie: HTTPオンリーCookieからJWTを取得
 * - verifyTokenLocally: 高速なローカル検証（有効期限のみ）
 *
 * 型定義:
 * - JWTPayload: JWTペイロードの型定義
 * - TokenVerificationResult: 検証結果の標準的な型定義
 */
export {
  decodeJWT,
  isJWTValid,
  isJWTExpired,
  getJWTExpirationTime,
  getJWTUserInfo,
  getJwtFromCookie,
  verifyTokenLocally,
  type JWTPayload,
  type TokenVerificationResult,
} from './jwt';
