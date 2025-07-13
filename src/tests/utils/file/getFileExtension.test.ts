import { describe, expect, test } from 'vitest';
import { getFileExtension } from '../../../utils/file';

describe('getFileExtension', () => {
  describe('基本機能テスト', () => {
    test('一般的な拡張子を正しく取得できる', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.JPEG')).toBe('jpeg'); // 大文字も小文字に変換
      expect(getFileExtension('archive.tar.gz')).toBe('gz'); // 複数のドット
    });

    test('拡張子がないファイル名は空文字列を返す', () => {
      expect(getFileExtension('filename')).toBe('');
    });

    test('ファイル名がドットで始まる場合（隠しファイル）は空文字列を返す', () => {
      expect(getFileExtension('.bashrc')).toBe('');
      expect(getFileExtension('.config.json')).toBe('json'); // 最後のドット以降
    });

    test('ファイル名がドットで終わる場合は空文字列を返す', () => {
      expect(getFileExtension('filename.')).toBe('');
    });

    test('空のファイル名は空文字列を返す', () => {
      expect(getFileExtension('')).toBe('');
    });
  });

  describe('エッジケースと特殊なファイル名', () => {
    test('非常に長いファイル名', () => {
      const longFilename = `${'a'.repeat(255)}.longextension`;
      expect(getFileExtension(longFilename)).toBe('longextension');
    });

    test('特殊文字を含むファイル名', () => {
      expect(getFileExtension('file with spaces.txt')).toBe('txt');
      expect(getFileExtension('file-with-hyphens.log')).toBe('log');
      expect(getFileExtension('file_with_underscores.dat')).toBe('dat');
      expect(getFileExtension('file@special$chars.tmp')).toBe('tmp');
    });

    test('複数のドットが連続しているファイル名', () => {
      expect(getFileExtension('file..name.txt')).toBe('txt');
      expect(getFileExtension('file...zip')).toBe('zip');
    });

    test('Unicode文字を含むファイル名', () => {
      expect(getFileExtension('写真.jpg')).toBe('jpg');
      expect(getFileExtension('ドキュメント.docx')).toBe('docx');
      expect(getFileExtension('ファイル名.tar.gz')).toBe('gz');
    });

    test('パスを含むファイル名', () => {
      expect(getFileExtension('/path/to/file.txt')).toBe('txt');
      expect(getFileExtension('C:\\Users\\Test\\document.pdf')).toBe('pdf');
      expect(getFileExtension('../relative/path/image.png')).toBe('png');
    });
  });

  describe('型安全性とパラメータ検証', () => {
    test('引数が文字列でない場合の挙動（TypeScriptではコンパイルエラー）', () => {
      // @ts-expect-error: 引数は文字列である必要がある
      expect(() => getFileExtension(null)).toThrow();
      // @ts-expect-error: 引数は文字列である必要がある
      expect(() => getFileExtension(undefined)).toThrow();
      // @ts-expect-error: 引数は文字列である必要がある
      expect(() => getFileExtension(123)).toThrow();
    });
  });
});
