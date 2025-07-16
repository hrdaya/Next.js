/**
 * @fileoverview Next.js App Router グローバルエラーバウンダリ
 *
 * このファイルは、アプリケーション全体で発生するJavaScriptエラーをキャッチし、
 * ユーザーフレンドリーなエラーページを表示するNext.js App Routerの特殊コンポーネントです。
 *
 * 主な機能：
 * - クライアントサイドエラーの包括的なキャッチ
 * - サーバーサイドレンダリングエラーの処理
 * - ユーザーフレンドリーなエラー表示
 * - エラー復旧機能（リセット機能）
 * - エラーの詳細情報とデバッグ支援
 *
 * キャッチするエラーの種類：
 * - JavaScript実行時エラー（TypeError, ReferenceError等）
 * - React コンポーネントのレンダリングエラー
 * - 非同期処理でのUnhandled Promise Rejection
 * - API通信エラー（ネットワークエラー等）
 * - Next.js内部エラー
 *
 * エラーバウンダリの範囲：
 * - layout.tsx以下の全てのページとコンポーネント
 * - 認証が必要なページ（(authenticated)グループ）
 * - 各種feature コンポーネント
 *
 * 注意事項：
 * - このファイルは必ずクライアントコンポーネントである必要があります
 * - layout.tsx自体のエラーはキャッチできません（global-error.tsxが必要）
 * - イベントハンドラー内のエラーは別途try-catchが必要
 *
 * @route /error (自動表示)
 * @security Error boundary for application stability
 * @accessibility Provides accessible error messaging and recovery options
 */

'use client';

// ErrorPageコンポーネント: 実際のエラー表示UIを担当するfeatureコンポーネント
// ユーザーフレンドリーなエラーメッセージ、復旧ボタン、デバッグ情報等を提供
import { ErrorPage } from '@/features/errors/components/ErrorPage';

/**
 * エラーバウンダリコンポーネントのProps型定義
 *
 * Next.js App Routerがエラー発生時に自動的に渡すプロパティを定義します。
 * これらのプロパティを使用してエラーの詳細表示と復旧機能を実装します。
 */
interface ErrorPageProps {
  /**
   * 発生したエラーオブジェクト
   * - message: エラーメッセージ（ユーザー向け表示に使用）
   * - stack: スタックトレース（開発環境でのデバッグ用）
   * - name: エラーの種類（TypeError, ReferenceError等）
   * - digest: Next.jsが生成するエラー固有ID（ログ追跡用）
   * - statusCode: HTTPエラーの場合のステータスコード（オプション）
   */
  error: Error & { digest?: string; statusCode?: number };

  /**
   * エラー復旧機能
   * ユーザーがエラー状態からアプリケーションを回復させるための関数
   * 呼び出すとコンポーネントツリーの再レンダリングを試行し、
   * 一時的なエラーの場合は正常な状態に戻る可能性があります
   */
  reset: () => void;
}

/**
 * アプリケーション全体のエラーバウンダリコンポーネント
 *
 * Next.js App Routerが自動的に呼び出すエラー処理コンポーネントです。
 * アプリケーション内で予期しないエラーが発生した際に、白い画面（White Screen of Death）
 * の代わりに、ユーザーフレンドリーなエラーページを表示します。
 *
 * 動作フロー：
 * 1. アプリケーション内でJavaScriptエラーが発生
 * 2. Next.js App Routerがエラーをキャッチ
 * 3. このErrorBoundaryコンポーネントが自動的に呼び出される
 * 4. ErrorPageコンポーネントにエラー情報とreset関数を渡す
 * 5. ユーザーに分かりやすいエラーメッセージを表示
 * 6. ユーザーはリセットボタンでアプリケーションの復旧を試行可能
 *
 * エラー処理の責任分離：
 * - ErrorBoundary（このコンポーネント）: Next.js App Routerとの連携
 * - ErrorPage: 実際のUI表示とユーザーインタラクション
 *
 * 開発環境での特徴：
 * - 詳細なスタックトレースの表示
 * - エラーの発生箇所の特定支援
 * - ホットリロード時の自動復旧
 *
 * 本番環境での特徴：
 * - ユーザーフレンドリーなエラーメッセージ
 * - 機密情報の隠蔽（スタックトレース等）
 * - エラー復旧オプションの提供
 *
 * @param error - Next.jsから渡される詳細なエラー情報
 * @param reset - アプリケーション状態をリセットする関数
 * @returns JSX.Element - ErrorPageコンポーネントをレンダリング
 *
 * @example
 * // エラーが発生する例：
 *
 * // 1. コンポーネントレンダリングエラー
 * const BuggyComponent = () => {
 *   throw new Error('Something went wrong!');
 *   return <div>Never rendered</div>;
 * };
 *
 * // 2. 非同期処理エラー
 * useEffect(() => {
 *   fetchData().catch(error => {
 *     throw error; // このエラーがキャッチされる
 *   });
 * }, []);
 *
 * // 3. APIレスポンス処理エラー
 * const handleSubmit = async () => {
 *   const response = await api.create('/users', data);
 *   response.unknownProperty.accessError; // TypeError が発生
 * };
 *
 * // いずれの場合も、このErrorBoundaryが作動してErrorPageが表示される
 *
 * @example
 * // 開発・テスト用: エラーバウンダリを意図的に呼び出す方法
 *
 * // 方法1: テスト用エラーコンポーネントの作成
 * const ErrorTestComponent = ({ shouldError }: { shouldError: boolean }) => {
 *   if (shouldError) {
 *     throw new Error('Test error for ErrorBoundary');
 *   }
 *   return <div>Normal component</div>;
 * };
 *
 * // 使用例:
 * const [triggerError, setTriggerError] = useState(false);
 * return (
 *   <div>
 *     <button onClick={() => setTriggerError(true)}>
 *       エラーバウンダリをテスト
 *     </button>
 *     <ErrorTestComponent shouldError={triggerError} />
 *   </div>
 * );
 *
 * // 方法2: useEffect内でのエラー発生
 * const TestErrorPage = () => {
 *   const [shouldError, setShouldError] = useState(false);
 *
 *   useEffect(() => {
 *     if (shouldError) {
 *       throw new Error('useEffect error test');
 *     }
 *   }, [shouldError]);
 *
 *   return (
 *     <button onClick={() => setShouldError(true)}>
 *       非同期エラーテスト
 *     </button>
 *   );
 * };
 *
 * // 方法3: イベントハンドラーでのエラー（注意：これはキャッチされない）
 * const handleClick = () => {
 *   throw new Error('Event handler error'); // これはキャッチされない
 * };
 * // 代わりに以下のようにする：
 * const handleClick = () => {
 *   setTimeout(() => {
 *     throw new Error('Async error'); // これはキャッチされる
 *   }, 0);
 * };
 *
 * // 方法4: Promise reject でのエラー
 * const triggerPromiseError = () => {
 *   Promise.reject(new Error('Promise rejection error'))
 *     .catch(error => {
 *       throw error; // re-throwでエラーバウンダリにキャッチさせる
 *     });
 * };
 *
 * // 方法5: 開発専用のエラートリガー（NODE_ENV チェック推奨）
 * const DevErrorTrigger = () => {
 *   if (process.env.NODE_ENV !== 'development') {
 *     return null; // 本番環境では表示しない
 *   }
 *
 *   return (
 *     <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999 }}>
 *       <button
 *         onClick={() => { throw new Error('Dev test error'); }}
 *         style={{ background: 'red', color: 'white' }}
 *       >
 *         🚨 Error Test
 *       </button>
 *     </div>
 *   );
 * };
 *
 * // 方法6: URLパラメータでのエラートリガー
 * const ConditionalErrorComponent = () => {
 *   const searchParams = useSearchParams();
 *   const triggerError = searchParams.get('error') === 'true';
 *
 *   if (triggerError) {
 *     throw new Error('URL parameter triggered error');
 *   }
 *
 *   return <div>Normal content</div>;
 * };
 * // 使用例: http://localhost:3000/page?error=true でアクセス
 */
export default function ErrorBoundary({ error, reset }: ErrorPageProps) {
  return <ErrorPage error={error} reset={reset} />;
}
