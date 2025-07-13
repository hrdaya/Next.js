import { useEffect, useState } from 'react';

/**
 * 値の変更を指定した遅延時間でデバウンスするReactフック
 *
 * @description
 * - 連続する値の変更を遅延させ、最後の値のみを返す
 * - 検索入力、API呼び出しの制限、リサイズイベントの最適化などに使用
 * - パフォーマンス向上とAPI呼び出し回数の削減に効果的
 *
 * @example
 * ```tsx
 * // 検索入力のデバウンス
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // 300ms後に検索API呼び出し
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 *
 * // フォーム入力の自動保存
 * const [formData, setFormData] = useState({ name: '', email: '' });
 * const debouncedFormData = useDebounce(formData, 1000);
 *
 * useEffect(() => {
 *   // 1秒後に自動保存
 *   saveFormData(debouncedFormData);
 * }, [debouncedFormData]);
 * ```
 *
 * @param value - デバウンスする値
 * @param delay - 遅延時間（ミリ秒）
 * @returns デバウンスされた値
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 指定した遅延時間後に値を更新するタイマーを設定
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // クリーンアップ関数：新しい値が来たら前のタイマーをキャンセル
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
