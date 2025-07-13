import { describe, expect, test } from 'vitest';
import { toKebabCase } from '../../../utils/string';

describe('toKebabCase', () => {
  describe('基本機能テスト', () => {
    test('camelCaseをkebab-caseに変換する', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('anotherCamelCaseString')).toBe(
        'another-camel-case-string'
      );
    });

    test('PascalCaseをkebab-caseに変換する', () => {
      expect(toKebabCase('HelloWorld')).toBe('hello-world');
      expect(toKebabCase('AnotherPascalCaseString')).toBe(
        'another-pascal-case-string'
      );
    });

    test('snake_caseをkebab-caseに変換する', () => {
      expect(toKebabCase('hello_world')).toBe('hello-world');
      expect(toKebabCase('another_snake_case_string')).toBe(
        'another-snake-case-string'
      );
    });

    test('space separatedをkebab-caseに変換する', () => {
      expect(toKebabCase('hello world')).toBe('hello-world');
      expect(toKebabCase('another space separated string')).toBe(
        'another-space-separated-string'
      );
    });

    test('すでにkebab-caseの文字列はそのまま', () => {
      expect(toKebabCase('hello-world')).toBe('hello-world');
    });
  });

  describe('エッジケースと境界値', () => {
    test('空文字列は空文字列のまま', () => {
      expect(toKebabCase('')).toBe('');
    });

    test('単一の単語は小文字になる', () => {
      expect(toKebabCase('Hello')).toBe('hello');
      expect(toKebabCase('WORLD')).toBe('world');
    });

    test('連続した大文字（略語など）を処理する', () => {
      expect(toKebabCase('HTMLParser')).toBe('html-parser');
      expect(toKebabCase('parseHTMLAndCSS')).toBe('parse-html-and-css');
    });

    test('連続した区切り文字を処理する', () => {
      expect(toKebabCase('hello  world')).toBe('hello-world');
      expect(toKebabCase('hello__world')).toBe('hello-world');
      expect(toKebabCase('hello-_world')).toBe('hello-world');
    });

    test('先頭と末尾の区切り文字を処理する', () => {
      expect(toKebabCase(' HelloWorld ')).toBe('hello-world');
      expect(toKebabCase('_hello_world_')).toBe('hello-world');
    });

    test('数字を含む文字列を処理する', () => {
      expect(toKebabCase('version1_2_3')).toBe('version1-2-3');
      expect(toKebabCase('myVar2')).toBe('my-var2');
    });
  });

  describe('不正な入力値', () => {
    test('nullやundefinedを渡した場合', () => {
      // @ts-expect-error: Test invalid input
      expect(() => toKebabCase(null)).toThrow();
      // @ts-expect-error: Test invalid input
      expect(() => toKebabCase(undefined)).toThrow();
    });
  });
});
