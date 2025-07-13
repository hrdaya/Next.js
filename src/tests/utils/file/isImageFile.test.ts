import { describe, expect, test } from 'vitest';
import { isImageFile } from '../../../utils/file';

describe('isImageFile', () => {
  describe('基本機能テスト', () => {
    test('一般的な画像拡張子を正しく判定できる', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('image.jpeg')).toBe(true);
      expect(isImageFile('logo.png')).toBe(true);
      expect(isImageFile('animation.gif')).toBe(true);
      expect(isImageFile('icon.bmp')).toBe(true);
      expect(isImageFile('picture.webp')).toBe(true);
      expect(isImageFile('vector.svg')).toBe(true);
      expect(isImageFile('favicon.ico')).toBe(true);
    });

    test('大文字の拡張子も正しく判定できる', () => {
      expect(isImageFile('photo.JPG')).toBe(true);
      expect(isImageFile('image.PNG')).toBe(true);
    });

    test('画像でない拡張子を正しく判定できる', () => {
      expect(isImageFile('document.pdf')).toBe(false);
      expect(isImageFile('archive.zip')).toBe(false);
      expect(isImageFile('script.js')).toBe(false);
      expect(isImageFile('styles.css')).toBe(false);
    });

    test('拡張子がないファイル名はfalseを返す', () => {
      expect(isImageFile('filename')).toBe(false);
    });

    test('隠しファイル（ドットファイル）', () => {
      expect(isImageFile('.hiddenfile')).toBe(false);
      expect(isImageFile('.config.jpg')).toBe(true);
    });
  });

  describe('エッジケースと特殊なファイル名', () => {
    test('複数のドットを含むファイル名', () => {
      expect(isImageFile('archive.tar.gz')).toBe(false);
      expect(isImageFile('photo.profile.jpg')).toBe(true);
    });

    test('特殊文字を含むファイル名', () => {
      expect(isImageFile('my photo.jpeg')).toBe(true);
      expect(isImageFile('image-01.png')).toBe(true);
    });

    test('Unicode文字を含むファイル名', () => {
      expect(isImageFile('写真.jpg')).toBe(true);
      expect(isImageFile('画像.png')).toBe(true);
      expect(isImageFile('ドキュメント.pdf')).toBe(false);
    });

    test('パスを含むファイル名', () => {
      expect(isImageFile('/path/to/image.png')).toBe(true);
      expect(isImageFile('C:\\images\\photo.jpeg')).toBe(true);
      expect(isImageFile('../assets/logo.svg')).toBe(true);
      expect(isImageFile('/path/to/document.txt')).toBe(false);
    });

    test('空のファイル名はfalseを返す', () => {
      expect(isImageFile('')).toBe(false);
    });
  });

  describe('型安全性とパラメータ検証', () => {
    test('引数が文字列でない場合の挙動（TypeScriptではコンパイルエラー）', () => {
      // @ts-expect-error: 引数は文字列である必要がある
      expect(isImageFile(null)).toBe(false);
      // @ts-expect-error: 引数は文字列である必要がある
      expect(isImageFile(undefined)).toBe(false);
      // @ts-expect-error: 引数は文字列である必要がある
      expect(isImageFile(123)).toBe(false);
    });
  });
});
