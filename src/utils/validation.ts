/**
 * 型チェックとバリデーション用ユーティリティ関数群
 *
 * このファイルには、データの型チェック、フォーマットの検証、
 * 空値チェックなどのバリデーション関数が含まれています。
 */

/**
 * メールアドレスの形式が有効かどうかをチェックする関数
 *
 * 基本的なメールアドレスの形式（user@domain.com）が
 * 正しいかどうかを正規表現でチェックします。
 *
 * @param email - 検証したいメールアドレス文字列
 * @returns 有効な形式の場合true、そうでなければfalse
 *
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * isValidEmail('test@co.jp') // true
 * isValidEmail('user@') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const trimmedEmail = email.trim();

  // 長さの制限チェック（RFC5321準拠）
  if (trimmedEmail.length > 254) return false;

  // ローカル部の長さチェック（@より前の部分）
  const atIndex = trimmedEmail.indexOf('@');
  if (atIndex === -1) return false;

  const localPart = trimmedEmail.substring(0, atIndex);
  if (localPart.length > 64) return false;

  // 基本的なメール形式をチェックする正規表現（ASCII文字のみ）
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(trimmedEmail);
}

/**
 * URLの形式が有効かどうかをチェックする関数
 *
 * ブラウザのURL APIを使用してURLの有効性を検証します。
 * プロトコル（http、https等）を含む完全なURLが必要です。
 *
 * @param url - 検証したいURL文字列
 * @returns 有効なURL形式の場合true、そうでなければfalse
 *
 * @example
 * ```typescript
 * isValidUrl('https://example.com') // true
 * isValidUrl('http://localhost:3000') // true
 * isValidUrl('not-a-url') // false
 * isValidUrl('example.com') // false（プロトコルなし）
 * ```
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    // URL コンストラクタで有効性をチェック
    const parsedUrl = new URL(url);

    // ポート番号の範囲チェック（1-65535）
    if (parsedUrl.port) {
      const port = Number.parseInt(parsedUrl.port, 10);
      if (port < 1 || port > 65535) {
        return false;
      }
    }

    return true;
  } catch {
    // 無効なURLの場合は例外が発生するのでfalseを返す
    return false;
  }
}

/**
 * 値が空（null、undefined、空文字列、空配列、空オブジェクト）かどうかをチェックする関数
 *
 * 様々な型の「空」状態を統一的にチェックします。
 * フォームバリデーションやデータの存在確認に使用されます。
 *
 * @param value - チェックしたい値
 * @returns 値が空と判断される場合true、そうでなければfalse
 *
 * @example
 * ```typescript
 * isEmpty('') // true（空文字列）
 * isEmpty('   ') // true（空白のみの文字列）
 * isEmpty([]) // true（空配列）
 * isEmpty({}) // true（空オブジェクト）
 * isEmpty(null) // true
 * isEmpty(undefined) // true
 * isEmpty('hello') // false
 * isEmpty([1, 2, 3]) // false
 * isEmpty({ name: 'John' }) // false
 * ```
 */
export function isEmpty(value: unknown): boolean {
  // null または undefined の場合
  if (value == null) return true;
  // 文字列の場合：トリム後の長さが0なら空
  if (typeof value === 'string') return value.trim().length === 0;
  // 配列の場合：長さが0なら空
  if (Array.isArray(value)) return value.length === 0;
  // オブジェクトの場合：プロパティが0個なら空
  if (typeof value === 'object') {
    // Dateオブジェクトは空ではないとみなす
    if (value instanceof Date) {
      return false;
    }
    // RegExpオブジェクトは空ではないとみなす
    if (value instanceof RegExp) {
      return false;
    }
    // 列挙可能な独自プロパティの数をチェック（プロトタイプのプロパティは除外）
    const keys = Object.keys(value);
    if (keys.length === 0) return true;

    // TypeScriptクラスのプロパティかどうかをチェック
    // すべてのプロパティがundefinedで、かつconstructorが存在する場合のみtrue
    const allUndefined = keys.every(
      (key) => (value as Record<string, unknown>)[key] === undefined
    );
    if (allUndefined) {
      // constructorプロパティを持つオブジェクト（クラスインスタンス）かどうかチェック
      const obj = value as Record<string, unknown>;
      const hasConstructor =
        'constructor' in value &&
        typeof obj.constructor === 'function' &&
        obj.constructor !== Object;
      return hasConstructor;
    }

    return false;
  }
  // その他の型の場合：空ではない
  return false;
}

/**
 * 値が文字列かどうかをチェックする型ガード関数
 *
 * TypeScriptの型安全性を保ちながら、値が文字列であることを
 * 実行時にチェックし、型を絞り込みます。
 *
 * @param value - チェックしたい値
 * @returns 値が文字列の場合true（型も string に絞り込まれる）
 *
 * @example
 * ```typescript
 * if (isString(userInput)) {
 *   // この中では userInput は string 型として扱われる
 *   console.log(userInput.toUpperCase());
 * }
 * ```
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 値が有効な数値かどうかをチェックする型ガード関数
 *
 * TypeScriptの型安全性を保ちながら、値が有効な数値であることを
 * 実行時にチェックし、型を絞り込みます。NaNは無効な数値として扱います。
 *
 * @param value - チェックしたい値
 * @returns 値が有効な数値の場合true（型も number に絞り込まれる）
 *
 * @example
 * ```typescript
 * if (isNumber(userInput)) {
 *   // この中では userInput は number 型として扱われる
 *   console.log(userInput.toFixed(2));
 * }
 * ```
 */
export function isNumber(value: unknown): value is number {
  // typeof チェックと NaN チェックの両方を実行
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * 値がboolean型かどうかをチェックする型ガード関数
 *
 * TypeScriptの型安全性を保ちながら、値がboolean型であることを
 * 実行時にチェックし、型を絞り込みます。
 *
 * @param value - チェックしたい値
 * @returns 値がboolean型の場合true（型も boolean に絞り込まれる）
 *
 * @example
 * ```typescript
 * if (isBoolean(userInput)) {
 *   // この中では userInput は boolean 型として扱われる
 *   console.log(userInput ? 'true' : 'false');
 * }
 * ```
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 値がプレーンオブジェクト（nullでも配列でもない）かどうかをチェックする型ガード関数
 *
 * TypeScriptの型安全性を保ちながら、値がプレーンオブジェクトであることを
 * 実行時にチェックし、型を絞り込みます。null や配列は除外されます。
 *
 * @param value - チェックしたい値
 * @returns 値がプレーンオブジェクトの場合true
 *
 * @example
 * ```typescript
 * if (isObject(userInput)) {
 *   // この中では userInput は Record<string, unknown> 型として扱われる
 *   console.log(Object.keys(userInput));
 * }
 * ```
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  // object型かつnullでなく、かつ配列でもないことをチェック
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 値が配列かどうかをチェックする型ガード関数
 *
 * TypeScriptの型安全性を保ちながら、値が配列であることを
 * 実行時にチェックし、型を絞り込みます。
 *
 * @param value - チェックしたい値
 * @returns 値が配列の場合true（型も unknown[] に絞り込まれる）
 *
 * @example
 * ```typescript
 * if (isArray(userInput)) {
 *   // この中では userInput は unknown[] 型として扱われる
 *   console.log(`配列の長さ: ${userInput.length}`);
 * }
 * ```
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * 値が関数かどうかをチェックする型ガード関数
 *
 * TypeScriptの型安全性を保ちながら、値が関数であることを
 * 実行時にチェックし、型を絞り込みます。
 *
 * @param value - チェックしたい値
 * @returns 値が関数の場合true
 *
 * @example
 * ```typescript
 * if (isFunction(userInput)) {
 *   // この中では userInput は関数型として扱われる
 *   const result = userInput();
 * }
 * ```
 */
export function isFunction(
  value: unknown
): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * 安全にJSON文字列を解析する関数
 *
 * JSON.parse()を試行し、失敗した場合はフォールバック値を返します。
 * 外部データの解析やエラーハンドリングが重要な場面で使用されます。
 *
 * @param jsonString - 解析したいJSON文字列
 * @param fallback - 解析に失敗した場合に返すフォールバック値
 * @returns 解析されたオブジェクトまたはフォールバック値
 *
 * @example
 * ```typescript
 * // 正常な解析
 * safeJsonParse('{"name": "John"}', {}) // { name: "John" }
 *
 * // 無効なJSON（フォールバック値が返される）
 * safeJsonParse('invalid json', {}) // {}
 * safeJsonParse('malformed}', []) // []
 *
 * // 型指定付きの使用
 * interface User { name: string; age: number; }
 * const user = safeJsonParse<User>('{"name":"John","age":30}', { name: '', age: 0 });
 * ```
 */
export function safeJsonParse<T = unknown>(jsonString: string, fallback: T): T {
  if (typeof jsonString !== 'string') {
    return fallback;
  }
  try {
    // JSON文字列の解析を試行
    return JSON.parse(jsonString) as T;
  } catch {
    // 解析に失敗した場合はフォールバック値を返却
    return fallback;
  }
}
