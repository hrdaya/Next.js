import { describe, expect, test } from 'vitest';
import { toCamelCase } from '../../../utils/string';

describe('toCamelCase', () => {
  describe('基本機能テスト', () => {
    test('kebab-caseをcamelCaseに変換する', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld');
      expect(toCamelCase('another-kebab-case-string')).toBe(
        'anotherKebabCaseString'
      );
    });

    test('snake_caseをcamelCaseに変換する', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld');
      expect(toCamelCase('another_snake_case_string')).toBe(
        'anotherSnakeCaseString'
      );
    });

    test('space separatedをcamelCaseに変換する', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
      expect(toCamelCase('another space separated string')).toBe(
        'anotherSpaceSeparatedString'
      );
    });

    test('PascalCaseをcamelCaseに変換する', () => {
      expect(toCamelCase('HelloWorld')).toBe('helloWorld');
      expect(toCamelCase('AnotherPascalCaseString')).toBe(
        'anotherPascalCaseString'
      );
    });

    test('すでにcamelCaseの文字列はそのまま', () => {
      expect(toCamelCase('helloWorld')).toBe('helloWorld');
    });
  });

  describe('エッジケースと境界値', () => {
    test('空文字列は空文字列のまま', () => {
      expect(toCamelCase('')).toBe('');
    });

    test('単一の単語は小文字になる', () => {
      expect(toCamelCase('Hello')).toBe('hello');
      expect(toCamelCase('world')).toBe('world');
    });

    test('連続した区切り文字を処理する', () => {
      expect(toCamelCase('hello--world')).toBe('helloWorld');
      expect(toCamelCase('hello__world')).toBe('helloWorld');
      expect(toCamelCase('hello  world')).toBe('helloWorld');
      expect(toCamelCase('hello-_ world')).toBe('helloWorld');
    });

    test('先頭と末尾の区切り文字を処理する', () => {
      expect(toCamelCase('-hello-world-')).toBe('helloWorld');
      expect(toCamelCase('_hello_world_')).toBe('helloWorld');
      expect(toCamelCase(' hello world ')).toBe('helloWorld');
    });

    test('数字を含む文字列を処理する', () => {
      expect(toCamelCase('version-1-2-3')).toBe('version123');
      expect(toCamelCase('my_var_2')).toBe('myVar2');
    });

    test('大文字の略語を含む文字列を処理する', () => {
      expect(toCamelCase('API-handler')).toBe('apiHandler');
      expect(toCamelCase('handle_HTML_string')).toBe('handleHtmlString');
    });
  });

  describe('不正な入力値', () => {
    test('nullやundefinedを渡した場合', () => {
      // @ts-expect-error: Test invalid input
      expect(() => toCamelCase(null)).toThrow();
      // @ts-expect-error: Test invalid input
      expect(() => toCamelCase(undefined)).toThrow();
    });
  });
});
