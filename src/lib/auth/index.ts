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
 * import { AuthRequired, signOut, verifyTokenLocally } from '@/lib/auth';
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

// ===== セッション管理 =====
/**
 * HTTPOnlyクッキーからのJWTトークン取得と管理
 * - getJwtCookie: サーバーサイドでのセッション取得
 * - setJwtCookie: セキュアなJWTクッキーの設定
 * - clearJwtCookie: JWTクッキーの削除
 */
export {
  getJwtCookie,
  setJwtCookie,
  clearJwtCookie,
  secureJwtResponse,
  setJwtAuthHeader,
  tryRefreshJwt,
} from './jwtCookie';

// ===== JWT トークン操作 =====
/**
 * JWTトークンのローカル検証とデータ抽出
 * 外部サーバーへの問い合わせなしで高速な検証を提供
 *
 * 主要関数:
 * - isJWTValid: トークンの有効性チェック
 * - isJWTExpired: 有効期限チェック
 * - getJWTExpirationTime: 残り有効時間の取得
 * - getJWTUserInfo: ユーザー情報の抽出
 * - decodeJWT: JWTペイロードのデコード
 *
 * 型定義:
 * - JWTPayload: JWTペイロードの型定義
 */
export {
  isJWTValid,
  isJWTExpired,
  getJWTExpirationTime,
  getJWTUserInfo,
  decodeJWT,
  type JWTPayload,
} from './jwt';

// ===== トークン検証システム =====
/**
 * JWTトークンのローカル検証機能
 *
 * verifyTokenLocally:
 * - 高速なローカル検証（有効期限のみ）
 * - SSR/CSR両方で使用可能
 * - パフォーマンス重視の場面で使用
 * - 外部サーバーへの問い合わせなしで即座に結果を返す
 *
 * TokenVerificationResult:
 * - 検証結果の標準的な型定義
 * - isValid, isExpired, user情報を含む
 */
export {
  verifyTokenLocally,
  type TokenVerificationResult,
} from './jwt';

// ===== ユーティリティ関数 =====
/**
 * 認証関連の便利関数
 *
 * signOut:
 * - HTTPOnlyクッキーの安全な削除
 * - サインインページへの自動リダイレクト
 * - エラー耐性のあるログアウト処理
 */
// ログアウト機能（サーバーアクション）
// ログアウト処理は src/features/auth/actions/SignOut.ts のサーバーアクションを使用
