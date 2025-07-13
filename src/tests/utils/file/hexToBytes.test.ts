import { describe, expect, test } from 'vitest';
import { hexToBytes } from '../../../utils/file';

describe('hexToBytes', () => {
  test('空の文字列を空のUint8Arrayに変換する', () => {
    expect(hexToBytes('')).toEqual(new Uint8Array([]));
  });

  test('16進数文字列をUint8Arrayに変換する', () => {
    const hex = '00010aff';
    const expected = new Uint8Array([0x00, 0x01, 0x0a, 0xff]);
    expect(hexToBytes(hex)).toEqual(expected);
  });

  test('大文字と小文字が混在した16進数文字列を変換する', () => {
    const hex = '48656C6c6F'; // "Hello"
    const expected = new Uint8Array([72, 101, 108, 108, 111]);
    expect(hexToBytes(hex)).toEqual(expected);
  });

  test('奇数長の16進数文字列はエラーをスローする', () => {
    expect(() => hexToBytes('123')).toThrow('Invalid hex string');
  });

  test('16進数でない文字が含まれている場合はエラーをスローする', () => {
    expect(() => hexToBytes('123g')).toThrow('Invalid hex string');
  });
});
