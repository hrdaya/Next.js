# Utility Functions

このディレクトリには、プロジェクト全体で使用される様々なユーティリティ関数が含まれています。機能別にファイルが分かれており、必要な関数のみをインポートできるように設計されています。

## ファイル構成

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

## 使用方法

### 個別インポート（推奨）

```typescript
// 必要な関数のみをインポート（Tree-shaking に最適）
import { cn } from '@/utils/classNames';
import { debounce } from '@/utils/timing';
import { isValidEmail } from '@/utils/validation';
```

### まとめてインポート

```typescript
// すべてのユーティリティをインポート
import * as utils from '@/utils';

// または特定のモジュールをまとめてインポート
import * as stringUtils from '@/utils/string';
import * as dateUtils from '@/utils/dateFormat';
```

### index.ts 経由でのインポート

```typescript
// index.ts 経由（後方互換性のため）
import { cn, debounce, isValidEmail } from '@/utils';
```

## 開発ガイドライン

1. **機能別分割**: 新しいユーティリティ関数は適切なカテゴリのファイルに追加
2. **型安全性**: TypeScript の型注釈と型ガードを活用
3. **JSDoc**: 関数の目的、パラメータ、戻り値、使用例を明記
4. **テスト**: 重要なユーティリティ関数には単体テストを作成
5. **Tree-shaking**: 個別エクスポートを使用してバンドルサイズを最適化

## 既存コードからの移行

既存の `utils/index.ts` から関数を分離する際は、以下の手順で実施：

1. 機能ごとに適切なファイルに関数を移動
2. 型定義と JSDoc を追加
3. リンターエラーを修正
4. 既存のインポートが正常に動作することを確認
5. 必要に応じてテストケースを作成
