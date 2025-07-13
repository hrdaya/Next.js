import { describe, expect, it } from 'vitest';
import { cn } from '../../../utils/classNames';

/**
 * cn関数の包括的テスト
 *
 * クラス名の結合とフィルタリング機能をテストします。
 * 基本機能、エッジケース、パフォーマンスをすべて含みます。
 */
describe('cn関数', () => {
  // 基本機能テスト
  describe('基本機能', () => {
    it('文字列のクラス名を正しく結合できる', () => {
      const result = cn('btn', 'primary', 'large');
      expect(result).toBe('btn primary large');
    });

    it('単一のクラス名でも正しく動作する', () => {
      const result = cn('single-class');
      expect(result).toBe('single-class');
    });

    it('空の引数でも正しく動作する', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('条件付きクラス名（truthy）を正しく結合できる', () => {
      const isActive = true;
      const isPrimary = true;
      const result = cn('btn', isActive && 'active', isPrimary && 'primary');
      expect(result).toBe('btn active primary');
    });

    it('条件付きクラス名（falsy）を正しく除外できる', () => {
      const isActive = false;
      const isPrimary = true;
      const result = cn('btn', isActive && 'active', isPrimary && 'primary');
      expect(result).toBe('btn primary');
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    it('null値を正しく除外できる', () => {
      const result = cn('btn', null, 'primary');
      expect(result).toBe('btn primary');
    });

    it('undefined値を正しく除外できる', () => {
      const result = cn('btn', undefined, 'primary');
      expect(result).toBe('btn primary');
    });

    it('false値を正しく除外できる', () => {
      const result = cn('btn', false, 'primary');
      expect(result).toBe('btn primary');
    });

    it('falsy値（条件式での0）を正しく除外できる', () => {
      const count = 0;
      const result = cn('btn', count > 0 && 'has-count', 'primary');
      expect(result).toBe('btn primary');
    });

    it('空文字列を正しく除外できる', () => {
      const result = cn('btn', '', 'primary');
      expect(result).toBe('btn primary');
    });

    it('複数のfalsy値を一度に除外できる', () => {
      const result = cn('btn', null, undefined, false, '', 'primary');
      expect(result).toBe('btn primary');
    });

    it('すべてがfalsy値の場合は空文字列を返す', () => {
      const result = cn(null, undefined, false, '');
      expect(result).toBe('');
    });

    it('スペースを含むクラス名でも正しく動作する', () => {
      const result = cn('btn primary', 'large');
      expect(result).toBe('btn primary large');
    });

    it('連続したスペースがあっても正しく結合される', () => {
      const result = cn('btn  primary', '  large  ');
      expect(result).toBe('btn  primary   large  ');
    });

    it('特殊文字を含むクラス名でも正しく動作する', () => {
      const result = cn('w-1/2', 'h-[50px]', 'bg-red-500/50');
      expect(result).toBe('w-1/2 h-[50px] bg-red-500/50');
    });

    it('数値や真偽値などの非文字列を誤って渡した場合の動作', () => {
      // @ts-expect-error: cnは文字列、null、undefined、falseのみを受け入れる
      const result = cn('btn', 123, true, 'primary');
      // Boolean(123) -> true, Boolean(true) -> true となり、これらはフィルタリングされない
      // join(' ')は非文字列を文字列化するため、'btn 123 true primary' となる
      expect(result).toBe('btn 123 true primary');
    });
  });

  // 型安全性テスト
  describe('型安全性', () => {
    it('TypeScriptの型チェックで正しい型が受け入れられる', () => {
      // これらは型エラーを起こさないことを確認
      expect(() => {
        cn('string');
        cn('string', null);
        cn('string', undefined);
        cn('string', false);
        cn('string', true && 'conditional');
      }).not.toThrow();
    });

    it('実行時エラーが発生しない', () => {
      expect(() => {
        cn('normal');
        cn();
        cn(null);
        cn(undefined);
        cn(false);
        cn('', null, undefined, false);
      }).not.toThrow();
    });
  });
});
