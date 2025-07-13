import { describe, expect, test } from 'vitest';
import { truncate } from '../../../utils/string';

describe('truncate', () => {
  const longText = 'This is a long text for testing purposes.';

  describe('基本機能テスト', () => {
    test('指定した長さに文字列を切り詰める', () => {
      expect(truncate(longText, 20)).toBe('This is a long ...');
    });

    test('文字列が指定長以下の場合は変更しない', () => {
      expect(truncate('short text', 20)).toBe('short text');
      expect(truncate('exact length', 12)).toBe('exact length');
    });

    test('カスタム接尾辞を使用する', () => {
      expect(truncate(longText, 20, '... more')).toBe('This is a ... more');
    });
  });

  describe('エッジケースと境界値', () => {
    test('lengthが0の場合、接尾辞のみを返す', () => {
      expect(truncate(longText, 0)).toBe('...');
    });

    test('lengthが接尾辞の長さより小さい場合、接尾辞のみを返す', () => {
      expect(truncate(longText, 2)).toBe('...');
    });

    test('lengthが接尾辞の長さと等しい場合、接尾辞のみを返す', () => {
      expect(truncate(longText, 3)).toBe('...');
    });

    test('lengthが接尾辞の長さ+1の場合、1文字+接尾辞を返す', () => {
      expect(truncate(longText, 4)).toBe('T...');
    });

    test('空文字列は空文字列のまま', () => {
      expect(truncate('', 10)).toBe('');
    });

    test('接尾辞が空文字列の場合', () => {
      expect(truncate(longText, 20, '')).toBe('This is a long text ');
    });

    test('多言語文字（Unicode）を正しく処理する', () => {
      const unicodeText = 'これは長い日本語のテキストです。';
      expect(truncate(unicodeText, 10)).toBe('これは長い日本...');
    });
  });

  describe('不正な入力値', () => {
    test('nullやundefinedを渡した場合', () => {
      // @ts-expect-error: Test invalid input
      expect(() => truncate(null, 10)).toThrow();
      // @ts-expect-error: Test invalid input
      expect(() => truncate(undefined, 10)).toThrow();
    });
  });
});
