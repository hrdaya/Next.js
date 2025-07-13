import { describe, expect, it } from 'vitest';
import { isValidUrl } from '../../../utils/validation';

/**
 * isValidUrl関数の包括的テスト
 *
 * URL検証機能をテストします。
 * 基本機能、エッジケース、パフォーマンスをすべて含みます。
 */
describe('isValidUrl関数', () => {
  // 基本機能テスト
  describe('基本機能', () => {
    it('有効なURLでtrueを返す', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('無効なURLでfalseを返す', () => {
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    it('一般的なスキーマを正しく検証する', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('ftp://example.com')).toBe(true);
      expect(isValidUrl('ftps://example.com')).toBe(true);
      expect(isValidUrl('file:///path/to/file')).toBe(true);
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    it('ポート番号を含むURLを処理する', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com:8443')).toBe(true);
      expect(isValidUrl('http://192.168.1.1:8080')).toBe(true);
      expect(isValidUrl('https://example.com:65535')).toBe(true); // 最大ポート番号
    });

    it('クエリパラメータとフラグメントを含むURLを処理する', () => {
      expect(isValidUrl('https://example.com?param=value')).toBe(true);
      expect(
        isValidUrl('https://example.com?param1=value1&param2=value2')
      ).toBe(true);
      expect(isValidUrl('https://example.com#fragment')).toBe(true);
      expect(isValidUrl('https://example.com/path?param=value#fragment')).toBe(
        true
      );
    });

    it('国際化ドメイン名を処理する', () => {
      expect(isValidUrl('https://日本.jp')).toBe(true);
      expect(isValidUrl('http://пример.рф')).toBe(true);
      expect(isValidUrl('https://例子.中国')).toBe(true);
    });

    it('IPアドレスを含むURLを処理する', () => {
      expect(isValidUrl('http://192.168.1.1')).toBe(true);
      expect(isValidUrl('https://10.0.0.1:8080')).toBe(true);
      expect(isValidUrl('http://[::1]')).toBe(true); // IPv6
      expect(isValidUrl('https://[2001:db8::1]:8080')).toBe(true); // IPv6 with port
    });

    it('特殊文字を含むパスを処理する', () => {
      expect(isValidUrl('https://example.com/path/to/file.html')).toBe(true);
      expect(isValidUrl('https://example.com/path-with-hyphens')).toBe(true);
      expect(isValidUrl('https://example.com/path_with_underscores')).toBe(
        true
      );
      expect(
        isValidUrl('https://example.com/path%20with%20encoded%20spaces')
      ).toBe(true);
    });

    it('サブドメインを含むURLを処理する', () => {
      expect(isValidUrl('https://www.example.com')).toBe(true);
      expect(isValidUrl('https://sub.domain.example.com')).toBe(true);
      expect(isValidUrl('https://a.b.c.d.example.com')).toBe(true);
    });

    it('空文字列や空白文字を正しく処理する', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('   ')).toBe(false);
      expect(isValidUrl('\t')).toBe(false);
      expect(isValidUrl('\n')).toBe(false);
    });
  });

  // 境界値テスト
  describe('境界値テスト', () => {
    it('非常に長いURLを処理する', () => {
      const longPath = 'path/'.repeat(100);
      const longUrl = `https://example.com/${longPath}`;
      expect(isValidUrl(longUrl)).toBe(true);

      // 実用的でない長さのURL
      const veryLongPath = 'a'.repeat(2000);
      const veryLongUrl = `https://example.com/${veryLongPath}`;
      expect(isValidUrl(veryLongUrl)).toBe(true);
    });

    it('最小限のURLを処理する', () => {
      expect(isValidUrl('http://a.b')).toBe(true);
      expect(isValidUrl('ftp://x.y')).toBe(true);
    });

    it('ポート番号の境界値を処理する', () => {
      expect(isValidUrl('http://example.com:1')).toBe(true); // 最小ポート
      expect(isValidUrl('http://example.com:65535')).toBe(true); // 最大ポート
      expect(isValidUrl('http://example.com:0')).toBe(false); // 無効なポート
      expect(isValidUrl('http://example.com:65536')).toBe(false); // 範囲外ポート
    });
  });

  // セキュリティテスト
  describe('セキュリティ', () => {
    it('javascript:スキーマを適切に処理する', () => {
      expect(isValidUrl('javascript:alert("xss")')).toBe(true); // 技術的には有効なURL
      expect(isValidUrl('javascript:void(0)')).toBe(true);
    });

    it('data:スキーマを適切に処理する', () => {
      expect(isValidUrl('data:text/plain;base64,SGVsbG8gV29ybGQ=')).toBe(true);
      expect(
        isValidUrl(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        )
      ).toBe(true);
    });

    it('異常に長い入力を安全に処理する', () => {
      const veryLongString = 'a'.repeat(10000);
      const startTime = performance.now();

      const result = isValidUrl(`https://example.com/${veryLongString}`);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result).toBe(true); // 長いが有効なURL
      // 異常に長い入力でも合理的な時間で処理が完了することを確認
      expect(executionTime).toBeLessThan(100);
    });
  });

  // 型安全性テスト
  describe('型安全性', () => {
    it('TypeScriptの型チェックで正しい型が受け入れられる', () => {
      expect(() => {
        isValidUrl('https://example.com');
        isValidUrl('');
      }).not.toThrow();
    });

    it('実行時エラーが発生しない', () => {
      expect(() => {
        isValidUrl('https://example.com');
        isValidUrl('');
        isValidUrl('invalid');
      }).not.toThrow();
    });
  });

  // 実世界のユースケーステスト
  describe('実世界のユースケース', () => {
    it('一般的なWebサイトのURLを正しく処理する', () => {
      expect(isValidUrl('https://www.google.com')).toBe(true);
      expect(isValidUrl('https://github.com/user/repo')).toBe(true);
      expect(isValidUrl('https://stackoverflow.com/questions/123')).toBe(true);
      expect(isValidUrl('https://api.example.com/v1/users')).toBe(true);
    });

    it('開発環境でよく使われるURLを正しく処理する', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('http://127.0.0.1:8080')).toBe(true);
      expect(isValidUrl('http://192.168.1.100:3000')).toBe(true);
      expect(isValidUrl('http://dev.example.com')).toBe(true);
    });

    it('ソーシャルメディアやCDNのURLを正しく処理する', () => {
      expect(
        isValidUrl('https://cdn.jsdelivr.net/npm/package@version/file.js')
      ).toBe(true);
      expect(isValidUrl('https://unpkg.com/package@version/dist/file.js')).toBe(
        true
      );
      expect(isValidUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
        true
      );
      expect(isValidUrl('https://twitter.com/user/status/123456789')).toBe(
        true
      );
    });

    it('ファイルダウンロードURLを正しく処理する', () => {
      expect(isValidUrl('https://example.com/files/document.pdf')).toBe(true);
      expect(isValidUrl('https://example.com/downloads/app.zip')).toBe(true);
      expect(isValidUrl('ftp://files.example.com/public/file.txt')).toBe(true);
    });
  });

  // 不正な入力値のテスト
  describe('不正な入力値', () => {
    it('nullやundefinedを渡した場合にfalseを返す', () => {
      // @ts-expect-error: Test invalid input
      expect(isValidUrl(null)).toBe(false);
      // @ts-expect-error: Test invalid input
      expect(isValidUrl(undefined)).toBe(false);
    });

    it('数値やオブジェクトを渡した場合にfalseを返す', () => {
      // @ts-expect-error: Test invalid input
      expect(isValidUrl(123)).toBe(false);
      // @ts-expect-error: Test invalid input
      expect(isValidUrl({})).toBe(false);
    });
  });
});
