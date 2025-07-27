# Next.js App Router 対応 国際化（i18n）システム

## 🌐 システム概要

この国際化システムは、Next.js App RouterのSSR環境に完全対応し、サーバーサイドとクライアントサイドで一貫した多言語体験を提供します。Hydrationエラーを根本的に解決し、パフォーマンスと型安全性を両立させています。

### ✨ 主な特徴

- **デュアルi18nextインスタンス**: サーバー用とクライアント用を分離し、それぞれの環境に最適化。
- **動的フォント切り替え**: 言語に応じて最適なフォント（`Inter`, `Noto Sans JP`など）を自動で適用。
- **Hydrationエラーの解決**: SSRで決定した言語をクライアントに引き継ぐことで、UIの不整合を防止。
- **パフォーマンス最適化**: 必要な翻訳リソースのみを静的にインポート。
- **型安全性**: TypeScriptによる翻訳キーの補完と型チェック。
- **拡張性**: 新しい言語の追加が設定ファイルの変更のみで完了する設計。

## 📁 ファイル構成

```text
src/lib/i18n/
├── client.ts           # クライアントサイドi18next設定
├── server.ts           # サーバーサイドi18n設定
├── resources.ts        # 共通翻訳リソース定義
├── languages.ts        # サポート言語の定義とユーティリティ
├── font-settings.ts    # ✨ 言語ごとのフォント設定
├── I18nProvider.tsx    # React国際化プロバイダー
└── README.md           # このファイル

src/locales/            # 翻訳リソースファイル
├── en/
│   └── ...json
└── ja/
    └── ...json
```

## ⚙️ 各ファイルの詳細設計

- **`client.ts`**: ブラウザ環境でのi18next設定。`LanguageDetector`による言語検出とCookieへの永続化。
- **`server.ts`**: Server Components/SSR環境での翻訳。HTTPヘッダー (`Accept-Language`) とCookieから言語を検出。
- **`I18nProvider.tsx`**: SSRで検出した言語をクライアントに引き継ぎ、Hydrationエラーを防ぐプロバイダー。
- **`languages.ts`**: サポートする言語のメタデータ（言語コード、表示名など）を一元管理。
- **`font-settings.ts`**: **（重要）** 言語コードとフォント（`next/font`）およびTailwind CSSクラスをマッピングする設定ファイル。言語ごとのタイポグラフィを管理します。

## 🚀 使い方

### Server Componentsでの翻訳

```tsx
// src/app/page.tsx
import { getServerTranslation } from '@/lib/i18n/server';

export default async function HomePage() {
  const title = await getServerTranslation('common:greeting');
  return <h1>{title}</h1>;
}
```

### Client Componentsでの翻訳

```tsx
// src/components/MyComponent.tsx
'use client';
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation('common');
  return <p>{t('description')}</p>;
}
```

## 🔧 新しい言語の追加方法

新しい言語（例: 韓国語 `ko`）を追加する手順は以下の通りです。

### ステップ1: 翻訳ファイルの作成

まず、新しい言語用の翻訳リソースファイルを作成します。

```bash
# 1. 新しい言語フォルダを作成
mkdir src/locales/ko

# 2. 既存の翻訳ファイルをコピーしてテンプレートとして使用
cp src/locales/en/*.json src/locales/ko/
```

その後、`src/locales/ko/`内の各`.json`ファイルを韓国語に翻訳します。

### ステップ2: 言語設定の追加

`src/lib/i18n/languages.ts`を開き、`languagesConfig`配列に新しい言語のエントリを追加します。

```ts
// src/lib/i18n/languages.ts

export const languagesConfig: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'ja',
    name: '日本語',
    englishName: 'Japanese',
    flag: '🇯🇵',
  },
  // ここに新しい言語を追加
  {
    code: 'ko',
    name: '한국어',
    englishName: 'Korean',
    flag: '🇰🇷',
  },
];
```

### ステップ3: i18n設定を更新

`src/lib/i18n/resources.ts` ファイルの `commonResources` オブジェクトに新しい言語のリソースを追加します：

```typescript
// 翻訳ファイルのインポート
import koTranslations from '@/locales/ko/common.json';
import koAuth from '@/locales/ko/auth.json';
import koDashboard from '@/locales/ko/dashboard.json';
import koErrors from '@/locales/ko/errors.json';

const resources = {
  // ...existing languages...
  ko: {
    common: koTranslations,
    auth: koAuth,
    dashboard: koDashboard,
    errors: koErrors,
  },
};
```

### ステップ4: フォント設定の確認と追加

`src/lib/i18n/font-settings.ts`を開き、新しい言語に対応するフォントが設定されているか確認します。

- **既存のフォントで対応できる場合**: 何もする必要はありません。デフォルトフォントが適用されます。
- **新しいフォントが必要な場合**: 以下の手順でフォントを追加します。

```ts
// src/lib/i18n/font-settings.ts

// 1. next/font から新しいフォントをインポート
import { Inter, Noto_Sans_JP, Noto_Sans_KR } from 'next/font/google';

// 2. 新しいフォントを読み込む
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  weight: ['400', '700'],
});

// 3. fontSettings オブジェクトにエントリを追加
export const fontSettings = {
  // ... 既存の設定
  ko: {
    fontClass: 'font-sans-kr', // Tailwind CSSで使うクラス名
    variable: notoSansKr.variable, // CSS変数名
  },
};
```

次に、`tailwind.config.js`にも新しいフォントクラスを追加します。

```js
// tailwind.config.js
module.exports = {
  // ...
  theme: {
    extend: {
      fontFamily: {
        // ... 既存のフォント
        'sans-kr': ['var(--font-noto-sans-kr)'], // 追加
      },
    },
  },
  // ...
};
```

### ステップ5: アプリケーションの再起動

設定ファイルの変更を反映させるため、開発サーバーを再起動してください。

```bash
pnpm dev
```

以上の手順で、新しい言語がアプリケーション全体（翻訳、フォント切り替え、言語選択UI）に自動的に統合されます。

## 言語切り替えコンポーネントの使用方法

### 基本的な使用

```tsx
import { LanguageSelector } from '@/components/molecules';

function MyComponent() {
  return (
    <LanguageSelector />
  );
}
```

### カスタマイズ

```tsx
<LanguageSelector 
  size="md"              // 'sm' | 'md' | 'lg'
  variant="compact"      // 'default' | 'compact' | 'icon-only'
  disabled={isLoading}   // 無効状態
  className="custom-class" // カスタムCSSクラス
/>
```

## 表示バリエーション

### Default

完全な言語名とアイコンを表示する標準バージョン

### Compact

国旗と言語コードを表示するコンパクトバージョン

### Icon Only

国旗のみを表示する最小バージョン

## RTL言語のサポート

アラビア語など右から左に書く言語もサポート可能です：

```typescript
{
  code: 'ar',
  name: 'العربية',
  englishName: 'Arabic',
  flag: '🇸🇦',
  isRTL: true,  // RTL言語であることを示すフラグ
},
```

## アクセシビリティ

- キーボードナビゲーション対応
- スクリーンリーダー対応
- 適切なARIAラベル設定
- フォーカス管理

## 実装済みの場所

- サインインページ (`src/features/auth/components/SignIn.tsx`)
- その他のページでも同様に使用可能

## ベストプラクティス

1. **翻訳の品質**: ネイティブスピーカーによる翻訳確認を推奨
2. **一貫性**: すべての翻訳ファイルで同じキー構造を維持
3. **テスト**: 新しい言語を追加したら全機能をテスト
4. **文化的配慮**: 色、画像、レイアウトが各文化に適切か確認

## トラブルシューティング

### 新しい言語が表示されない

1. `languages.ts` に正しく追加されているか確認
2. 翻訳ファイルが正しい場所にあるか確認
3. `resources.ts` に新しい言語のリソースが追加されているか確認
4. ビルドエラーがないか確認

### 翻訳が表示されない

1. 翻訳ファイルのJSON構造が正しいか確認
2. 翻訳キーが正しく参照されているか確認
3. ブラウザの開発者ツールでエラーを確認
