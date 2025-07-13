import { getServerSession } from '@/lib/auth/session';
import { verifyTokenWithAuthServer } from '@/lib/auth/tokenVerification';
import { redirect } from 'next/navigation';

interface SigninPageProps {
  searchParams: Promise<{ error?: string }>;
}

/**
 * サインインページ
 *
 * ログイン状態に応じて以下の処理を行います：
 * - ログイン済み: ホームページ（/）にリダイレクト
 * - 未ログイン: サインインフォームを表示
 */
export default async function SigninPage({ searchParams }: SigninPageProps) {
  // 現在のセッションをチェック
  const jwt = await getServerSession();

  // JWTが存在し、有効な場合はホームページにリダイレクト
  if (jwt) {
    try {
      const { isValid } = await verifyTokenWithAuthServer(jwt);
      if (isValid) {
        redirect('/');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // エラーの場合はサインインフォームを表示
    }
  }

  // URLパラメータからエラーメッセージを取得
  const params = await searchParams;
  const errorMessage = params.error;

  // 未認証またはトークンが無効な場合、サインインフォームを表示
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            サインイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントにログインしてください
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {decodeURIComponent(errorMessage)}
            </div>
          </div>
        )}

        <form
          className="mt-8 space-y-6"
          action="/api/auth/signin"
          method="POST"
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              サインイン
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
