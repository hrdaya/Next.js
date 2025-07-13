/**
 * 関数の実行タイミングを制御するユーティリティ関数群
 *
 * このファイルには、関数の実行頻度や実行回数を制御する
 * ユーティリティ関数が含まれています。
 */

/**
 * デバウンス機能を提供する関数
 *
 * 関数の実行を遅延させ、指定した待機時間内に再度呼び出された場合は
 * 前の実行をキャンセルして新しい実行をスケジュールします。
 * 連続したイベント（入力、スクロール等）の処理に効果的です。
 *
 * @param func - デバウンス処理を適用する関数
 * @param wait - 遅延時間（ミリ秒）
 * @returns デバウンス処理が適用された関数
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('検索中:', query);
 * }, 300);
 *
 * // 300ms以内の連続呼び出しは最後のもののみ実行される
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // この呼び出しのみが300ms後に実行される
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function (this: unknown, ...args: Parameters<T>) {
    // 既存のタイマーをクリア（前の実行をキャンセル）
    clearTimeout(timeout);
    // 新しいタイマーを設定（指定時間後に関数を実行）
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * スロットル機能を提供する関数
 *
 * 関数の実行頻度を制限し、指定した時間間隔で最大1回のみ実行されるようにします。
 * 高頻度で発生するイベント（スクロール、リサイズ等）のパフォーマンス最適化に使用されます。
 *
 * @param func - スロットル処理を適用する関数
 * @param limit - 実行間隔の制限時間（ミリ秒）
 * @returns スロットル処理が適用された関数
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   console.log('スクロールイベントを処理');
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 * // 100ms間隔でのみスクロールイベントが処理される
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: unknown, ...args: Parameters<T>) {
    // 制限時間が0の場合は常に実行
    if (limit <= 0) {
      func.apply(this, args);
      return;
    }

    // スロットル中でなければ関数を実行
    if (!inThrottle) {
      func.apply(this, args); // 関数を即座に実行
      inThrottle = true; // スロットル状態をオンに設定
      setTimeout(() => {
        inThrottle = false; // 指定時間後にスロットル状態を解除
      }, limit);
    }
    // スロットル中の場合は何もしない（呼び出しを無視）
  };
}

/**
 * 一度だけ実行される関数を作成する関数
 *
 * 与えられた関数を一度だけ実行可能にラップします。
 * 初期化処理やシングルトンパターンの実装に使用されます。
 *
 * @param func - 一度だけ実行したい関数
 * @returns 一度だけ実行可能な関数
 *
 * @example
 * ```typescript
 * const initializeOnce = once(() => {
 *   console.log('初期化完了');
 * });
 *
 * initializeOnce(); // ログ出力: "初期化完了"
 * initializeOnce(); // 何も実行されない
 * initializeOnce(); // 何も実行されない
 * ```
 */
export function once<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let called = false; // 実行済みフラグ
  let result: ReturnType<T>; // 実行結果をキャッシュ
  let error: unknown; // エラーをキャッシュ
  let hasError = false; // エラー発生フラグ

  return function (this: unknown, ...args: Parameters<T>) {
    if (!called) {
      called = true;
      try {
        result = func.apply(this, args) as ReturnType<T>;
        return result;
      } catch (e) {
        error = e;
        hasError = true;
        throw e;
      }
    }

    if (hasError) {
      throw error;
    }
    return result;
  };
}
