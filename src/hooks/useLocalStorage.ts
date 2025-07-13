import { useState } from 'react';

/**
 * ブラウザのlocalStorageと同期するReactフック
 *
 * @description
 * - localStorageの値をReactの状態として管理
 * - SSR対応（サーバーサイドでは初期値を使用）
 * - JSON形式での自動シリアライゼーション
 * - エラーハンドリング付き
 *
 * @example
 * ```tsx
 * // 文字列の保存
 * const [name, setName] = useLocalStorage('userName', '');
 *
 * // オブジェクトの保存
 * const [settings, setSettings] = useLocalStorage('userSettings', {
 *   theme: 'light',
 *   language: 'en'
 * });
 *
 * // 配列の保存
 * const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);
 * ```
 *
 * @param key - localStorageのキー名
 * @param initialValue - 初期値（localStorageに値がない場合やSSR時に使用）
 * @returns [値, セッター関数] のタプル
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR環境（window未定義）では初期値を返す
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * 値を設定してlocalStorageに保存する
   * @param value - 保存する値
   */
  const setValue = (value: T) => {
    try {
      setStoredValue(value);

      // クライアントサイドでのみlocalStorageに保存
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
