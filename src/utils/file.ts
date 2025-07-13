/**
 * ファイルとデータ処理用ユーティリティ関数群
 *
 * このファイルには、ファイルサイズの表示、拡張子の判定、
 * ファイルのダウンロード、データ変換などの関数が含まれています。
 */

/**
 * ファイルサイズを人間が読みやすい形式でフォーマットする関数
 *
 * バイト数を受け取り、適切な単位（KB、MB、GB等）で表示します。
 * ファイルアップロード画面やストレージ使用量の表示に使用されます。
 *
 * @param bytes - サイズ（バイト単位）
 * @param decimals - 小数点以下の桁数（デフォルト：2）
 * @returns フォーマットされたファイルサイズ文字列
 *
 * @example
 * ```typescript
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * formatFileSize(1234567, 1) // "1.2 MB"
 * formatFileSize(0) // "0 Bytes"
 * formatFileSize(500) // "500.00 Bytes"
 * ```
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  // 入力値検証
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) {
    return 'NaN undefined';
  }

  // 0バイトの場合は特別に処理
  if (bytes === 0) return '0 Bytes';

  const k = 1024; // 1KB = 1024バイト
  const dm = decimals < 0 || decimals > 20 ? 2 : decimals; // 負の値や異常値はデフォルトに
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; // 単位配列

  // 負の値の処理
  const absoluteBytes = Math.abs(bytes);
  const sign = bytes < 0 ? '-' : '';

  // バイト未満の場合の処理
  if (absoluteBytes < 1) {
    return `${Math.round(bytes)} ${sizes[0] || 'undefined'}`;
  }

  // どの単位を使うかを計算（対数を使用）
  const i = Math.min(
    Math.floor(Math.log(absoluteBytes) / Math.log(k)),
    sizes.length - 1
  );

  // バイト単位の場合は小数点なし
  if (i === 0) {
    return `${sign}${Math.round(absoluteBytes)} ${sizes[i]}`;
  }

  // 指定した単位で除算し、小数点を調整して表示
  const value = absoluteBytes / k ** i;
  return `${sign}${value.toFixed(dm)} ${sizes[i]}`;
}

/**
 * ファイル名から拡張子を取得する関数
 *
 * ファイル名から最後のドット以降の文字列を拡張子として取得します。
 * 拡張子は小文字に変換されて返されます。
 *
 * @param filename - ファイル名
 * @returns 拡張子（ドットなし）、存在しない場合は空文字列
 *
 * @example
 * ```typescript
 * getFileExtension('document.pdf') // "pdf"
 * getFileExtension('image.jpg') // "jpg"
 * getFileExtension('archive.tar.gz') // "gz"
 * getFileExtension('noextension') // ""
 * getFileExtension('.hidden') // ""（ドットファイル）
 * ```
 */
export function getFileExtension(filename: string): string {
  // 入力値検証
  if (typeof filename !== 'string') {
    throw new Error('getFileExtension requires a string argument');
  }

  // 最後のドットの位置を検索
  const lastDotIndex = filename.lastIndexOf('.');
  // ドットが見つからない、または最初の文字がドットの場合は空文字列を返却
  if (lastDotIndex === -1 || lastDotIndex === 0) return '';
  // ドット以降の文字列を小文字で返却
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * ファイル名から拡張子を除いた部分を取得する関数
 *
 * ファイル名から最後のドットより前の部分を返します。
 * 拡張子を除いたベースファイル名が必要な場合に使用されます。
 *
 * @param filename - ファイル名
 * @returns 拡張子を除いたファイル名
 *
 * @example
 * ```typescript
 * getFilenameWithoutExtension('document.pdf') // "document"
 * getFilenameWithoutExtension('image.jpg') // "image"
 * getFilenameWithoutExtension('archive.tar.gz') // "archive.tar"
 * getFilenameWithoutExtension('noextension') // "noextension"
 * ```
 */
export function getFilenameWithoutExtension(filename: string): string {
  // 入力値検証
  if (typeof filename !== 'string') {
    throw new TypeError('Filename must be a string');
  }

  if (filename.length === 0) {
    return '';
  }

  // 最後のドットの位置を検索
  const lastDotIndex = filename.lastIndexOf('.');

  // ドットが見つからない場合、または先頭がドットの場合（隠しファイル）
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return filename;
  }

  // ドットより前の部分を返却
  return filename.substring(0, lastDotIndex);
}

/**
 * ファイルが画像ファイルかどうかを拡張子で判定する関数
 *
 * 一般的な画像ファイルの拡張子をチェックして、画像ファイルかどうかを判定します。
 * ファイルアップロード時の種別チェックや画像プレビューの表示制御に使用されます。
 *
 * @param filename - ファイル名
 * @returns 画像ファイルの場合true、そうでなければfalse
 *
 * @example
 * ```typescript
 * isImageFile('photo.jpg') // true
 * isImageFile('document.pdf') // false
 * ```
 */
export function isImageFile(filename: string): boolean {
  // 入力値検証
  if (
    filename == null ||
    typeof filename !== 'string' ||
    filename.length === 0
  ) {
    return false;
  }

  // サポートする画像ファイルの拡張子リスト
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg',
    'ico',
  ];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
}

/**
 * 文字列またはBlobデータをファイルとしてダウンロードさせる関数
 *
 * ブラウザ環境でのみ動作します。
 *
 * @param data - ダウンロードするデータ（文字列またはBlob）
 * @param filename - デフォルトのファイル名
 * @param mimeType - データのMIMEタイプ（デフォルト：'application/octet-stream'）
 */
export function downloadAsFile(
  data: string | Blob,
  filename: string,
  mimeType = 'application/octet-stream'
): void {
  const blob =
    data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Fileオブジェクトをテキストとして非同期に読み込む関数
 *
 * エンコーディングはUTF-8に固定されています。
 *
 * @param file - 読み込むFileオブジェクト
 * @returns 読み込んだテキストコンテンツを含むPromise
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.onabort = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * FileオブジェクトをData URLとして非同期に読み込む関数
 *
 * @param file - 読み込むFileオブジェクト
 * @returns Data URL文字列を含むPromise
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.onabort = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * バイト配列（Uint8Array）を16進数文字列に変換する関数
 *
 * @param bytes - 変換するバイト配列
 * @returns 16進数文字列
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
 * bytesToHex(bytes) // "48656c6c6f"
 * ```
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 16進数文字列をバイト配列（Uint8Array）に変換する関数
 *
 * @param hex - 変換する16進数文字列
 * @returns バイト配列
 *
 * @example
 * ```typescript
 * hexToBytes("48656c6c6f") // Uint8Array(5) [72, 101, 108, 108, 111]
 * ```
 */
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }

  // 16進数文字列の妥当性をチェック（0-9, a-f, A-Fのみ許可）
  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    throw new Error('Invalid hex string');
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = Number.parseInt(hex.substring(i, i + 2), 16);
    bytes[i / 2] = byte;
  }
  return bytes;
}
