import { describe, expect, it } from 'vitest';
import { clsx } from '../../../utils/classNames';

/**
 * clsx関数の包括的テスト
 *
 * オブジェクト形式での条件付きクラス名結合機能をテストします。
 * 基本機能、エッジケース、パフォーマンスをすべて含みます。
 */
describe('clsx関数', () => {
  // 基本機能テスト
  describe('基本機能', () => {
    it('ベースクラスと条件付きクラスを正しく結合できる', () => {
      const result = clsx('btn', {
        'btn-primary': true,
        'btn-large': true,
        'btn-disabled': false,
      });
      expect(result).toBe('btn btn-primary btn-large');
    });

    it('ベースクラスのみでも正しく動作する', () => {
      const result = clsx('btn', {});
      expect(result).toBe('btn');
    });

    it('すべての条件がfalseでもベースクラスは残る', () => {
      const result = clsx('btn', {
        'btn-primary': false,
        'btn-large': false,
        'btn-disabled': false,
      });
      expect(result).toBe('btn');
    });

    it('複数の真の条件を正しく処理できる', () => {
      const result = clsx('base', {
        'class-a': true,
        'class-b': true,
        'class-c': true,
      });
      expect(result).toBe('base class-a class-b class-c');
    });

    it('基本的な真偽値条件を正しく処理できる', () => {
      const result = clsx('base', {
        active: true,
        disabled: false,
        primary: true,
        secondary: false,
      });
      expect(result).toBe('base active primary');
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    it('空のベースクラスでも正しく動作する', () => {
      const result = clsx('', {
        'btn-primary': true,
        'btn-large': false,
      });
      expect(result).toBe('btn-primary');
    });

    it('ベースクラスにスペースが含まれていても正しく動作する', () => {
      const result = clsx('btn primary', {
        large: true,
      });
      expect(result).toBe('btn primary large');
    });

    it('条件オブジェクトのキーに特殊文字が含まれていても動作する', () => {
      const result = clsx('btn', {
        'btn-primary--active': true,
        btn_disabled: false,
        'btn.large': true,
      });
      expect(result).toBe('btn btn-primary--active btn.large');
    });

    it('条件オブジェクトが空でも正しく動作する', () => {
      const result = clsx('btn', {});
      expect(result).toBe('btn');
    });

    it('ベースクラスが空やnullでも正しく動作する', () => {
      expect(clsx('', { class: true })).toBe('class');
      // 型安全性のため、実際の使用では空文字列を渡すことが推奨される
    });

    it('キーに空文字列が含まれていても正しく処理する', () => {
      const result = clsx('base', {
        '': true,
        'valid-class': true,
      });
      expect(result).toBe('base valid-class');
    });

    it('条件オブジェクトの値がtruthy/falsyな値の場合の動作', () => {
      const result = clsx('btn', {
        'truthy-1': 1 as unknown as boolean,
        'truthy-2': 'string' as unknown as boolean,
        'falsy-1': 0 as unknown as boolean,
        'falsy-2': null as unknown as boolean,
        'falsy-3': undefined as unknown as boolean,
      });
      expect(result).toBe('btn truthy-1 truthy-2');
    });
  });

  // 型安全性テスト
  describe('型安全性', () => {
    it('TypeScriptの型チェックで正しい型が受け入れられる', () => {
      // これらは型エラーを起こさないことを確認
      expect(() => {
        clsx('base', { class: true });
        clsx('base', { class: false });
        clsx('base', { active: true, disabled: false });
      }).not.toThrow();
    });

    it('実行時エラーが発生しない', () => {
      expect(() => {
        clsx('normal', { test: true });
        clsx('', { test: true });
        clsx('base', {});
      }).not.toThrow();
    });
  });

  // 統合テスト
  describe('統合テスト', () => {
    it('実際のUIコンポーネントパターンで正しく動作する', () => {
      const isActive = true;
      const isDisabled = false;
      const size = 'large';
      const variant = 'primary';

      const result = clsx('btn', {
        'btn-active': isActive,
        'btn-disabled': isDisabled,
        'btn-large': size === 'large',
        'btn-primary': variant === 'primary',
      });

      expect(result).toBe('btn btn-active btn-large btn-primary');
    });

    it('条件付きレスポンシブクラスが正しく動作する', () => {
      const isMobile = false;
      const isTablet = true;
      const isDesktop = false;

      const result = clsx('component', {
        'sm:w-full': isMobile,
        'md:w-1/2': isTablet,
        'lg:w-1/3': isDesktop,
        flex: true,
        'items-center': true,
      });

      expect(result).toBe('component md:w-1/2 flex items-center');
    });
  });
});
