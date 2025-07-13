import { describe, expect, it } from 'vitest';
import { isValidEmail } from '../../../utils/validation';

/**
 * isValidEmail関数の包括的テスト
 *
 * メールアドレスの検証機能をテストします。
 * 基本機能、エッジケース、パフォーマンスをすべて含みます。
 */
describe('isValidEmail関数', () => {
  // 基本機能テスト
  describe('基本機能', () => {
    it('有効なメールアドレスでtrueを返す', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email@domain.co.jp')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
      expect(isValidEmail('user123@test-domain.com')).toBe(true);
    });

    it('無効なメールアドレスでfalseを返す', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user name@example.com')).toBe(false);
    });

    it('一般的なメールプロバイダのアドレスを正しく検証する', () => {
      expect(isValidEmail('user@gmail.com')).toBe(true);
      expect(isValidEmail('user@yahoo.co.jp')).toBe(true);
      expect(isValidEmail('user@outlook.com')).toBe(true);
      expect(isValidEmail('user@hotmail.com')).toBe(true);
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    it('非常に長いメールアドレスを処理する', () => {
      const longLocalPart = 'a'.repeat(64); // RFC準拠の最大長
      const longDomain = 'b'.repeat(63); // ドメインラベルの最大長
      const longEmail = `${longLocalPart}@${longDomain}.com`;

      expect(isValidEmail(longEmail)).toBe(true);

      // 制限を超える長さ
      const tooLongLocalPart = 'a'.repeat(65);
      const tooLongEmail = `${tooLongLocalPart}@example.com`;
      expect(isValidEmail(tooLongEmail)).toBe(false);
    });

    it('国際化ドメイン名を処理する', () => {
      expect(isValidEmail('test@日本.jp')).toBe(false);
      expect(isValidEmail('тест@пример.рф')).toBe(false);
      expect(isValidEmail('用户@例子.中国')).toBe(false);
    });

    it('特殊文字を含むメールアドレスを処理する', () => {
      expect(isValidEmail('test+tag@example.com')).toBe(true);
      expect(isValidEmail('test.name@example.com')).toBe(true);
      expect(isValidEmail('test_name@example.com')).toBe(true);
      expect(isValidEmail('test-name@example.com')).toBe(true);

      // RFC準拠だが稀な形式（現在の実装ではサポートしていません）
      expect(isValidEmail('"test name"@example.com')).toBe(false);
      expect(isValidEmail('test@[192.168.1.1]')).toBe(false);
    });

    it('空文字列や空白文字を正しく処理する', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
      expect(isValidEmail('\t')).toBe(false);
      expect(isValidEmail('\n')).toBe(false);
    });

    it('マルチバイト文字を含むローカル部を処理する', () => {
      // 現在の実装はASCII文字のみサポート
      expect(isValidEmail('テスト@example.com')).toBe(false);
      expect(isValidEmail('用户@example.com')).toBe(false);
      expect(isValidEmail('пользователь@example.com')).toBe(false);
    });

    it('複数のピリオドを含むケースを処理する', () => {
      expect(isValidEmail('user.name.test@example.com')).toBe(true);
      expect(isValidEmail('user..name@example.com')).toBe(true); // 現在の実装では許可される
      expect(isValidEmail('.user@example.com')).toBe(true); // 現在の実装では許可される
      expect(isValidEmail('user.@example.com')).toBe(true); // 現在の実装では許可される
    });
  });

  // 境界値テスト
  describe('境界値テスト', () => {
    it('最小長のメールアドレスを処理する', () => {
      expect(isValidEmail('a@b.co')).toBe(true); // 最小限の有効なメール（TLD2文字以上）
    });

    it('サブドメインの深い階層を処理する', () => {
      expect(isValidEmail('user@sub.domain.example.com')).toBe(true);
      expect(isValidEmail('user@a.b.c.d.e.f.g.com')).toBe(true);
    });

    it('数字のみのローカル部とドメインを処理する', () => {
      expect(isValidEmail('123@456.com')).toBe(true);
      expect(isValidEmail('123@456.789')).toBe(false); // TLD部分は文字である必要がある
    });

    it('特殊なTLDを処理する', () => {
      expect(isValidEmail('user@example.museum')).toBe(true);
      expect(isValidEmail('user@example.travel')).toBe(true);
      expect(isValidEmail('user@example.info')).toBe(true);
    });
  });

  // セキュリティテスト
  describe('セキュリティ', () => {
    it('インジェクション攻撃を試行する文字列を安全に処理する', () => {
      expect(
        isValidEmail('user@example.com<script>alert("xss")</script>')
      ).toBe(false);
      expect(isValidEmail("user@example.com'; DROP TABLE users; --")).toBe(
        false
      );
      expect(isValidEmail('user@example.com" OR "1"="1')).toBe(false);
    });

    it('異常に長い入力を安全に処理する', () => {
      const veryLongString = 'a'.repeat(10000);
      const startTime = performance.now();

      const result = isValidEmail(`${veryLongString}@example.com`);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result).toBe(false);
      // 異常に長い入力でも合理的な時間で処理が完了することを確認
      expect(executionTime).toBeLessThan(100);
    });
  });

  // 型安全性テスト
  describe('型安全性', () => {
    it('TypeScriptの型チェックで正しい型が受け入れられる', () => {
      expect(() => {
        isValidEmail('test@example.com');
        isValidEmail('');
      }).not.toThrow();
    });

    it('実行時エラーが発生しない', () => {
      expect(() => {
        isValidEmail('normal@example.com');
        isValidEmail('');
        isValidEmail('invalid');
      }).not.toThrow();
    });
  });

  // 実世界のユースケーステスト
  describe('実世界のユースケース', () => {
    it('フォーム入力の一般的なケースを正しく処理する', () => {
      // ユーザーが入力しそうな様々なパターン
      expect(isValidEmail('user@gmail.com')).toBe(true);
      expect(isValidEmail('User@Gmail.COM')).toBe(true); // 大文字混在
      expect(isValidEmail(' user@gmail.com ')).toBe(true); // 前後の空白
      expect(isValidEmail('user@gmail')).toBe(false); // TLD無し
      expect(isValidEmail('user@.gmail.com')).toBe(true); // 現在の実装では許可される
    });

    it('多言語サイトでの国際化対応を確認する', () => {
      // 注意：現在の正規表現では国際化文字をサポートしていません
      expect(isValidEmail('山田@example.jp')).toBe(false);
      expect(isValidEmail('josé@example.es')).toBe(false);
      expect(isValidEmail('müller@example.de')).toBe(false);
      expect(isValidEmail('andré@example.fr')).toBe(false);
    });
  });

  // 不正な入力値のテスト
  describe('不正な入力値', () => {
    it('nullやundefinedを渡した場合にfalseを返す', () => {
      // @ts-expect-error: Test invalid input
      expect(isValidEmail(null)).toBe(false);
      // @ts-expect-error: Test invalid input
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('数値やオブジェクトを渡した場合にfalseを返す', () => {
      // @ts-expect-error: Test invalid input
      expect(isValidEmail(123)).toBe(false);
      // @ts-expect-error: Test invalid input
      expect(isValidEmail({})).toBe(false);
    });
  });
});
