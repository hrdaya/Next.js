import { afterEach, describe, expect, test, vi } from 'vitest';
import { throttle } from '../../../utils/timing';

describe('throttle', () => {
  vi.useFakeTimers();

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('基本機能テスト', () => {
    test('指定した時間間隔で関数が最大1回実行される', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 500);

      throttledFunc();
      throttledFunc();
      throttledFunc();

      expect(func).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(500);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(2);
    });

    test('最初の呼び出しは即座に実行される', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 500);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('制限時間内に関数が再度呼び出されても実行されない', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 500);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(499);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('制限時間後に関数が再度実行される', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 500);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(500);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(2);
    });

    test('関数に引数が正しく渡される', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 500);

      throttledFunc(1, 'a');
      expect(func).toHaveBeenCalledWith(1, 'a');
    });

    test('スロットル中の呼び出しの引数は無視される', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 500);

      throttledFunc(1);
      throttledFunc(2);
      throttledFunc(3);

      expect(func).toHaveBeenCalledWith(1);
      expect(func).not.toHaveBeenCalledWith(2);
      expect(func).not.toHaveBeenCalledWith(3);
    });
  });

  describe('エッジケースと境界値', () => {
    test('制限時間が0の場合、毎回実行される', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 0);

      throttledFunc();
      throttledFunc();
      throttledFunc();

      expect(func).toHaveBeenCalledTimes(3);
    });
  });

  describe('thisコンテキストのテスト', () => {
    test('thisコンテキストが正しくバインドされる', () => {
      const obj = {
        func: vi.fn(function (this: Record<string, unknown>) {
          expect(this).toBe(obj);
        }),
        throttledMethod: () => {},
      };
      obj.throttledMethod = throttle(obj.func, 500);

      obj.throttledMethod();
      expect(obj.func).toHaveBeenCalledTimes(1);
    });
  });
});
