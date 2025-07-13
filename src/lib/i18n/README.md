# 国際化（i18n）モジュール構成

## 📁 ファイル構成

```text
src/lib/i18n/
├── i18n.ts           # i18next設定とリソース管理（Client用）
├── server.ts         # サーバーサイド専用i18n設定（SSR対応）
├── I18nProvider.tsx  # React i18nプロバイダー（Client Component）
└── README.md         # このドキュメント

src/locales/
├── en/
│   └── common.json   # 英語翻訳ファイル
└── ja/
    └── common.json   # 日本語翻訳ファイル
```

## 🌐 概要

このプロジェクトでは、**SSR（Server-Side Rendering）対応**の多言語化システムを実装しています。

**Client Components**: `i18next`、`i18next-browser-languagedetector`、および`react-i18next`を使用
**Server Components**: 専用のサーバーサイドi18n設定により、Accept-Languageヘッダーに基づく言語検出を実装

現在は英語（en）と日本語（ja）に対応しており、サーバーサイドではAccept-Languageヘッダー、クライアントサイドではブラウザの言語設定またはローカルストレージの設定に基づいて自動的に言語が切り替わります。

## ⚙️ 設定

### i18n.ts

- **LanguageDetector**: ブラウザの言語設定を自動検出
- **検出順序**: `localStorage` → `navigator` → `htmlTag`
- **フォールバック言語**: 英語（en）
- **SSR対応**: `useSuspense: false`でSSRとCSRの両方に対応
- **キャッシュ**: ローカルストレージに言語設定を保存

### server.ts

- **Server Components専用**: サーバーサイドで動作するi18n設定
- **Accept-Language検出**: HTTPヘッダーから言語を自動検出
- **Hydration対応**: クライアントとサーバーの言語設定を同期
- **独立インスタンス**: i18n.createInstance()でクライアントと分離

### I18nProvider.tsx

- **Client Component**: `'use client'`ディレクティブ必須
- **初期化管理**: `useEffect`でi18nextの初期化状態を確認
- **SSR対応**: サーバーから受け取った初期言語を設定
- **Hydration待機**: 初期化完了まで子コンポーネントの表示を制御

## 📋 各ファイルの役割

### `i18n.ts`

i18nextの設定とリソース管理を行うメインファイルです。

**主な機能:**

- 翻訳リソースの読み込みとバンドル
- 言語検出の設定（localStorage → navigator → htmlTag の順）
- フォールバック言語の設定（英語）
- React統合の設定

**設定項目:**

- `resources`: 各言語の翻訳リソース
- `fallbackLng`: デフォルト言語（英語）
- `defaultNS`: デフォルト名前空間（common）
- `detection`: 言語検出の優先順位
- `interpolation`: React用エスケープ設定

### `server.ts` (NEW!)

サーバーサイドレンダリング専用のi18n設定ファイルです。

**重要な特徴:**

- **Server Components専用**: サーバーサイドでのみ動作
- **Accept-Language検出**: HTTPリクエストヘッダーから言語を検出
- **独立インスタンス**: クライアント用i18nと分離された専用インスタンス
- **Hydration対応**: クライアントとの言語設定同期をサポート

**主な関数:**

- `getServerI18n()`: サーバーサイドでi18nインスタンスと検出言語を取得
- `getServerTranslation()`: サーバーサイドで翻訳文字列を取得

**使用場所:**

- Server Components、API Routes、Middlewareなど

## 🚀 使用方法

### Server Componentsでの翻訳（SSR対応）

**NEW!** Server Componentsでサーバーサイドレンダリング時に翻訳を使用できます：

```tsx
import { getServerTranslation, getServerI18n } from '@/lib/i18n/server';

// Server Component
export default async function MyServerComponent() {
  // 基本的な翻訳
  const title = await getServerTranslation('HomePage.title');
  
  // 動的な値の埋め込み
  const welcome = await getServerTranslation('HomePage.welcome', { 
    name: 'John' 
  });
  
  // 言語情報も取得可能
  const { language } = await getServerI18n();

  return (
    <div>
      <h1>{title}</h1>
      <p>{welcome}</p>
      <small>Current language: {language}</small>
    </div>
  );
}
```

### Client Componentsでの翻訳

**重要**: `useTranslation`フックを使用するコンポーネントには`'use client'`ディレクティブが必要です。

```tsx
'use client';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('HomePage.title')}</h1>
      <p>{t('HomePage.description')}</p>
    </div>
  );
}
```

### 動的な値の埋め込み（Client Components）

```tsx
// common.json
{
  "welcome": "Welcome, {{name}}!"
}

// コンポーネント
'use client';
const { t } = useTranslation();
const message = t('welcome', { name: 'John' }); // "Welcome, John!"
```

### 言語切り替え

```tsx
'use client';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ja')}>日本語</button>
    </div>
  );
}
```

### 複数の名前空間

```tsx
// 特定の名前空間を指定
const { t } = useTranslation('navigation');
const menuText = t('menu'); // Navigation.menu の値を取得
```

## 📝 翻訳ファイルの構造

### `src/locales/[lang]/common.json`

```json
{
  "HomePage": {
    "title": "タイトル",
    "description": "説明文"
  },
  "Navigation": {
    "menu": "メニュー"
  },
  "Common": {
    "loading": "読み込み中..."
  }
}
```

**命名規則:**

- **ページ別グループ**: `HomePage`, `AboutPage` など
- **機能別グループ**: `Navigation`, `Auth`, `Form` など
- **共通要素**: `Common` で共通のUI要素をまとめる

## 🔧 新しい言語の追加

### 1. 翻訳ファイルの追加

```bash
# 新しい言語フォルダを作成
mkdir src/locales/fr

# 翻訳ファイルをコピー
cp src/locales/en/common.json src/locales/fr/common.json
```

### 2. i18n.ts の更新

```typescript
// フランス語翻訳ファイルをインポート
import frTranslations from '@/locales/fr/common.json';

const resources = {
  en: { common: enTranslations },
  ja: { common: jaTranslations },
  fr: { common: frTranslations }, // 追加
};
```

### 3. 翻訳内容の更新

`src/locales/fr/common.json` を編集してフランス語の翻訳を追加します。

## 🎯 設計の利点

1. **型安全性**: TypeScript との組み合わせで翻訳キーの型チェック
2. **パフォーマンス**: 必要な言語のみをバンドルに含める
3. **ユーザビリティ**: ブラウザ設定に基づく自動言語検出
4. **永続化**: ローカルストレージによる言語設定の保存
5. **拡張性**: 新しい言語や名前空間を簡単に追加可能
6. **SEO対応**: サーバーサイドレンダリングとの互換性

## 🔍 デバッグ

### 翻訳キーの確認

```tsx
const { t, ready } = useTranslation();

// i18n の初期化状態を確認
console.log('i18n ready:', ready);

// 現在の言語を確認
console.log('Current language:', i18n.language);

// 翻訳の存在確認
console.log('Translation exists:', t('HomePage.title', { defaultValue: 'Missing' }));
```

### 言語検出のデバッグ

ブラウザの開発者ツールでローカルストレージを確認：

```javascript
localStorage.getItem('i18nextLng') // 保存された言語設定
```

## 🚨 重要な注意事項

### SSRとHydrationについて

**SSR対応完了**: このプロジェクトはServer ComponentsとClient Componentsの両方で翻訳が使用可能です：

```tsx
// ✅ Server Components（SSR対応）
import { getServerTranslation } from '@/lib/i18n/server';

export default async function ServerComponent() {
  const text = await getServerTranslation('HomePage.title');
  return <h1>{text}</h1>;
}

// ✅ Client Components
'use client';
import { useTranslation } from 'react-i18next';

function ClientComponent() {
  const { t } = useTranslation();
  return <h1>{t('HomePage.title')}</h1>;
}
```

### Hydration対応

- **I18nProvider**: サーバーから受け取った言語設定でクライアントを初期化
- **言語同期**: サーバーとクライアントで同じ言語設定を使用
- **初期化待機**: クライアントサイドでi18n初期化完了まで待機

### その他の注意事項

1. **パフォーマンス**: サーバーサイドでは必要な翻訳のみを取得
2. **キャッシュ**: クライアントサイドではローカルストレージで言語設定を保存
3. **言語検出**: サーバー（Accept-Language）とクライアント（localStorage/navigator）で異なる検出方法
4. **型定義**: TypeScript の型定義ファイルを追加することで型安全性を向上可能です
