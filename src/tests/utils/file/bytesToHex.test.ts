import { describe, expect, test } from 'vitest';
import { bytesToHex } from '../../../utils/file';

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
