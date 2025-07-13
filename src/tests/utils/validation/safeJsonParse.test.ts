import { describe, expect, test } from 'vitest';
import { safeJsonParse } from '../../../utils/validation';

describe('safeJsonParse', () => {
  describe('正常な解析', () => {
    test('有効なJSONオブジェクト文字列を解析する', () => {
      const jsonString = '{"name":"John","age":30}';
      const fallback = {};
      expect(safeJsonParse(jsonString, fallback)).toEqual({
        name: 'John',
        age: 30,
      });
    });

    test('有効なJSON配列文字列を解析する', () => {
      const jsonString = '[1,"a",true]';
      const fallback: unknown[] = [];
      expect(safeJsonParse(jsonString, fallback)).toEqual([1, 'a', true]);
    });

    test('型パラメータを使用して解析する', () => {
      interface User {
        name: string;
        age: number;
      }
      const jsonString = '{"name":"Jane","age":25}';
      const fallback: User = { name: '', age: 0 };
      const result = safeJsonParse<User>(jsonString, fallback);
      expect(result.name).toBe('Jane');
      expect(result.age).toBe(25);
    });
  });

  describe('異常な解析（フォールバック）', () => {
    test('無効なJSON文字列の場合、フォールバック値を返す', () => {
      const jsonString = 'invalid json';
      const fallback = { error: true };
      expect(safeJsonParse(jsonString, fallback)).toEqual(fallback);
    });

    test('中途半端なJSON文字列の場合、フォールバック値を返す', () => {
      const jsonString = '{"name":"John",';
      const fallback: unknown[] = [];
      expect(safeJsonParse(jsonString, fallback)).toEqual(fallback);
    });

    test('空文字列の場合、フォールバック値を返す', () => {
      const jsonString = '';
      const fallback = 'empty';
      expect(safeJsonParse(jsonString, fallback)).toBe('empty');
    });

    test('nullやundefinedを渡した場合、フォールバック値を返す', () => {
      const fallback = 'fallback';
      // @ts-expect-error: Test invalid input
      expect(safeJsonParse(null, fallback)).toBe(fallback);
      // @ts-expect-error: Test invalid input
      expect(safeJsonParse(undefined, fallback)).toBe(fallback);
    });
  });
});
