import { describe, expect, test, vi } from 'vitest';
import { once } from '../../../utils/timing';

describe('once', () => {
  describe('基本機能テスト', () => {
    test('関数が一度だけ実行される', () => {
      const func = vi.fn();
      const onceFunc = once(func);

      onceFunc();
      onceFunc();
      onceFunc();

      expect(func).toHaveBeenCalledTimes(1);
    });

    test('最初の呼び出しの戻り値がキャッシュされ、以降の呼び出しでも返される', () => {
      let callCount = 0;
      const func = () => {
        callCount++;
        return callCount;
      };
      const onceFunc = once(func);

      const result1 = onceFunc();
      const result2 = onceFunc();
      const result3 = onceFunc();

      expect(result1).toBe(1);
      expect(result2).toBe(1);
      expect(result3).toBe(1);
    });

    test('引数が正しく渡される', () => {
      const func = vi.fn();
      const onceFunc = once(func);

      onceFunc(1, 'a', true);
      expect(func).toHaveBeenCalledWith(1, 'a', true);
    });

    test('2回目以降の呼び出しでは引数は無視される', () => {
      const func = vi.fn();
      const onceFunc = once(func);

      onceFunc(1);
      onceFunc(2);

      expect(func).toHaveBeenCalledWith(1);
      expect(func).not.toHaveBeenCalledWith(2);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('エッジケースと境界値', () => {
    test('引数がない関数でも動作する', () => {
      const func = vi.fn(() => 'result');
      const onceFunc = once(func);

      expect(onceFunc()).toBe('result');
      expect(onceFunc()).toBe('result');
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('戻り値がundefinedの関数でも動作する', () => {
      const func = vi.fn(() => undefined);
      const onceFunc = once(func);

      expect(onceFunc()).toBeUndefined();
      expect(onceFunc()).toBeUndefined();
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('Promiseを返す関数でも動作する', async () => {
      const func = vi.fn(async () => 'async result');
      const onceFunc = once(func);

      const promise1 = onceFunc();
      const promise2 = onceFunc();

      expect(promise1).toBe(promise2);
      await expect(promise1).resolves.toBe('async result');
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('thisコンテキストのテスト', () => {
    test('thisコンテキストが正しくバインドされる', () => {
      const obj = {
        count: 0,
        increment: once(function (this: { count: number }) {
          this.count++;
          return this.count;
        }),
      };

      obj.increment();
      obj.increment();

      expect(obj.count).toBe(1);
    });
  });

  describe('エラーハンドリング', () => {
    test('最初の実行でエラーが発生した場合、再実行できるべきではない', () => {
      const error = new Error('Initial execution failed');
      const func = vi.fn(() => {
        throw error;
      });
      const onceFunc = once(func);

      expect(() => onceFunc()).toThrow(error);
      expect(() => onceFunc()).toThrow(error); // キャッシュされたエラーがスローされる

      expect(func).toHaveBeenCalledTimes(1);
    });
  });
});
