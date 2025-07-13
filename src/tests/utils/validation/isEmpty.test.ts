import { describe, expect, it } from 'vitest';
import { isEmpty } from '../../../utils/validation';

/**
 * isEmpty関数の包括的テスト
 *
 * 値の空判定機能をテストします。
 * 基本機能、エッジケース、パフォーマンスをすべて含みます。
 */
describe('isEmpty関数', () => {
  // 基本機能テスト
  describe('基本機能', () => {
    it('空の値でtrueを返す', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('空でない値でfalseを返す', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty('0')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });

    it('数値の0でfalseを返す', () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(-0)).toBe(false);
      expect(isEmpty(0.0)).toBe(false);
    });

    it('boolean値でfalseを返す', () => {
      expect(isEmpty(true)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    it('様々なタイプの空白文字を正しく判定する', () => {
      expect(isEmpty(' ')).toBe(true); // 半角スペース
      expect(isEmpty('　')).toBe(true); // 全角スペース
      expect(isEmpty('\t')).toBe(true); // タブ
      expect(isEmpty('\n')).toBe(true); // 改行
      expect(isEmpty('\r')).toBe(true); // キャリッジリターン
      expect(isEmpty(' \t\n\r ')).toBe(true); // 複数の空白文字
    });

    it('特殊な数値を正しく判定する', () => {
      expect(isEmpty(Number.NaN)).toBe(false); // NaN は空でない
      expect(isEmpty(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isEmpty(Number.NEGATIVE_INFINITY)).toBe(false);
    });

    it('空のコレクションを正しく判定する', () => {
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty(new Array())).toBe(true);
      expect(isEmpty(new Object())).toBe(true);
    });

    it('空でないコレクションを正しく判定する', () => {
      expect(isEmpty([undefined])).toBe(false); // undefined を含む配列
      expect(isEmpty([null])).toBe(false); // null を含む配列
      expect(isEmpty([false])).toBe(false); // false を含む配列
      expect(isEmpty([0])).toBe(false); // 0 を含む配列
      expect(isEmpty([''])).toBe(false); // 空文字列を含む配列
    });

    it('オブジェクトのプロパティを正しく判定する', () => {
      expect(isEmpty({ undefined: undefined })).toBe(false);
      expect(isEmpty({ null: null })).toBe(false);
      expect(isEmpty({ false: false })).toBe(false);
      expect(isEmpty({ zero: 0 })).toBe(false);
      expect(isEmpty({ empty: '' })).toBe(false);
    });

    it('プロトタイプを持つオブジェクトを正しく判定する', () => {
      class CustomClass {
        prop?: string;
      }
      const instance = new CustomClass();
      expect(isEmpty(instance)).toBe(true); // 独自プロパティなし

      instance.prop = 'value';
      expect(isEmpty(instance)).toBe(false); // 独自プロパティあり
    });

    it('ネストしたオブジェクトや配列を正しく判定する', () => {
      expect(isEmpty({ nested: {} })).toBe(false); // 空オブジェクトを含む
      expect(isEmpty({ nested: [] })).toBe(false); // 空配列を含む
      expect(isEmpty([{}])).toBe(false); // 空オブジェクトを含む配列
      expect(isEmpty([[]])).toBe(false); // 空配列を含む配列
    });
  });

  // 型別テスト
  describe('型別テスト', () => {
    it('文字列型の判定', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty(' ')).toBe(true);
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty('0')).toBe(false);
      expect(isEmpty('false')).toBe(false);
    });

    it('数値型の判定', () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(1)).toBe(false);
      expect(isEmpty(-1)).toBe(false);
      expect(isEmpty(0.1)).toBe(false);
      expect(isEmpty(Number.NaN)).toBe(false);
    });

    it('boolean型の判定', () => {
      expect(isEmpty(true)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });

    it('配列型の判定', () => {
      expect(isEmpty([])).toBe(true);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty([undefined])).toBe(false);
      expect(isEmpty([null])).toBe(false);
    });

    it('オブジェクト型の判定', () => {
      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty({ a: undefined })).toBe(false);
      expect(isEmpty({ a: null })).toBe(false);
    });

    it('関数型の判定', () => {
      expect(isEmpty(() => {})).toBe(false);
      expect(isEmpty(() => undefined)).toBe(false);
      expect(isEmpty(console.log)).toBe(false);
    });

    it('Date型の判定', () => {
      expect(isEmpty(new Date())).toBe(false);
      // Invalid Dateもオブジェクトとしてプロパティを持つため空ではない
      const invalidDate = new Date('invalid');
      expect(isEmpty(invalidDate)).toBe(false);
    });

    it('RegExp型の判定', () => {
      expect(isEmpty(/pattern/)).toBe(false);
      expect(isEmpty(/test/gi)).toBe(false);
    });
  });

  // 型安全性テスト
  describe('型安全性', () => {
    it('TypeScriptの型チェックで正しい型が受け入れられる', () => {
      expect(() => {
        isEmpty('string');
        isEmpty(123);
        isEmpty(true);
        isEmpty([]);
        isEmpty({});
        isEmpty(null);
        isEmpty(undefined);
      }).not.toThrow();
    });

    it('実行時エラーが発生しない', () => {
      expect(() => {
        isEmpty(undefined);
        isEmpty(null);
        isEmpty('');
        isEmpty(0);
        isEmpty(false);
        isEmpty([]);
        isEmpty({});
      }).not.toThrow();
    });
  });

  // 実世界のユースケーステスト
  describe('実世界のユースケース', () => {
    it('フォーム入力の検証で正しく動作する', () => {
      // 未入力フィールド
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);

      // 入力されたフィールド
      expect(isEmpty('user input')).toBe(false);
      expect(isEmpty('0')).toBe(false); // 文字列の0は入力あり
    });

    it('APIレスポンスの検証で正しく動作する', () => {
      // 空のレスポンス
      expect(isEmpty({})).toBe(true);
      expect(isEmpty([])).toBe(true);

      // データありのレスポンス
      expect(isEmpty({ data: [] })).toBe(false); // 空配列を含むが構造はある
      expect(isEmpty([{ id: 1 }])).toBe(false);
    });

    it('設定オブジェクトの検証で正しく動作する', () => {
      // デフォルト設定（空）
      expect(isEmpty({})).toBe(true);

      // カスタム設定
      expect(isEmpty({ theme: 'dark' })).toBe(false);
      expect(isEmpty({ debug: false })).toBe(false); // false値も設定
    });

    it('検索結果の検証で正しく動作する', () => {
      // 検索結果なし
      expect(isEmpty([])).toBe(true);
      expect(isEmpty('')).toBe(true);

      // 検索結果あり
      expect(isEmpty(['result1', 'result2'])).toBe(false);
      expect(isEmpty('search term')).toBe(false);
    });
  });
});
