/**
 * 文字列操作用ユーティリティ関数群
 *
 * このファイルには、文字列の変換、操作、生成を行う
 * ユーティリティ関数が含まれています。
 */

/**
 * 文字列の最初の文字を大文字にする関数
 *
 * 与えられた文字列の最初の文字のみを大文字に変換し、
 * それ以降の文字はそのまま保持します。
 *
 * @param str - 変換したい文字列
 * @returns 最初の文字が大文字になった文字列
 *
 * @example
 * ```typescript
 * capitalize('hello world') // 'Hello world'
 * capitalize('HELLO') // 'HELLO'
 * capitalize('') // ''
 * ```
 */
export function capitalize(str: string): string {
  // 入力値検証
  if (str == null) return '';
  if (typeof str !== 'string') return String(str);

  // 空文字列の場合はそのまま返却
  if (!str) return str;
  // 最初の文字を大文字にし、残りの文字列と結合
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 文字列をキャメルケース（camelCase）に変換する関数
 *
 * ハイフン、アンダースコア、スペースで区切られた文字列を
 * キャメルケース形式に変換します。最初の単語は小文字、
 * 以降の単語の先頭は大文字になります。
 *
 * @param str - 変換したい文字列
 * @returns キャメルケース形式の文字列
 *
 * @example
 * ```typescript
 * toCamelCase('hello-world') // 'helloWorld'
 * toCamelCase('hello_world') // 'helloWorld'
 * toCamelCase('hello world') // 'helloWorld'
 * toCamelCase('Hello-World') // 'helloWorld'
 * ```
 */
export function toCamelCase(str: string): string {
  // 既にcamelCaseの場合、まず正規化
  const normalizedStr = str
    // PascalCase や camelCase を区切り文字で分割可能な形に変換
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

  return (
    normalizedStr
      // 区切り文字（ハイフン、アンダースコア、スペース）で分割
      .split(/[-_\s]+/)
      // 空文字列要素を除去
      .filter((word) => word.length > 0)
      // 最初の単語は小文字、以降は最初の文字を大文字に
      .map((word, index) => {
        if (index === 0) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('')
  );
}

/**
 * 文字列をケバブケース（kebab-case）に変換する関数
 *
 * キャメルケースやスペース区切りの文字列を
 * ハイフン区切りの小文字形式に変換します。
 * CSS クラス名やファイル名に適した形式です。
 *
 * @param str - 変換したい文字列
 * @returns ケバブケース形式の文字列
 *
 * @example
 * ```typescript
 * toKebabCase('helloWorld') // 'hello-world'
 * toKebabCase('HelloWorld') // 'hello-world'
 * toKebabCase('hello world') // 'hello-world'
 * toKebabCase('hello_world') // 'hello-world'
 * ```
 */
export function toKebabCase(str: string): string {
  return (
    str
      // 小文字と大文字の境界にハイフンを挿入
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // 連続した大文字の間にハイフンを挿入（HTML -> h-t-m-l）
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      // スペース、アンダースコア、既存のハイフンを正規化
      .replace(/[\s_-]+/g, '-')
      // 先頭と末尾のハイフンを除去
      .replace(/^-+|-+$/g, '')
      // 全体を小文字に変換
      .toLowerCase()
  );
}

/**
 * 文字列を指定した長さで切り詰めて省略記号を追加する関数
 *
 * 文字列が指定した長さを超える場合、切り詰めて末尾に
 * 省略記号（デフォルトは'...'）を追加します。
 * UI での長いテキストの表示制限に使用されます。
 *
 * @param str - 切り詰めたい文字列
 * @param length - 切り詰める前の最大文字数
 * @param suffix - 切り詰めた際に追加する接尾辞（デフォルト：'...'）
 * @returns 切り詰められた文字列
 *
 * @example
 * ```typescript
 * truncate('Hello, World!', 10) // 'Hello, ...'
 * truncate('Short', 10) // 'Short'
 * truncate('Long text here', 8, '…') // 'Long te…'
 * truncate('これは長いテキストです', 6) // 'これは長...'
 * ```
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  // 文字列が指定長以下の場合はそのまま返却
  if (str.length <= length) return str;

  // lengthが接尾辞の長さ以下の場合は接尾辞のみを返す
  if (length <= suffix.length) return suffix;

  // 接尾辞が空文字列の場合は単純にlengthで切り詰める
  if (suffix === '') {
    return str.slice(0, length);
  }

  // 接尾辞の長さを考慮して切り詰めるべき文字数を計算
  const maxContentLength = length - suffix.length;

  // まず指定された長さまで切り詰める
  let content = str.slice(0, maxContentLength);

  // スペースが含まれている場合のみ単語境界での切り詰めを検討
  if (content.includes(' ')) {
    // 最後のスペースで切り詰めた方が良い場合（単語の途中で切れる場合）
    const lastSpaceIndex = content.lastIndexOf(' ');

    // 単語の境界で切り詰めるかどうかを判断
    if (
      lastSpaceIndex >= 0 &&
      content.length < str.length &&
      str[content.length] !== ' '
    ) {
      content = content.slice(0, lastSpaceIndex + 1);
    }
  }

  return content + suffix;
}

/**
 * 指定した長さのランダムな文字列を生成する関数
 *
 * 指定した文字セットからランダムに文字を選択して
 * 指定した長さの文字列を生成します。
 * ID 生成やトークン作成に使用されます。
 *
 * @param length - 生成する文字列の長さ
 * @param charset - 使用する文字セット（デフォルト：英数字）
 * @returns 生成されたランダム文字列
 *
 * @example
 * ```typescript
 * randomString(8) // 'aB3dE7gH'（例）
 * randomString(4, 'ABCDEF0123456789') // 'A3F1'（例）
 * randomString(6, '0123456789') // '482759'（例：数字のみ）
 * ```
 */
export function randomString(
  length: number,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  // 指定した長さになるまでループ
  for (let i = 0; i < length; i++) {
    // 文字セットからランダムに1文字を選択して追加
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * 数値を指定した文字で左パディングする関数
 *
 * 数値を文字列に変換し、指定した文字で左側を埋めて指定した長さにします。
 * 日付や時刻の表示で、桁数を揃える際に使用されます。
 *
 * @param value - パディングしたい数値
 * @param char - パディングに使用する文字（'0'または' '）
 * @param length - 最終的な文字列の長さ（デフォルト：2）
 * @returns パディングされた文字列
 *
 * @example
 * padLeft(5, '0', 2) // "05"
 * padLeft(123, '0', 4) // "0123"
 */
export const padLeft = (
  value: number,
  char: '0' | ' ' = '0',
  length = 2
): string => {
  const str = String(value);
  if (str.length >= length) {
    return str;
  }
  const padding = char.repeat(length - str.length);
  return padding + str;
};
