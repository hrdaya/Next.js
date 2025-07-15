# 言語切り替え機能

このプロジェクトは、プルダウン形式の多言語対応システムを備えています。新しい言語の追加が簡単に行えるよう設計されています。

## 現在サポートされている言語

- 🇺🇸 English
- 🇯🇵 日本語

## 新しい言語の追加方法

### 1. 言語設定を追加

`src/lib/i18n/languages.ts` ファイルの `languagesConfig` 配列に新しい言語を追加します：

```typescript
{
  code: 'ko',           // ISO 639-1言語コード
  name: '한국어',        // その言語での表示名
  englishName: 'Korean', // 英語での表示名
  flag: '🇰🇷',          // 国旗の絵文字
},
```

### 2. 翻訳ファイルを作成

新しい言語コード用のフォルダを作成し、翻訳ファイルを追加します：

```bash
src/locales/ko/
├── common.json
├── auth.json
├── dashboard.json
└── errors.json
```

各ファイルは既存の言語ファイルと同じ構造にしてください。

### 3. i18n設定を更新

`src/lib/i18n/i18n.ts` ファイルの `resources` オブジェクトに新しい言語のリソースを追加します：

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

### 4. 自動適用

上記の3ステップを完了すると、言語切り替えコンポーネントに新しい言語が自動的に表示され、ユーザーが選択できるようになります。

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
3. `i18n.ts` のresourcesに追加されているか確認
4. ビルドエラーがないか確認

### 翻訳が表示されない

1. 翻訳ファイルのJSON構造が正しいか確認
2. 翻訳キーが正しく参照されているか確認
3. ブラウザの開発者ツールでエラーを確認
