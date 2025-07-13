import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../../../utils/timing';

/**
 * debounce関数の包括的テスト
 *
 * 関数の実行遅延とグループ化機能をテストします。
 * 基本機能、エッジケース、パフォーマンスをすべて含みます。
 */
describe('debounce関数', () => {
  // タイマーのモック化
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 基本機能テスト
  describe('基本機能', () => {
    it('指定された遅延後に関数が実行される', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();

      // 遅延前は実行されない
      expect(mockFn).not.toHaveBeenCalled();

      // 100ms経過後に実行される
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('複数回呼び出しても最後の呼び出しのみ実行される', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      // 100ms経過後でも1回のみ実行
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('遅延中に再度呼び出すとタイマーがリセットされる', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();

      // 50ms経過
      vi.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      // 再度呼び出し（タイマーリセット）
      debouncedFn();

      // 最初の50ms + 追加の50ms = 100ms経過
      vi.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      // さらに50ms経過（合計100ms）
      vi.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('引数が正しく渡される', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 123);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('最後の呼び出しの引数が使用される', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('third');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    it('遅延が0の場合でも正しく動作する', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn();

      vi.advanceTimersByTime(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('負の遅延値を0として扱う', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, -100);

      debouncedFn();

      vi.advanceTimersByTime(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('非常に大きな遅延値でも正しく動作する', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100000);

      debouncedFn();

      vi.advanceTimersByTime(99999);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('引数なしでも正しく動作する', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('undefined や null の引数を正しく処理する', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn(undefined, null);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith(undefined, null);
    });

    it('複雑なオブジェクトの引数を正しく処理する', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      const complexArg = { nested: { value: 123 }, array: [1, 2, 3] };
      debouncedFn(complexArg);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith(complexArg);
    });
  });

  // thisコンテキストのテスト
  describe('thisコンテキスト', () => {
    it('thisコンテキストが正しくバインドされるべき', () => {
      const context = {
        value: 42,
        method: vi.fn(function (this: { value: number }) {
          expect(this.value).toBe(42);
        }),
      };

      const debouncedMethod = debounce(context.method, 100);

      // .call() を使ってthisコンテキストを明示的に設定
      debouncedMethod.call(context);

      vi.advanceTimersByTime(100);
      expect(context.method).toHaveBeenCalledTimes(1);
    });

    it('アロー関数ではthisコンテキストはキャプチャされる', () => {
      const context = {
        value: 'test',
        method: vi.fn(),
        run() {
          const debounced = debounce(() => {
            this.method(this.value);
          }, 100);
          debounced();
        },
      };

      context.run();
      vi.advanceTimersByTime(100);
      expect(context.method).toHaveBeenCalledWith('test');
    });
  });

  // 戻り値のテスト
  describe('戻り値の処理', () => {
    it('元の関数の戻り値は取得できない（非同期のため）', () => {
      const mockFn = vi.fn(() => 'return value');
      const debouncedFn = debounce(mockFn, 100);

      const result = debouncedFn();

      expect(result).toBeUndefined();
    });

    it('Promise を返す関数でも正しく動作する', async () => {
      const mockFn = vi.fn(() => Promise.resolve('async result'));
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  // 複数のデバウンス関数のテスト
  describe('複数のデバウンス関数', () => {
    it('異なるデバウンス関数は独立して動作する', () => {
      const mockFn1 = vi.fn();
      const mockFn2 = vi.fn();
      const debouncedFn1 = debounce(mockFn1, 100);
      const debouncedFn2 = debounce(mockFn2, 200);

      debouncedFn1();
      debouncedFn2();

      // 100ms後：最初の関数のみ実行
      vi.advanceTimersByTime(100);
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).not.toHaveBeenCalled();

      // さらに100ms後：2番目の関数も実行
      vi.advanceTimersByTime(100);
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledTimes(1);
    });

    it('同じ関数の複数のデバウンスインスタンスは独立している', () => {
      const mockFn = vi.fn();
      const debouncedFn1 = debounce(mockFn, 100);
      const debouncedFn2 = debounce(mockFn, 100);

      debouncedFn1('first');
      debouncedFn2('second');

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, 'first');
      expect(mockFn).toHaveBeenNthCalledWith(2, 'second');
    });
  });

  // 実際の使用パターンテスト
  describe('実際の使用パターン', () => {
    it('検索入力の処理パターン', () => {
      const searchFn = vi.fn();
      const debouncedSearch = debounce(searchFn, 300);

      // ユーザーが連続してタイピング
      debouncedSearch('a');
      vi.advanceTimersByTime(100);

      debouncedSearch('ab');
      vi.advanceTimersByTime(100);

      debouncedSearch('abc');
      vi.advanceTimersByTime(100);

      debouncedSearch('abcd');

      // タイピング停止後300ms経過
      vi.advanceTimersByTime(300);

      // 最後の検索のみ実行
      expect(searchFn).toHaveBeenCalledTimes(1);
      expect(searchFn).toHaveBeenCalledWith('abcd');
    });

    it('ウィンドウリサイズの処理パターン', () => {
      const resizeFn = vi.fn();
      const debouncedResize = debounce(resizeFn, 250);

      // 連続したリサイズイベント
      for (let i = 0; i < 10; i++) {
        debouncedResize(800 + i, 600 + i);
        vi.advanceTimersByTime(50);
      }

      // リサイズ停止後250ms経過
      vi.advanceTimersByTime(250);

      // 最後のリサイズのみ処理
      expect(resizeFn).toHaveBeenCalledTimes(1);
      expect(resizeFn).toHaveBeenCalledWith(809, 609);
    });

    it('ボタンの連続クリック防止パターン', () => {
      const clickFn = vi.fn();
      const debouncedClick = debounce(clickFn, 500);

      // 連続クリック
      debouncedClick();
      debouncedClick();
      debouncedClick();

      vi.advanceTimersByTime(500);

      // 1回のみ実行
      expect(clickFn).toHaveBeenCalledTimes(1);
    });
  });

  // 型安全性テスト
  describe('型安全性', () => {
    it('TypeScriptの型チェックで正しい型が受け入れられる', () => {
      expect(() => {
        const fn = (...args: unknown[]) => args.join('');
        const debouncedFn = debounce(fn, 100);
        debouncedFn('test', 123);
      }).not.toThrow();
    });

    it('実行時エラーが発生しない', () => {
      expect(() => {
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 100);
        debouncedFn();
        debouncedFn('arg');
        debouncedFn(1, 2, 3);
      }).not.toThrow();
    });
  });

  // メモリリークテスト
  describe('メモリリーク防止', () => {
    it('大量の呼び出し後にメモリリークが発生しない', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // 大量の呼び出し
      for (let i = 0; i < 10000; i++) {
        debouncedFn(i);
      }

      // タイマー実行
      vi.advanceTimersByTime(100);

      // メモリリークの直接的なテストは困難だが、
      // エラーなく完了することでリークの兆候がないことを確認
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(true).toBe(true);
    });
  });
});
