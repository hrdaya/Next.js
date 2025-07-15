import type { Meta, StoryObj } from '@storybook/react';
import { LanguageSelector } from './index';

const meta = {
  title: 'Molecules/LanguageSelector',
  component: LanguageSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
プルダウン形式の言語切り替えコンポーネントです。

### 特徴
- 複数の表示バリエーション（default, compact, icon-only）
- サイズ調整可能（sm, md, lg）
- 美しいドロップダウンアニメーション
- アクセシビリティ対応
- 新しい言語の追加が簡単

### 新しい言語の追加方法
1. \`src/lib/i18n/languages.ts\` に言語設定を追加
2. \`src/locales/{languageCode}/\` フォルダを作成
3. 翻訳ファイルを追加
4. \`src/lib/i18n/i18n.ts\` のresourcesに追加

新しい言語を追加すると、このコンポーネントで自動的に選択肢に表示されます。
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'コンポーネントのサイズ',
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'icon-only'],
      description: '表示スタイル',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    className: {
      control: 'text',
      description: 'カスタムCSS クラス',
    },
  },
} satisfies Meta<typeof LanguageSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'default',
    disabled: false,
  },
};

export const Compact: Story = {
  args: {
    size: 'md',
    variant: 'compact',
    disabled: false,
  },
};

export const IconOnly: Story = {
  args: {
    size: 'md',
    variant: 'icon-only',
    disabled: false,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'default',
    disabled: false,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'default',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    size: 'md',
    variant: 'default',
    disabled: true,
  },
};

// バリエーション比較
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        表示バリエーション
      </h3>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col items-center gap-2">
          <LanguageSelector variant="default" size="md" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Default
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <LanguageSelector variant="compact" size="md" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Compact
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <LanguageSelector variant="icon-only" size="md" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Icon Only
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
        サイズバリエーション
      </h3>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col items-center gap-2">
          <LanguageSelector variant="compact" size="sm" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Small
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <LanguageSelector variant="compact" size="md" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Medium
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <LanguageSelector variant="compact" size="lg" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Large
          </span>
        </div>
      </div>
    </div>
  ),
};

// 実際の使用例
export const InHeader: Story = {
  render: () => (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              My App
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector variant="compact" size="sm" />
            <button
              type="button"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const InSignInPage: Story = {
  render: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <LanguageSelector size="md" variant="compact" />
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            言語切り替えは右上から行えます
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
