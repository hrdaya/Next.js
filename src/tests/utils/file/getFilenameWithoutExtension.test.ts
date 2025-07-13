import { describe, expect, test } from 'vitest';
import { getFilenameWithoutExtension } from '../../../utils/file';

describe('getFilenameWithoutExtension', () => {
  describe('基本機能テスト', () => {
    test('一般的なファイル名から拡張子を除いた部分を取得できる', () => {
      expect(getFilenameWithoutExtension('document.pdf')).toBe('document');
      expect(getFilenameWithoutExtension('image.JPEG')).toBe('image');
      expect(getFilenameWithoutExtension('archive.tar.gz')).toBe('archive.tar');
    });

    test('拡張子がないファイル名はそのまま返される', () => {
      expect(getFilenameWithoutExtension('filename')).toBe('filename');
    });

    test('ファイル名がドットで始まる場合（隠しファイル）', () => {
      expect(getFilenameWithoutExtension('.bashrc')).toBe('.bashrc');
      expect(getFilenameWithoutExtension('.config.json')).toBe('.config');
    });

    test('ファイル名がドットで終わる場合', () => {
      expect(getFilenameWithoutExtension('filename.')).toBe('filename');
    });

    test('空のファイル名はそのまま返される', () => {
      expect(getFilenameWithoutExtension('')).toBe('');
    });
  });

  describe('エッジケースと特殊なファイル名', () => {
    test('非常に長いファイル名', () => {
      const longFilename = 'a'.repeat(255);
      const withExt = `${longFilename}.longextension`;
      expect(getFilenameWithoutExtension(withExt)).toBe(longFilename);
    });

    test('特殊文字を含むファイル名', () => {
      expect(getFilenameWithoutExtension('file with spaces.txt')).toBe(
        'file with spaces'
      );
      expect(getFilenameWithoutExtension('file-with-hyphens.log')).toBe(
        'file-with-hyphens'
      );
      expect(getFilenameWithoutExtension('file_with_underscores.dat')).toBe(
        'file_with_underscores'
      );
      expect(getFilenameWithoutExtension('file@special$chars.tmp')).toBe(
        'file@special$chars'
      );
    });

    test('複数のドットが連続しているファイル名', () => {
      expect(getFilenameWithoutExtension('file..name.txt')).toBe('file..name');
      expect(getFilenameWithoutExtension('file...zip')).toBe('file..');
    });

    test('Unicode文字を含むファイル名', () => {
      expect(getFilenameWithoutExtension('写真.jpg')).toBe('写真');
      expect(getFilenameWithoutExtension('ドキュメント.docx')).toBe(
        'ドキュメント'
      );
      expect(getFilenameWithoutExtension('ファイル名.tar.gz')).toBe(
        'ファイル名.tar'
      );
    });

    test('パスを含むファイル名', () => {
      expect(getFilenameWithoutExtension('/path/to/file.txt')).toBe(
        '/path/to/file'
      );
      expect(getFilenameWithoutExtension('C:\\Users\\Test\\document.pdf')).toBe(
        'C:\\Users\\Test\\document'
      );
      expect(getFilenameWithoutExtension('../relative/path/image.png')).toBe(
        '../relative/path/image'
      );
    });
  });

  describe('型安全性とパラメータ検証', () => {
    test('引数が文字列でない場合の挙動（TypeScriptではコンパイルエラー）', () => {
      // @ts-expect-error: 引数は文字列である必要がある
      expect(() => getFilenameWithoutExtension(null)).toThrow();
      // @ts-expect-error: 引数は文字列である必要がある
      expect(() => getFilenameWithoutExtension(undefined)).toThrow();
      // @ts-expect-error: 引数は文字列である必要がある
      expect(() => getFilenameWithoutExtension(123)).toThrow();
    });
  });
});
