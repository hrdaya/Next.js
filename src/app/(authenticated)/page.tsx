import { LogoutButton } from '@/features/auth/components';
import { DashboardPage } from '@/features/dashboard/components';
import { getJwtFromCookie, verifyTokenLocally } from '@/lib/auth/jwt';
import type { TokenVerificationResult } from '@/lib/auth/jwt';
import { getServerTranslation } from '@/lib/i18n/server';

export default async function Page() {
  // サーバーサイドでユーザー情報を取得
  const jwt = await getJwtFromCookie();
  let user = null;
  let verificationResult: TokenVerificationResult | null = null;

  if (jwt) {
    try {
      verificationResult = verifyTokenLocally(jwt);
      user = verificationResult.user;
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  }

  // サーバーサイドで翻訳を取得（SSR対応）
  const welcomeText = await getServerTranslation('dashboard:welcome', {
    name:
      user?.name || (await getServerTranslation('common:Common.defaultUser')),
  });
  const logoutText = await getServerTranslation('common:Common.logout');

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{welcomeText}</h1>
        <LogoutButton logoutText={logoutText} />
      </div>
      <DashboardPage
        {...(verificationResult ?? {
          isValid: false,
          isExpired: true,
          user: undefined,
        })}
      />
    </div>
  );
}
