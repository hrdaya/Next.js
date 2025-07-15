# Next.js App Router 対応 国際化（i18n）システム

## 📁 ファイル構成

```text
src/lib/i18n/
├── i18n.ts           # クライアントサイドi18next設定（ブラウザ言語検出）
├── server.ts         # サーバーサイドi18n設定（HTTPヘッダー言語検出）
├── I18nProvider.tsx  # React国際化プロバイダー（SSR/Hydration対応）
└── README.md         # システム設計と使用方法（このファイル）

src/locales/
├── en/
│   └── common.json   # 英語翻訳リソース
└── ja/
    └── common.json   # 日本語翻訳リソース
```

## 🌐 システム概要

### アーキテクチャ設計思想

このプロジェクトでは、**Next.js App Router**の**SSR（Server-Side Rendering）環境**に完全対応した
国際化システムを実装しています。従来のi18next設定では発生しがちな**Hydrationエラー**を根本的に解決し、
サーバーサイドとクライアントサイドで一貫した多言語体験を提供します。

### 技術的特徴

#### 🔄 デュアルインスタンス設計

- **サーバーサイド**: HTTPヘッダーベースの言語検出（SEO最適化）
- **クライアントサイド**: ブラウザ設定・localStorage連携（UX最適化）
- **完全分離**: 相互干渉を防ぐ独立したi18nextインスタンス

#### ⚡ パフォーマンス最適化

- **静的インポート**: 必要な翻訳リソースのみをバンドル
- **遅延初期化**: Hydrationエラー防止のためのタイミング制御
- **効率的キャッシュ**: localStorage活用でリロード高速化

#### 🛡️ 型安全性

- **TypeScript完全対応**: 翻訳キーの型チェック
- **実行時エラー防止**: 存在しないキーへの安全なアクセス

### 対応言語

現在サポート: **英語（en）**、**日本語（ja）**

**言語検出ロジック:**

- **サーバーサイド**: Accept-Languageヘッダー → フォールバック（en）
- **クライアントサイド**: localStorage → navigator.language → HTMLタグ → フォールバック（en）

## ⚙️ 各ファイルの詳細設計

### `i18n.ts` - クライアントサイド国際化エンジン

**役割**: ブラウザ環境でのi18next設定とリソース管理

**核心機能:**

- **静的リソース管理**: 翻訳ファイルの効率的なバンドリング
- **ブラウザ言語検出**: LanguageDetectorによる多段階検出
- **永続化**: localStorageを活用した言語設定の記憶
- **React統合**: useTranslationフック等の提供
- **SSR対応**: Hydrationエラー防止のための特別設定

**重要な設定項目:**

- `initImmediate: false` - Hydrationエラー防止の遅延初期化
- `useSuspense: false` - SSR環境でのSuspense無効化
- `detection.order` - 言語検出の優先順位制御
- `fallbackLng: 'en'` - 安全なフォールバック言語

**最適化ポイント:**

- 条件分岐でSSR時のwindowオブジェクトアクセスを回避
- エスケープ処理をReactに委譲してパフォーマンス向上

### `server.ts` - サーバーサイド国際化エンジン

**役割**: Server ComponentsとSSR環境での翻訳処理

**核心機能:**

- **HTTPヘッダー解析**: Accept-Languageの智的な言語検出
- **独立インスタンス**: クライアントとの状態分離
- **リクエスト単位管理**: セッション間の状態汚染防止
- **SEO最適化**: 検索エンジン向けの適切な言語レンダリング

**主要API:**

```typescript
// 言語検出付きインスタンス取得
const { i18n, language } = await getServerI18n();

// 直接翻訳取得（内部でgetServerI18n呼び出し）
const text = await getServerTranslation('key', options);
```

**言語検出アルゴリズム:**

1. Accept-Languageヘッダーをパース
2. 品質値を無視して言語コードを抽出
3. 地域コード除去（en-US → en）
4. サポート言語との照合
5. マッチしない場合は英語フォールバック

### `I18nProvider.tsx` - Hydration対応プロバイダー

**役割**: SSR/CSR環境でのシームレスな国際化体験の提供

**核心機能:**

- **遅延初期化管理**: useEffectでのタイミング制御
- **サーバー言語同期**: SSRで検出された言語の継承
- **Hydrationエラー防止**: 一貫したDOM構造の維持
- **React Context提供**: 配下コンポーネントへの翻訳機能供給

**Hydration対策の設計:**

- 初期化完了を待たずに即座にレンダリング
- I18nextProviderで一貫したコンテキスト提供
- 非同期言語変更処理でブロッキング回避

**Props設計:**

- `children`: 標準的なReact子要素
- `initialLanguage?`: SSRからの言語継承（オプション）

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
