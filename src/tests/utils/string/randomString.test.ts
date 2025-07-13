import { describe, expect, test } from 'vitest';
import { randomString } from '../../../utils/string';

describe('randomString', () => {
  describe('基本機能テスト', () => {
    test('指定した長さの文字列を生成する', () => {
      expect(randomString(10)).toHaveLength(10);
      expect(randomString(0)).toHaveLength(0);
      expect(randomString(100)).toHaveLength(100);
    });

    test('生成された文字列がデフォルトの文字セットに含まれる文字のみで構成されている', () => {
      const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const result = randomString(50);
      for (const char of result) {
        expect(charset).toContain(char);
      }
    });

    test('カスタム文字セットを使用して文字列を生成する', () => {
      const customCharset = 'abc123';
      const result = randomString(20, customCharset);
      expect(result).toHaveLength(20);
      for (const char of result) {
        expect(customCharset).toContain(char);
      }
    });
  });

  describe('エッジケースと境界値', () => {
    test('長さ0を指定すると空文字列を返す', () => {
      expect(randomString(0)).toBe('');
    });

    test('文字セットが1文字の場合、その文字を繰り返した文字列を返す', () => {
      expect(randomString(5, 'a')).toBe('aaaaa');
    });

    test('非常に長い文字列を生成できる', () => {
      // パフォーマンスに影響するため、長すぎない値でテスト
      expect(randomString(1000)).toHaveLength(1000);
    });
  });

  describe('ランダム性テスト', () => {
    test('複数回実行しても異なる文字列が生成される可能性が高い', () => {
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(randomString(10));
      }
      // 100回試行してすべて同じである確率は天文学的に低い
      expect(results.size).toBeGreaterThan(95);
    });
  });

  describe('不正な入力値', () => {
    test('負の長さを指定した場合、空文字列を返す', () => {
      expect(randomString(-10)).toBe('');
    });

    test('文字セットが空の場合、空文字列を返す', () => {
      expect(randomString(10, '')).toBe('');
    });
  });
});
