# Utility Functions

このディレクトリには、プロジェクト全体で使用される様々なユーティリティ関数が含まれています。機能別にファイルが分かれており、必要な関数のみをインポートできるように設計されています。

## ファイル構成

### `serverApiProxy.ts` - サーバーサイドAPI通信

Server ComponentsでのSSR初期データ取得専用のAPI通信ユーティリティ。`/api/proxy` 経由でバックエンドサーバーと通信します。

```typescript
import {
  getServerData,
  postServerData,
  putServerData,
  deleteServerData
} from '@/utils/serverApiProxy';

// Server Component内でのデータ取得（GET）
export default async function UsersPage() {
  const response = await getServerData<User[]>('/api/backend/users');

  if (!response.ok) {
    return <div>エラーが発生しました: {response.message}</div>;
  }

  return (
    <div>
      {response.data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// POST/PUT/DELETE などの例
const postRes = await postServerData<UserResponse, CreateUserRequest>(
  '/api/backend/users',
  { name: 'John', email: 'john@example.com' },
  { 'Custom-Header': 'value' }
);
const putRes = await putServerData<UserResponse, UpdateUserRequest>(
  '/api/backend/users/1',
  { name: 'Jane' }
);
const delRes = await deleteServerData<DeleteUserResponse>(
  '/api/backend/users/1'
);
```

### `classNames.ts` - CSS クラス名操作

CSS クラス名の条件付き結合や操作を行う関数群。

```typescript
import { cn, clsx } from '@/utils/classNames';

// 条件付きクラス名の結合
const className = cn(
  'base-class',
  isActive && 'active',
  isPending && 'pending'
);

// より高度な条件付きクラス名
const buttonClass = clsx({
  'btn': true,
  'btn-primary': variant === 'primary',
  'btn-disabled': disabled
});
```

### `dateFormat.ts` - 日付フォーマット

日付の表示形式変換やフォーマット関数。

```typescript
import { formatDate, formatLocalDatetime } from '@/utils/dateFormat';

// 日付をフォーマット（yyyy/mm/dd）
const formatted = formatDate(new Date());

// 日時をフォーマット（yyyy-mm-ddThh:mm）
const datetime = formatLocalDatetime(new Date());
```

### `string.ts` - 文字列操作

文字列の変換、操作、生成を行う関数群。

```typescript
import { 
  capitalize, 
  toCamelCase, 
  toKebabCase, 
  truncate, 
  randomString 
} from '@/utils/string';

// 文字列操作の例
const title = capitalize('hello world'); // "Hello world"
const camelCase = toCamelCase('hello-world'); // "helloWorld"
const kebabCase = toKebabCase('HelloWorld'); // "hello-world"
const short = truncate('Long text here', 10); // "Long text..."
const id = randomString(8); // ランダムな8文字の文字列
```

### `timing.ts` - タイミング制御

関数の実行タイミングを制御する関数群。

```typescript
import { debounce, throttle, once } from '@/utils/timing';

// デバウンス - 最後の呼び出しから指定時間後に実行
const debouncedSearch = debounce(searchFunction, 300);

// スロットル - 指定間隔で最大1回実行
const throttledScroll = throttle(handleScroll, 100);

// 一度だけ実行
const initOnce = once(initializeApp);
```

### `validation.ts` - 型チェック・バリデーション

データの型チェックやバリデーション関数群。

```typescript
import { 
  isValidEmail, 
  isValidUrl, 
  isEmpty, 
  isString, 
  isNumber,
  safeJsonParse 
} from '@/utils/validation';

// バリデーション例
if (isValidEmail(email)) {
  // 有効なメールアドレス
}

if (!isEmpty(formData)) {
  // フォームデータが入力されている
}

// 安全なJSON解析
const data = safeJsonParse(jsonString, {});
```

### `file.ts` - ファイル処理

ファイルサイズ表示、拡張子判定、ファイルダウンロードなど。

```typescript
import { 
  formatFileSize, 
  getFileExtension, 
  isImageFile,
  downloadAsFile,
  readFileAsText 
} from '@/utils/file';

// ファイル処理例
const size = formatFileSize(1048576); // "1.00 MB"
const ext = getFileExtension('image.jpg'); // "jpg"
const isImg = isImageFile('photo.png'); // true

// ファイルダウンロード
downloadAsFile('Hello World', 'greeting.txt', 'text/plain');

// ファイル読み込み（ブラウザ環境）
const content = await readFileAsText(file);
```

### `clone.ts` - オブジェクトのディープコピー

オブジェクトや配列の深いコピーを作成する関数群。

```typescript
import { deepClone, shallowClone } from '@/utils/clone';

// ディープコピー（ネストしたオブジェクトも完全にコピー）
const original = { user: { name: 'John', settings: { theme: 'dark' } } };
const copied = deepClone(original);
copied.user.name = 'Jane'; // originalは変更されない

// シャローコピー（第一階層のみコピー）
const shallow = shallowClone(original);
```

### `env.ts` - 環境判定ユーティリティ

`process.env.NODE_ENV` をラップし、環境ごとの分岐を簡潔に記述できます。

```typescript
import { isProd, isDev, isTest } from '@/utils/env';

if (isProd) {
  // 本番環境用の処理
}
if (isDev) {
  // 開発環境用の処理
}
if (isTest) {
  // テスト環境用の処理
}
```

### `padLeft.ts` - 文字列の左パディング

文字列の左側に指定文字を埋めて指定長にする関数。

```typescript
import { padLeft } from '@/utils/padLeft';

// 数値を0埋めで指定桁数にする
const id = padLeft('123', 6, '0'); // "000123"
const time = padLeft('5', 2, '0'); // "05"

// スペース埋め
const aligned = padLeft('text', 10, ' '); // "      text"
```

## 使用方法

### 個別インポート（推奨）

```typescript
// 必要な関数のみをインポート（Tree-shaking に最適）
import { cn } from '@/utils/classNames';
import { debounce } from '@/utils/timing';
import { isValidEmail } from '@/utils/validation';
import { serverPost } from '@/utils/serverApi';
import { deepClone } from '@/utils/clone';
import { padLeft } from '@/utils/padLeft';
```

### まとめてインポート

```typescript
// すべてのユーティリティをインポート
import * as utils from '@/utils';

// または特定のモジュールをまとめてインポート
import * as stringUtils from '@/utils/string';
import * as dateUtils from '@/utils/dateFormat';
import * as serverUtils from '@/utils/serverApi';
```

### index.ts 経由でのインポート

```typescript
// index.ts 経由（後方互換性のため）
import { cn, debounce, isValidEmail, deepClone } from '@/utils';
```

## 開発ガイドライン

1. **機能別分割**: 新しいユーティリティ関数は適切なカテゴリのファイルに追加
2. **型安全性**: TypeScript の型注釈と型ガードを活用
3. **JSDoc**: 関数の目的、パラメータ、戻り値、使用例を明記
4. **テスト**: 重要なユーティリティ関数には単体テストを作成
5. **Tree-shaking**: 個別エクスポートを使用してバンドルサイズを最適化
6. **環境別使い分け**:
   - Server Components: `serverApi.ts` を使用（SSR初期データ取得）
   - Client Components: `useApiRequest` フックを使用（ユーザー操作によるAPI呼び出し）

## API通信の使い分け

### Server Components（サーバーサイド）

```typescript
// src/app/users/page.tsx
import { fetchServerData } from '@/utils/serverApi';

export default async function UsersPage() {
  // SSR時の初期データ取得
  const users = await fetchServerData<User[]>('/api/backend/users');
  return <UserList users={users.data} />;
}
```

### Client Components（クライアントサイド）

```typescript
// src/components/UserForm.tsx
'use client';
import { useApiRequest } from '@/hooks/useApiRequest';

export function UserForm() {
  const { create } = useApiRequest();
  
  const handleSubmit = async (userData: CreateUserRequest) => {
    // ユーザー操作によるAPI呼び出し
    const response = await create<User>('/api/backend/users', userData);
    if (response.ok) {
      // 成功処理
    }
  };
}
```

## 既存コードからの移行

既存の `utils/index.ts` から関数を分離する際は、以下の手順で実施：

1. 機能ごとに適切なファイルに関数を移動
2. 型定義と JSDoc を追加
3. リンターエラーを修正
4. 既存のインポートが正常に動作することを確認
5. 必要に応じてテストケースを作成

### 新しいユーティリティの活用

- **サーバーサイドAPI通信**: 従来の `fetch` 直接呼び出しから `serverApi.ts` の使用に移行
- **国際化対応**: エラーメッセージやAPI通信で自動的に言語ヘッダーが付与される
- **型安全性**: すべてのAPI通信で `ResponseBase<T>` 型による統一されたレスポンス処理
- **認証**: httpOnlyクッキーによる自動JWT管理で、セキュリティとUXを両立
