# 翻訳ファイル使用ガイド

Dashboard関連の翻訳が`dashboard.json`に分離されました。

## ファイル構成

```text
src/locales/
├── en/
│   ├── common.json      # 共通翻訳（HomePage, Navigation, Common, Authなど）
│   ├── dashboard.json   # Dashboard専用翻訳
│   └── errors.json      # エラーページ専用翻訳
└── ja/
    ├── common.json      # 共通翻訳（HomePage, Navigation, Common, Authなど）
    ├── dashboard.json   # Dashboard専用翻訳
    └── errors.json      # エラーページ専用翻訳
```

## 使用方法

### 1. Commonの翻訳を使用する場合

```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('HomePage.title')}</h1>
      <p>{t('auth.signInTitle')}</p>
      <button>{t('Common.loading')}</button>
    </div>
  );
};
```

### 2. Dashboardの翻訳を使用する場合

```tsx
import { useTranslation } from 'react-i18next';

const DashboardComponent = () => {
  const { t } = useTranslation('dashboard');
  
  return (
    <div>
      <h1>{t('Dashboard.welcome')}</h1>
      <p>{t('Dashboard.welcomeBack', { name: 'ユーザー名' })}</p>
      <button>{t('Dashboard.viewAnalytics')}</button>
    </div>
  );
};
```

### 3. Authの翻訳を使用する場合

```tsx
import { useTranslation } from 'react-i18next';

const AuthComponent = () => {
  const { t } = useTranslation('auth');
  
  return (
    <div>
      <h1>{t('signInTitle')}</h1>
      <p>{t('signInSubtitle')}</p>
      <button>{t('signIn')}</button>
    </div>
  );
};
```

### 4. Errorsの翻訳を使用する場合

```tsx
import { useTranslation } from 'react-i18next';

const ErrorComponent = () => {
  const { t } = useTranslation('errors');
  
  return (
    <div>
      <h1>{t('notFound.title')}</h1>
      <p>{t('forbidden.description')}</p>
      <button>{t('internalServerError.retry')}</button>
    </div>
  );
};
```

### 5. 複数の名前空間を使用する場合

```tsx
import { useTranslation } from 'react-i18next';

const MixedComponent = () => {
  const { t: tCommon } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');
  const { t: tDashboard } = useTranslation('dashboard');
  
  return (
    <div>
      <h1>{tDashboard('welcome')}</h1>
      <p>{tAuth('signInTitle')}</p>
      <button>{tCommon('logout')}</button>
    </div>
  );
};
```

## 利点

- **モジュール性**: 機能別に翻訳ファイルが分離されているため、保守性が向上
- **パフォーマンス**: 必要な翻訳のみを読み込むことで、バンドルサイズを最適化
- **チーム開発**: 各機能の翻訳を独立して編集可能
- **スケーラビリティ**: 新しい機能の翻訳を容易に追加可能

## 翻訳キーの構造

### Common

- `HomePage.*` - ホームページ関連
- `Navigation.*` - ナビゲーション関連
- `Common.*` - 汎用テキスト
- `Auth.*` - 認証関連
- `Errors.*` - エラーページ関連

### Dashboard

- `Dashboard.*` - ダッシュボード専用機能

## 新しい翻訳ファイルの追加

新しい機能の翻訳を追加する場合：

1. 翻訳ファイルを作成（例：`user.json`）
2. `src/lib/i18n/i18n.ts`でインポートとリソース登録
3. コンポーネントで`useTranslation('user')`として使用
