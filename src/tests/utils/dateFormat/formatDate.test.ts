import { describe, expect, test } from 'vitest';
import { formatDate } from '../../../utils';

describe('formatDate', () => {
  describe('基本機能', () => {
    test('Dateオブジェクトの変換（デフォルト区切り）', () => {
      const date = new Date(2023, 11, 25, 14, 30, 45); // 2023年12月25日
      expect(formatDate(date)).toBe('2023/12/25');
    });
    test('ISO文字列の変換（デフォルト区切り）', () => {
      const result = formatDate('2023-12-25T14:30:00.000Z');
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });
    test('カスタム区切り文字', () => {
      const date = new Date(2023, 11, 25);
      expect(formatDate(date, '-')).toBe('2023-12-25');
      expect(formatDate(date, '.')).toBe('2023.12.25');
      expect(formatDate(date, '年')).toBe('2023年12年25');
    });
    test('月・日が1桁の場合のゼロパディング', () => {
      const date = new Date(2023, 0, 5); // 2023年1月5日
      expect(formatDate(date)).toBe('2023/01/05');
    });
  });

  describe('エッジケース', () => {
    test('年末年始', () => {
      expect(formatDate(new Date(2024, 0, 1))).toBe('2024/01/01');
      expect(formatDate(new Date(2023, 11, 31))).toBe('2023/12/31');
    });
    test('うるう年2月29日', () => {
      expect(formatDate(new Date(2024, 1, 29))).toBe('2024/02/29');
    });
    test('平年2月28日', () => {
      expect(formatDate(new Date(2023, 1, 28))).toBe('2023/02/28');
    });
    test('月末', () => {
      expect(formatDate(new Date(2023, 3, 30))).toBe('2023/04/30');
      expect(formatDate(new Date(2023, 5, 30))).toBe('2023/06/30');
    });
    test('無効な日付', () => {
      const invalid = new Date('invalid');
      expect(formatDate(invalid)).toContain('NaN');
    });
    test('空文字列', () => {
      expect(formatDate('')).toContain('NaN');
    });
    test('不正な文字列', () => {
      expect(formatDate('not a date')).toContain('NaN');
    });
  });

  describe('異なる入力形式', () => {
    test('ISO文字列（ミリ秒付き）', () => {
      expect(formatDate('2023-12-25T14:30:45.123Z')).toMatch(
        /^\d{4}\/\d{2}\/\d{2}$/
      );
    });
    test('ISO文字列（タイムゾーン付き）', () => {
      expect(formatDate('2023-12-25T14:30:45+09:00')).toMatch(
        /^\d{4}\/\d{2}\/\d{2}$/
      );
    });
    test('RFC 2822形式', () => {
      expect(formatDate('Mon, 25 Dec 2023 14:30:45 GMT')).toMatch(
        /^\d{4}\/\d{2}\/\d{2}$/
      );
    });
    test('数値タイムスタンプの文字列', () => {
      const ts = new Date(2023, 11, 25).getTime();
      expect(formatDate(ts.toString())).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });
  });

  describe('パフォーマンス', () => {
    test('大量変換の性能', () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        formatDate(new Date(2023, i % 12, (i % 28) + 1));
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(5000);
    });
  });

  describe('実用例', () => {
    test('ファイル名生成', () => {
      const date = new Date(2023, 11, 25);
      const fileName = `backup_${formatDate(date, '-')}.zip`;
      expect(fileName).toBe('backup_2023-12-25.zip');
    });
    test('日付ラベル', () => {
      const date = new Date(2025, 6, 13); // 2025年7月13日
      expect(formatDate(date)).toBe('2025/07/13');
    });
    test('配列操作', () => {
      const dates = [
        new Date(2023, 0, 1),
        new Date(2023, 5, 15),
        new Date(2023, 11, 31),
      ];
      const formatted = dates.map((date) => formatDate(date));
      expect(formatted).toEqual(['2023/01/01', '2023/06/15', '2023/12/31']);
    });
  });

  describe('型安全性', () => {
    test('戻り値の型がstring', () => {
      const result: string = formatDate(new Date());
      expect(typeof result).toBe('string');
    });
  });
});
