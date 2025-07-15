import { DashboardPage } from '@/features/dashboard/components/DashboardPage';
import { getServerSession } from '@/lib/auth/session';
import { verifyTokenLocally } from '@/lib/auth/tokenVerification';
import { getServerTranslation } from '@/lib/i18n/server';

export default async function Page() {
  // サーバーサイドでユーザー情報を取得
  const jwt = await getServerSession();
  let user = null;

  if (jwt) {
    try {
      const verificationResult = verifyTokenLocally(jwt);
      user = verificationResult.user;
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  }

  // サーバーサイドで翻訳を取得（SSR対応）
  const welcomeText = await getServerTranslation('HomePage.welcome', {
    name: user?.name || (await getServerTranslation('Common.defaultUser')),
  });
  const logoutText = await getServerTranslation('Common.logout');

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{welcomeText}</h1>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {logoutText}
          </button>
        </form>
      </div>
      <DashboardPage />
    </div>
  );
}
