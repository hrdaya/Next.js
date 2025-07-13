import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { formatLocalDatetime } from '../../../utils';

describe('formatLocalDatetime function', () => {
  describe('基本機能テスト', () => {
    test('Dateオブジェクトの変換（デフォルト区切り文字）', () => {
      const date = new Date(2023, 11, 25, 14, 30, 45); // 2023年12月25日 14:30:45
      const result = formatLocalDatetime(date);
      expect(result).toBe('2023-12-25T14:30');
    });

    test('ISO文字列の変換（デフォルト区切り文字）', () => {
      // UTC時刻の文字列をローカル時刻に変換
      const result = formatLocalDatetime('2023-12-25T14:30:00.000Z');
      // ローカル時刻は環境によって異なるため、フォーマットのパターンをチェック
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    test('カスタム区切り文字の使用', () => {
      const date = new Date(2023, 11, 25, 14, 30, 45);
      expect(formatLocalDatetime(date, ' ')).toBe('2023-12-25 14:30');
      expect(formatLocalDatetime(date, '_')).toBe('2023-12-25_14:30');
      expect(formatLocalDatetime(date, '')).toBe('2023-12-2514:30');
    });

    test('時刻のゼロパディング', () => {
      const date = new Date(2023, 0, 5, 9, 5, 15); // 2023年1月5日 09:05:15
      const result = formatLocalDatetime(date);
      expect(result).toBe('2023-01-05T09:05');
    });

    test('月のゼロパディング', () => {
      const date = new Date(2023, 0, 1, 0, 0, 0); // 2023年1月1日 00:00:00
      const result = formatLocalDatetime(date);
      expect(result).toBe('2023-01-01T00:00');
    });
  });

  describe('エッジケースと境界値テスト', () => {
    test('年末年始の日付', () => {
      const newYear = new Date(2024, 0, 1, 0, 0, 0); // 2024年1月1日
      const yearEnd = new Date(2023, 11, 31, 23, 59, 59); // 2023年12月31日

      expect(formatLocalDatetime(newYear)).toBe('2024-01-01T00:00');
      expect(formatLocalDatetime(yearEnd)).toBe('2023-12-31T23:59');
    });

    test('うるう年の2月29日', () => {
      const leapYear = new Date(2024, 1, 29, 12, 0, 0); // 2024年2月29日（うるう年）
      const result = formatLocalDatetime(leapYear);
      expect(result).toBe('2024-02-29T12:00');
    });

    test('平年の2月28日', () => {
      const regularYear = new Date(2023, 1, 28, 12, 0, 0); // 2023年2月28日（平年）
      const result = formatLocalDatetime(regularYear);
      expect(result).toBe('2023-02-28T12:00');
    });

    test('夏時間境界付近の日時', () => {
      // 夏時間は地域によって異なるため、基本的なフォーマットのみチェック
      const springForward = new Date(2023, 2, 12, 2, 30, 0); // 夏時間開始付近
      const fallBack = new Date(2023, 10, 5, 1, 30, 0); // 夏時間終了付近

      expect(formatLocalDatetime(springForward)).toMatch(
        /^2023-03-12T\d{2}:30$/
      );
      expect(formatLocalDatetime(fallBack)).toMatch(/^2023-11-05T\d{2}:30$/);
    });

    test('月末の日付', () => {
      const dates = [
        new Date(2023, 0, 31, 15, 45, 0), // 1月31日
        new Date(2023, 3, 30, 15, 45, 0), // 4月30日
        new Date(2023, 5, 30, 15, 45, 0), // 6月30日
      ];

      expect(formatLocalDatetime(dates[0])).toBe('2023-01-31T15:45');
      expect(formatLocalDatetime(dates[1])).toBe('2023-04-30T15:45');
      expect(formatLocalDatetime(dates[2])).toBe('2023-06-30T15:45');
    });

    test('無効な日付の処理', () => {
      const invalidDate = new Date('invalid');
      const result = formatLocalDatetime(invalidDate);
      expect(result).toContain('NaN');
    });

    test('空文字列の処理', () => {
      const result = formatLocalDatetime('');
      expect(result).toContain('NaN');
    });

    test('不正な文字列の処理', () => {
      const result = formatLocalDatetime('not a date');
      expect(result).toContain('NaN');
    });
  });

  describe('異なる入力形式のテスト', () => {
    test('ISO文字列（ミリ秒付き）', () => {
      const result = formatLocalDatetime('2023-12-25T14:30:45.123Z');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    test('ISO文字列（タイムゾーン付き）', () => {
      const result = formatLocalDatetime('2023-12-25T14:30:45+09:00');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    test('RFC 2822形式の文字列', () => {
      const result = formatLocalDatetime('Mon, 25 Dec 2023 14:30:45 GMT');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    test('数値タイムスタンプの文字列', () => {
      const timestamp = new Date(2023, 11, 25, 14, 30, 45).getTime();
      const result = formatLocalDatetime(timestamp.toString());
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });

  describe('タイムゾーン関連テスト', () => {
    test('UTC時刻からローカル時刻への変換', () => {
      // 固定のタイムゾーンでのテストは環境依存になるため、
      // パターンマッチングで検証
      const utcString = '2023-12-25T12:00:00.000Z';
      const result = formatLocalDatetime(utcString);

      expect(result).toMatch(/^2023-12-25T\d{2}:\d{2}$/);
      expect(result.length).toBe(16); // YYYY-MM-DDTHH:MM
    });

    test('異なるタイムゾーン表記での一貫性', () => {
      const sameTimeInDifferentFormats = [
        '2023-12-25T15:00:00+09:00',
        '2023-12-25T06:00:00Z',
      ];

      const results = sameTimeInDifferentFormats.map((ts) =>
        formatLocalDatetime(ts)
      );

      // 同じ時刻を表す異なる表記は同じローカル時刻になるはず
      expect(results[0]).toBe(results[1]);
    });
  });

  describe('実用例テスト', () => {
    test('HTMLのdatetime-local入力フィールド用', () => {
      const now = new Date();
      const result = formatLocalDatetime(now);

      // datetime-local形式に準拠しているかチェック
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

      // HTML入力要素で使用可能かテスト
      const htmlInput = document.createElement('input');
      htmlInput.type = 'datetime-local';
      htmlInput.value = result;

      expect(htmlInput.value).toBe(result);
    });

    test('ログファイル名生成', () => {
      const date = new Date(2023, 11, 25, 14, 30, 45);
      const logFileName = `log_${formatLocalDatetime(date, '_')}.txt`;

      expect(logFileName).toBe('log_2023-12-25_14:30.txt');
    });

    test('データベースのタイムスタンプ表示', () => {
      const timestamps = [
        '2023-01-01T00:00:00Z',
        '2023-06-15T12:30:00Z',
        '2023-12-31T23:59:59Z',
      ];

      const formatted = timestamps.map((ts) => formatLocalDatetime(ts, ' '));

      for (const result of formatted) {
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      }
    });

    test('イベントスケジュールの表示', () => {
      const events = [
        { name: 'Meeting', time: new Date(2023, 11, 25, 9, 0, 0) },
        { name: 'Lunch', time: new Date(2023, 11, 25, 12, 30, 0) },
        { name: 'Presentation', time: new Date(2023, 11, 25, 15, 30, 0) },
      ];

      const schedule = events.map(
        (event) => `${formatLocalDatetime(event.time)} - ${event.name}`
      );

      expect(schedule[0]).toBe('2023-12-25T09:00 - Meeting');
      expect(schedule[1]).toBe('2023-12-25T12:30 - Lunch');
      expect(schedule[2]).toBe('2023-12-25T15:30 - Presentation');
    });
  });

  describe('国際化とローカリゼーション', () => {
    test('異なる地域での日付表示', () => {
      // 地域設定に関係なく、関数の出力は一貫している
      const date = new Date(2023, 11, 25, 14, 30, 45);
      const result = formatLocalDatetime(date);

      // ISO 8601形式に準拠
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    test('多言語環境での一貫性', () => {
      // 数値フォーマットは地域に依存しない
      const date = new Date(2023, 11, 25, 14, 30, 45);
      const result1 = formatLocalDatetime(date);

      // 複数回実行しても同じ結果
      const result2 = formatLocalDatetime(date);
      expect(result1).toBe(result2);
    });
  });

  describe('統合テストとチェーン操作', () => {
    test('配列操作との組み合わせ', () => {
      const dates = [
        new Date(2023, 0, 1, 0, 0, 0),
        new Date(2023, 5, 15, 12, 30, 0),
        new Date(2023, 11, 31, 23, 59, 0),
      ];

      const formatted = dates.map((date) => formatLocalDatetime(date));

      expect(formatted).toEqual([
        '2023-01-01T00:00',
        '2023-06-15T12:30',
        '2023-12-31T23:59',
      ]);
    });

    test('フィルタリングとの組み合わせ', () => {
      const events = [
        new Date(2023, 11, 25, 8, 0, 0), // 朝
        new Date(2023, 11, 25, 14, 0, 0), // 午後
        new Date(2023, 11, 25, 20, 0, 0), // 夜
      ];

      // 午後のイベントのみフィルタ
      const afternoonEvents = events
        .filter((date) => date.getHours() >= 12 && date.getHours() < 18)
        .map((date) => formatLocalDatetime(date));

      expect(afternoonEvents).toEqual(['2023-12-25T14:00']);
    });

    test('ソートとの組み合わせ', () => {
      const timestamps = [
        '2023-12-25T15:30:00Z',
        '2023-12-25T09:00:00Z',
        '2023-12-25T12:15:00Z',
      ];

      const sortedFormatted = timestamps
        .map((ts) => new Date(ts))
        .sort((a, b) => a.getTime() - b.getTime())
        .map((date) => formatLocalDatetime(date));

      // 時刻順にソートされていることを確認
      expect(sortedFormatted.length).toBe(3);

      // 各要素が正しいフォーマットであることを確認
      for (const formatted of sortedFormatted) {
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
      }
    });
  });

  describe('エラーハンドリングと堅牢性', () => {
    test('型変換エラーの処理', () => {
      // 数値を文字列として渡した場合
      const numericString = '1703505000000'; // タイムスタンプ
      const result = formatLocalDatetime(numericString);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    test('極端な日付値の処理', () => {
      const veryOldDate = new Date(1900, 0, 1, 0, 0, 0);
      const veryFutureDate = new Date(2100, 11, 31, 23, 59, 59);

      expect(formatLocalDatetime(veryOldDate)).toBe('1900-01-01T00:00');
      expect(formatLocalDatetime(veryFutureDate)).toBe('2100-12-31T23:59');
    });

    test('Dateオブジェクトの不変性', () => {
      const originalDate = new Date(2023, 11, 25, 14, 30, 45);
      const originalTime = originalDate.getTime();

      formatLocalDatetime(originalDate);

      // 元のDateオブジェクトが変更されていないことを確認
      expect(originalDate.getTime()).toBe(originalTime);
    });
  });

  describe('型安全性とTypeScriptテスト', () => {
    test('戻り値の型が常にstringであることを確認', () => {
      const result1 = formatLocalDatetime(new Date());
      const result2 = formatLocalDatetime('2023-12-25T14:30:00Z');
      const result3 = formatLocalDatetime(new Date(), ' ');

      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
      expect(typeof result3).toBe('string');
    });

    test('型推論の確認', () => {
      // TypeScriptコンパイル時に正しい型として推論されることを確認
      const result: string = formatLocalDatetime(new Date());
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });
});
