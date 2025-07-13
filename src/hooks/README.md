# カスタムReactフック集

## 📁 ファイル構成

```text
src/hooks/
├── index.ts           # フック集約・エクスポートファイル
├── useLocalStorage.ts # ブラウザlocalStorage連携フック
├── useDebounce.ts     # 値変更デバウンスフック
├── useApiRequest.ts   # Client Components用API通信フック
└── README.md          # このドキュメント
```

## 🎯 概要

このディレクトリには、プロジェクト全体で再利用可能なカスタムReactフックが含まれています。各フックは単一責任の原則に従って分割され、特定の機能領域に特化しています。

**重要**: このプロジェクトではServer ComponentsとClient Componentsで異なるAPI通信方法を使用します：

- **Client Components**: `useApiRequest` フック
- **Server Components**: `fetchServerData` 関数 (Reactフックではありません)

## 📋 各フックの詳細

### `useLocalStorage` - ブラウザストレージ連携

**用途**: ブラウザのlocalStorageとReactの状態を同期

**主な機能:**

- localStorageの値をReactの状態として管理
- SSR対応（サーバーサイドでは初期値を使用）
- JSON形式での自動シリアライゼーション
- エラーハンドリング付き

**使用例:**

```tsx
import { useLocalStorage } from '@/hooks';

// 基本的な使用方法
const [theme, setTheme] = useLocalStorage('app-theme', 'light');
const [userSettings, setUserSettings] = useLocalStorage('user-settings', {
  language: 'ja',
  notifications: true
});

// 型安全な使用方法
interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'en' | 'ja';
}

const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
  'user-preferences',
  { theme: 'light', language: 'ja' }
);
```

### `useDebounce` - パフォーマンス最適化

**用途**: 連続する値の変更を遅延させ、最後の値のみを反映

**主な機能:**

- 指定した遅延時間でデバウンス処理
- 検索入力、API呼び出しの制限に効果的
- パフォーマンス向上とリソース節約

**使用例:**

```tsx
import { useDebounce } from '@/hooks';
import { useState, useEffect } from 'react';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 300ms後に検索実行
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="検索..."
    />
  );
};

// フォーム自動保存の例
const AutoSaveForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const debouncedFormData = useDebounce(formData, 1000);

  useEffect(() => {
    // 1秒後に自動保存
    saveFormData(debouncedFormData);
  }, [debouncedFormData]);
};
```

### `useApiRequest` - Client Components用API通信

**用途**: Client Componentsでの統一されたAPI通信

**主な機能:**

- **httpOnly Cookie 連携**: `/api/auth/me` 経由でJWTトークンを取得・自動付与
- 統一されたエラーハンドリング
- 自動的な認証エラー処理（401, 403, 404）
- HTTP メソッド別の専用関数（get/create/update/del/upload/download）
- ファイルアップロード・ダウンロード対応
- TypeScript型安全性
- 楽観的ロック（409）やメンテナンス状態（503）の処理

**重要**: Client Components (`'use client'`) でのみ使用可能

**使用例:**

```tsx
'use client'; // 必須

import { useApiRequest } from '@/hooks';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

const UserComponent = () => {
  const api = useApiRequest();

  // データ取得
  const fetchUsers = async () => {
    const response = await api.get<User[]>('/api/users');
    if (response.ok) {
      return response.data;
    } else {
      console.error('取得エラー:', response.message);
    }
  };

  // データ作成
  const createUser = async (userData: CreateUserRequest) => {
    const response = await api.create<User>('/api/users', userData);
    if (response.ok) {
      console.log('ユーザーが作成されました:', response.data);
    } else {
      console.error('作成エラー:', response.message);
    }
  };

  // データ更新
  const updateUser = async (id: number, userData: Partial<User>) => {
    const response = await api.update<User>(`/api/users/${id}`, userData);
    if (response.ok) {
      console.log('更新成功:', response.data);
    }
  };

  // データ削除
  const deleteUser = async (id: number) => {
    const response = await api.del(`/api/users/${id}`, { id });
    if (response.ok) {
      console.log('削除成功');
    }
  };

  // ファイルアップロード
  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.upload<{ url: string }>('/api/upload/avatar', formData);
    if (response.ok) {
      console.log('アップロード成功:', response.data?.url);
    }
  };

  // ファイルダウンロード
  const downloadReport = async () => {
    const response = await api.download('/api/reports/export');
    // ファイルは自動的にブラウザでダウンロードされます
  };
};
```

## 🚀 使用方法

これらのhooksは、Client Componentsでアプリケーション全体で再利用可能な機能を提供し、コードの重複を避け、保守性を向上させるために設計されています。

### 基本的なインポート

```tsx
// 個別インポート（推奨）
import { useLocalStorage, useDebounce, useApiRequest } from '@/hooks';

// 必要なフックのみインポート
import { useDebounce } from '@/hooks/useDebounce';
import { useApiRequest } from '@/hooks/useApiRequest';
```

### 複数フックの組み合わせ

```tsx
'use client'; // Client Component必須

import { useLocalStorage, useDebounce, useApiRequest } from '@/hooks';
import { useState, useEffect } from 'react';

const SearchWithCache = () => {
  const api = useApiRequest();
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('search-history', []);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 検索実行
      performSearch(debouncedSearchTerm);
      
      // 検索履歴に追加
      setSearchHistory(prev => 
        [debouncedSearchTerm, ...prev.filter(term => term !== debouncedSearchTerm)]
          .slice(0, 10)
      );
    }
  }, [debouncedSearchTerm]);

  const performSearch = async (term: string) => {
    const response = await api.get('/api/search', { query: term });
    if (response.ok) {
      console.log('検索結果:', response.data);
    }
  };

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="検索..."
      />
      <div>
        <h3>検索履歴</h3>
        {searchHistory.map((term, index) => (
          <button key={index} onClick={() => setSearchTerm(term)}>
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};
```

## 🎯 設計の利点

1. **再利用性**: 共通のロジックを複数のClient Componentsで使用可能
2. **保守性**: 単一責任の原則により、変更の影響範囲が限定的
3. **型安全性**: TypeScriptによる厳密な型チェック
4. **テストしやすさ**: 独立したフックを個別にテスト可能
5. **パフォーマンス**: デバウンス処理による不要なAPI呼び出しの削減
6. **一貫性**: 統一されたAPI通信パターン
7. **セキュリティ**: httpOnly Cookie による安全なJWT管理
8. **SSR対応**: Server/Client Components の適切な使い分け

## 🔧 新しいフックの追加

### 1. フックファイルの作成

```bash
# 新しいフックファイルを作成
touch src/hooks/useMyCustomHook.ts
```

### 2. フックの実装

```tsx
// src/hooks/useMyCustomHook.ts
import { useState, useEffect } from 'react';

/**
 * カスタムフックの説明
 * @param param - パラメータの説明
 * @returns 戻り値の説明
 */
export function useMyCustomHook(param: string) {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // フックのロジック
  }, [param]);

  return { state, setState };
}
```

### 3. index.tsに追加

```tsx
// src/hooks/index.ts
export { useMyCustomHook } from './useMyCustomHook';
```

## 📊 Client vs Server Components API通信

このプロジェクトでは、実行環境に応じて異なるAPI通信方法を使用します：

### useApiRequest（Client Components用）

`useApiRequest`フックは、Client Componentsでの使用を想定しています：

```tsx
'use client'; // 必須

import { useApiRequest } from '@/hooks';

const MyComponent = () => {
  const api = useApiRequest();
  
  const handleSubmit = async () => {
    // JWTトークンが自動的に付与される
    const response = await api.create('/api/users', userData);
  };
};
```

**JWT取得の仕組み：**

- SSR時：`typeof window === 'undefined'`で空文字を返す
- CSR時：`/api/auth/me`経由でJWTトークンを取得してBearerヘッダーに自動設定
- httpOnly Cookie のセキュリティを保持しながらClient Componentsでも利用可能

### fetchServerData（Server Components用）

Server Componentsでの初期データ取得に特化したAPI関数です：

```typescript
// Server Component（'use client'不要）
import { fetchServerData } from '@/hooks';

export default async function UsersPage() {
  // POST通信でデータ取得（第2引数は必須）
  const usersResponse = await fetchServerData<User[]>('/api/users', {
    page: 1,
    limit: 10
  });
  
  if (!usersResponse.ok) {
    return <div>エラーが発生しました</div>;
  }
  
  return (
    <div>
      {usersResponse.data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

**重要**: `fetchServerData`はReactフックではありません。Server Component内で直接呼び出すユーティリティ関数です。

### 使い分けガイド

| 環境 | 関数/フック | 用途 | Cookie取得方法 |
|------|-------------|------|----------------|
| **Client Components** | `useApiRequest` | ユーザーインタラクション、フォーム送信、ボタンクリック等 | `/api/auth/me` 経由 |
| **Server Components** | `fetchServerData` | SSR初期データ取得、ページ表示時のデータ | `next/headers cookies()` |

## 🚨 注意事項

1. **Client Component必須**: `useApiRequest`、`useLocalStorage`、`useDebounce`は`'use client'`指定が必要
2. **SSR対応**: ブラウザAPI使用時は`typeof window !== 'undefined'`チェックが必要
3. **メモリリーク防止**: useEffectのクリーンアップ関数を適切に実装
4. **エラーハンドリング**: 予期しないエラーに対する適切な処理
5. **型安全性**: TypeScriptの型定義を活用した型安全な実装
6. **パフォーマンス**: 不要な再レンダリングを避けるための最適化
7. **認証エラー**: `useApiRequest`は401/403/404エラー時に自動でリダイレクト実行

## 🔍 デバッグ

### フックの状態確認

```tsx
import { useDebugValue } from 'react';

export function useMyHook(value: string) {
  // React DevToolsでフックの状態を確認可能
  useDebugValue(value, (val) => `MyHook: ${val}`);
  
  // フックのロジック
}
```

### コンソールでの確認

```tsx
'use client';

const MyComponent = () => {
  const [value, setValue] = useLocalStorage('test', '');
  
  // 開発環境でのデバッグ出力
  if (process.env.NODE_ENV === 'development') {
    console.log('localStorage value:', value);
  }
};
```

### useApiRequestのデバッグ

```tsx
'use client';

const MyComponent = () => {
  const api = useApiRequest();
  
  const handleSubmit = async () => {
    const response = await api.get('/api/users');
    
    // レスポンス詳細をログ出力
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response data:', response.data);
    console.log('Response messages:', response.message);
  };
};
```

## 🔗 関連ドキュメント

- [認証システム詳細](../lib/auth/README.md) - 認証関連の実装詳細
- [サーバーサイドAPI通信](../utils/serverApi.ts) - Server Components用API通信
- [型定義](../types/README.md) - プロジェクト共通の型定義

---

## 更新履歴

- **2025-07-13**: 実際の実装に合わせて更新
  - httpOnly Cookie ベースの認証システムに対応
  - Client/Server Components の使い分けを明確化
  - `useApiRequest`の実際の動作に基づいて説明を修正
  - JWT取得方法の詳細説明を追加
  - デバッグ方法とトラブルシューティングを強化
