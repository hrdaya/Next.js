/**
 * 認証ライブラリのエントリーポイント
 * 主要なコンポーネントと関数をエクスポート
 */

// コンポーネント
export { default as AuthRequired } from './AuthRequired';

// セッション管理
export { getServerSession, getClientSession } from './session';

// JWT関連
export {
  isJWTValid,
  isJWTExpired,
  getJWTExpirationTime,
  getJWTUserInfo,
  decodeJWT,
} from './jwt';

// トークン検証
export {
  verifyTokenLocally,
  verifyTokenWithAuthServer,
  type TokenVerificationResult,
} from './tokenVerification';

// ユーティリティ
export { signOut } from './utils';

// ミドルウェア関数
export {
  isPublicPath,
  isSigninPage,
  isApiRoute,
  handleSigninPageAuthentication,
  getAuthToken,
  createTokenExpiredResponse,
  handleAuthentication,
} from './middleware';
