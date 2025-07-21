import { LogoutButton } from '@/features/auth/components';
import { DashboardPage } from '@/features/dashboard/components';
import { verifyTokenLocally } from '@/lib/auth/jwt';
import { getJwtCookie } from '@/lib/auth/jwtCookie';
import { getServerTranslation } from '@/lib/i18n/server';

export default async function Page() {
  // サーバーサイドでユーザー情報を取得
  const jwt = await getJwtCookie();
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
        <LogoutButton logoutText={logoutText} />
      </div>
      <DashboardPage />
    </div>
  );
}
