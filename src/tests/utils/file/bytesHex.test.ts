import { describe, expect, test } from 'vitest';
import { bytesToHex, hexToBytes } from '../../../utils/file';

describe('bytesToHex and hexToBytes', () => {
  describe('bytesToHex', () => {
    test('空のUint8Arrayを空の文字列に変換する', () => {
      const bytes = new Uint8Array([]);
      expect(bytesToHex(bytes)).toBe('');
    });

    test('単一バイトの配列を16進数文字列に変換する', () => {
      const bytes = new Uint8Array([0x00, 0x01, 0x0a, 0xff]);
      expect(bytesToHex(bytes)).toBe('00010aff');
    });

    test('複数バイトの配列を16進数文字列に変換する', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      expect(bytesToHex(bytes)).toBe('48656c6c6f');
    });

    test('すべての値が0の配列を変換する', () => {
      const bytes = new Uint8Array([0, 0, 0, 0]);
      expect(bytesToHex(bytes)).toBe('00000000');
    });

    test('すべての値が255の配列を変換する', () => {
      const bytes = new Uint8Array([255, 255, 255, 255]);
      expect(bytesToHex(bytes)).toBe('ffffffff');
    });
  });

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

  describe('相互変換テスト', () => {
    test('bytesToHexとhexToBytesが相互に変換可能である', () => {
      const originalBytes = new Uint8Array(256).map((_, i) => i);
      const hex = bytesToHex(originalBytes);
      const convertedBytes = hexToBytes(hex);
      expect(convertedBytes).toEqual(originalBytes);
    });

    test('ランダムなバイト配列で相互変換をテストする', () => {
      const randomBytes = new Uint8Array(128).map(() =>
        Math.floor(Math.random() * 256)
      );
      const hex = bytesToHex(randomBytes);
      const convertedBytes = hexToBytes(hex);
      expect(convertedBytes).toEqual(randomBytes);
    });
  });
});
