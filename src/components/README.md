# Components ディレクトリ

このディレクトリには、ATOMIC デザインの原則に基づいた再利用可能なUIコンポーネントが格納されています。

## ATOMIC デザインについて

ATOMIC デザインは、UIコンポーネントを化学の原子・分子・組織の概念を用いて階層的に整理する設計手法です。
このプロジェクトでは、再利用性の高い汎用的なUIパーツのみを管理し、機能特有のコンポーネントは `src/features/機能名/components` 内に配置します。

## ディレクトリ構成

```text
src/components/
├── atoms/          # 原子レベル：最小単位のUIコンポーネント
│   ├── Button/
│   └── index.ts
├── molecules/      # 分子レベル：atomsを組み合わせた複合コンポーネント
│   ├── Header/
│   ├── LanguageSelector/
│   └── index.ts
└── README.md       # このファイル
```

> **注意**: `organisms` レベルのコンポーネントは、機能固有であることが多いため、`src/features/機能名/components` 内に配置してください。

## 各レベルの役割

### Atoms（原子）

最小単位の UI コンポーネントです。これ以上分割できない基本的な要素で構成されます。

**特徴:**

- 単一の責任を持つ
- 他のコンポーネントに依存しない
- 高い再利用性を持つ
- プロパティによる外部制御が可能

**例:**

- `Button`: ボタンコンポーネント
- `Input`: 入力フィールド
- `Label`: ラベルテキスト
- `Icon`: アイコン表示

### Molecules（分子）

複数の atoms を組み合わせて作られるコンポーネントです。特定の機能や目的を持ちます。

**特徴:**

- 複数の atoms から構成される
- 特定の機能や目的を持つ
- atoms よりも具体的だが、まだ汎用的
- 比較的簡単な操作やビジネスロジックを含む場合がある

**例:**

- `Header`: サイトヘッダー
- `LanguageSelector`: 言語切り替えコンポーネント
- `SearchBox`: 検索ボックス（Input + Button）
- `FormField`: フォームフィールド（Label + Input + ErrorMessage）

## ファイル命名規則

### コンポーネントファイル

```text
ComponentName.stories.tsx  # Storybook用ストーリー（オプション）
ComponentName.test.tsx     # テストファイル（オプション）
index.tsx                  # メインコンポーネント
```

### ディレクトリ構成（推奨）

```text
atoms/
├── Button/
│   ├── Button.stories.tsx
│   └── index.tsx
└── index.ts
```

## コンポーネント作成ガイドライン

### 1. Props インターフェース

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}
```

### 2. デフォルト値

```typescript
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
}) => {
  // ...
};
```

### 3. TypeScript の活用

- すべてのコンポーネントで TypeScript を使用
- Props の型定義を明確にする
- `React.FC` または関数型コンポーネントの型注釈を使用

### 4. CSS/スタイリング

- Tailwind CSS を使用してスタイリング
- 一貫性のあるデザイントークンを使用
- レスポンシブデザインを考慮

### 5. アクセシビリティ

- 適切な ARIA 属性を設定
- キーボードナビゲーションをサポート
- スクリーンリーダー対応を考慮

## エクスポート規則

### index.ts ファイル

各ディレクトリには `index.ts` ファイルを配置し、外部からのインポートを簡潔にします：

```typescript
// atoms/index.ts
export { Button } from './Button/index';
export type { ButtonProps } from './Button/index';

// molecules/index.ts
export { Header } from './Header/index';
export type { HeaderProps } from './Header/index';
export { LanguageSelector } from './LanguageSelector/index';
export type { LanguageSelectorProps } from './LanguageSelector/index';
```

### インポート例

```typescript
// ✅ 推奨
import { Button, Input } from '@/components/atoms';
import { Header } from '@/components/molecules';

// ❌ 非推奨
import Button from '@/components/atoms/Button/Button';
```

## テストとStorybook

### テスト

- 各コンポーネントには可能な限りテストを作成
- `@testing-library/react` を使用
- アクセシビリティのテストも含める

### Storybook

- atoms レベルのコンポーネントには Storybook ストーリーを作成
- 様々な状態やバリエーションを文書化
- デザインシステムの一部として活用

## 参考リンク

- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 注意事項

1. **機能特有のコンポーネント** は `src/features/機能名/components` に配置
2. **ページ固有のコンポーネント** は `src/app/ページ名/components` に配置
3. **汎用性の高いコンポーネントのみ** をこのディレクトリに配置
4. **一貫性のあるAPI設計** を心がける
5. **パフォーマンス** を考慮した実装を行う
