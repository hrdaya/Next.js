import { describe, expect, test } from 'vitest';
import { padLeft } from '../../../utils/string';

describe('padLeft function', () => {
  describe('基本機能テスト', () => {
    test('数値の左パディング（基本的な使用例）', () => {
      expect(padLeft(5, '0', 3)).toBe('005');
      expect(padLeft(25, '0', 3)).toBe('025');
      expect(padLeft(125, '0', 3)).toBe('125');
    });

    test('デフォルトパラメータの動作', () => {
      expect(padLeft(5)).toBe('05'); // デフォルト：'0', length=2
      expect(padLeft(5, '0')).toBe('05'); // デフォルト：length=2
      expect(padLeft(9, ' ')).toBe(' 9'); // スペースパディング
    });

    test('ゼロパディング（最も一般的な使用例）', () => {
      expect(padLeft(1, '0', 2)).toBe('01');
      expect(padLeft(5, '0', 3)).toBe('005');
      expect(padLeft(42, '0', 4)).toBe('0042');
    });

    test('スペースパディング', () => {
      expect(padLeft(5, ' ', 3)).toBe('  5');
      expect(padLeft(25, ' ', 4)).toBe('  25');
      expect(padLeft(123, ' ', 5)).toBe('  123');
    });

    test('長さが同じ場合はそのまま返される', () => {
      expect(padLeft(123, '0', 3)).toBe('123');
      expect(padLeft(99, ' ', 2)).toBe('99');
    });

    test('元の値が指定長より長い場合はそのまま返される', () => {
      expect(padLeft(12345, '0', 3)).toBe('12345');
      expect(padLeft(9999, ' ', 2)).toBe('9999');
    });
  });

  describe('エッジケースと境界値テスト', () => {
    test('長さ0の指定', () => {
      expect(padLeft(5, '0', 0)).toBe('5');
      expect(padLeft(123, ' ', 0)).toBe('123');
    });

    test('長さ1の指定', () => {
      expect(padLeft(5, '0', 1)).toBe('5');
      expect(padLeft(99, '0', 1)).toBe('99'); // 元の値が長い
    });

    test('非常に大きな長さの指定', () => {
      const result = padLeft(5, '0', 100);
      expect(result).toHaveLength(100);
      expect(result.endsWith('5')).toBe(true);
      expect(result.slice(0, -1)).toBe('0'.repeat(99));
    });

    test('数値0の処理', () => {
      expect(padLeft(0, '0', 3)).toBe('000');
      expect(padLeft(0, ' ', 4)).toBe('   0');
    });

    test('負の数値の処理', () => {
      expect(padLeft(-5, '0', 4)).toBe('00-5');
      expect(padLeft(-123, ' ', 6)).toBe('  -123');
      expect(padLeft(-1, '0', 3)).toBe('0-1');
    });

    test('小数点を含む数値', () => {
      expect(padLeft(3.14, '0', 6)).toBe('003.14');
      expect(padLeft(0.5, ' ', 4)).toBe(' 0.5');
      expect(padLeft(99.99, '0', 7)).toBe('0099.99');
    });

    test('非常に大きな数値', () => {
      expect(padLeft(1e6, '0', 10)).toBe('0001000000');
      expect(padLeft(Number.MAX_SAFE_INTEGER, '0', 20)).toBe(
        '00009007199254740991'
      );
    });

    test('非常に小さな数値', () => {
      expect(padLeft(1e-6, '0', 10)).toBe('000.000001');
      expect(padLeft(Number.MIN_VALUE, '0', 25)).toBe(
        '00000000000000000005e-324'
      );
    });
  });

  describe('特殊な数値の処理', () => {
    test('Infinityの処理', () => {
      expect(padLeft(Number.POSITIVE_INFINITY, '0', 10)).toBe('00Infinity');
      expect(padLeft(Number.NEGATIVE_INFINITY, ' ', 12)).toBe('   -Infinity');
    });

    test('NaNの処理', () => {
      expect(padLeft(Number.NaN, '0', 5)).toBe('00NaN');
      expect(padLeft(Number.NaN, ' ', 6)).toBe('   NaN');
    });

    test('Number.MAX_VALUEとNumber.MIN_VALUEの処理', () => {
      const maxResult = padLeft(Number.MAX_VALUE, '0', 30);
      expect(maxResult).toContain('1.7976931348623157e+308');

      const minResult = padLeft(Number.MIN_VALUE, '0', 20);
      expect(minResult).toContain('5e-324');
    });
  });

  describe('型安全性の確認', () => {
    test('char引数の型制限', () => {
      // TypeScriptコンパイル時に以下は正しい型として受け入れられます
      expect(padLeft(42, '0', 5)).toBe('00042');
      expect(padLeft(42, ' ', 5)).toBe('   42');

      // 他の文字は型エラーになるため、実行時テストでは確認できません
      // これはコンパイル時の型チェックで保証されます
    });

    test('戻り値の型が常にstringであることを確認', () => {
      const result1 = padLeft(123, '0', 5);
      const result2 = padLeft(0, ' ', 3);
      const result3 = padLeft(-42, '0', 6);

      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
      expect(typeof result3).toBe('string');
    });
  });

  describe('実用例テスト', () => {
    test('日時のゼロパディング', () => {
      // 時刻表示用のパディング
      expect(padLeft(9, '0', 2)).toBe('09'); // 時間
      expect(padLeft(5, '0', 2)).toBe('05'); // 分
      expect(padLeft(3, '0', 2)).toBe('03'); // 秒

      // 日付表示用
      expect(padLeft(1, '0', 2)).toBe('01'); // 月
      expect(padLeft(7, '0', 2)).toBe('07'); // 日
    });

    test('IDや連番の整形', () => {
      expect(padLeft(42, '0', 6)).toBe('000042');
      expect(padLeft(1, '0', 8)).toBe('00000001');
      expect(padLeft(999, '0', 4)).toBe('0999');
    });

    test('数値の表示幅統一', () => {
      const numbers = [1, 22, 333, 4444];
      const formatted = numbers.map((n) => padLeft(n, ' ', 6));

      expect(formatted).toEqual(['     1', '    22', '   333', '  4444']);

      // すべて同じ長さになっていることを確認
      for (const str of formatted) {
        expect(str).toHaveLength(6);
      }
    });

    test('プログレスバーの数値表示', () => {
      for (let i = 0; i <= 100; i += 10) {
        const formatted = padLeft(i, ' ', 3);
        expect(formatted).toMatch(/^\s*\d+$/);
        expect(formatted).toHaveLength(3);
      }
    });

    test('ファイル名の連番生成', () => {
      const fileNumbers = [1, 15, 99, 256];
      const fileNames = fileNumbers.map(
        (n) => `file_${padLeft(n, '0', 4)}.txt`
      );

      expect(fileNames).toEqual([
        'file_0001.txt',
        'file_0015.txt',
        'file_0099.txt',
        'file_0256.txt',
      ]);
    });

    test('表形式データの列幅調整', () => {
      const data = [
        { id: 1, score: 95 },
        { id: 42, score: 87 },
        { id: 123, score: 91 },
      ];

      const formattedData = data.map((item) => ({
        id: padLeft(item.id, ' ', 4),
        score: padLeft(item.score, ' ', 3),
      }));

      expect(formattedData[0].id).toBe('   1');
      expect(formattedData[1].id).toBe('  42');
      expect(formattedData[2].id).toBe(' 123');
      expect(formattedData[0].score).toBe(' 95');
    });
  });

  describe('統合テストとチェーン操作', () => {
    test('配列操作との組み合わせ', () => {
      const numbers = [1, 2, 3, 4, 5];
      const paddedNumbers = numbers.map((n) => padLeft(n, '0', 3)).join(', ');

      expect(paddedNumbers).toBe('001, 002, 003, 004, 005');
    });

    test('条件分岐での使用', () => {
      const formatNumber = (num: number) => {
        if (num < 10) {
          return padLeft(num, '0', 2);
        }
        if (num < 100) {
          return padLeft(num, '0', 3);
        }
        return padLeft(num, '0', 4);
      };

      expect(formatNumber(5)).toBe('05');
      expect(formatNumber(50)).toBe('050');
      expect(formatNumber(500)).toBe('0500');
    });

    test('reduce操作での使用', () => {
      const numbers = [1, 23, 456];
      const result = numbers.reduce((acc, num) => {
        return `${acc}${padLeft(num, '0', 4)}\n`;
      }, '');

      expect(result).toBe('0001\n0023\n0456\n');
    });
  });

  describe('エラー処理と堅牢性', () => {
    test('極端な値での動作確認', () => {
      // 非常に大きな数値
      expect(() => padLeft(1e308, '0', 5)).not.toThrow();

      // 非常に小さな数値
      expect(() => padLeft(1e-308, '0', 5)).not.toThrow();

      // 特殊な数値
      expect(() => padLeft(Number.POSITIVE_INFINITY, '0', 5)).not.toThrow();
      expect(() => padLeft(Number.NEGATIVE_INFINITY, ' ', 5)).not.toThrow();
      expect(() => padLeft(Number.NaN, '0', 5)).not.toThrow();
    });

    test('大きなlength値での動作', () => {
      // メモリ制限内での大きな値
      const result = padLeft(42, '0', 1000);
      expect(result).toHaveLength(1000);
      expect(result.endsWith('42')).toBe(true);
    });

    test('関数の純粋性確認', () => {
      const testValue = 42;
      const result1 = padLeft(testValue, '0', 5);
      const result2 = padLeft(testValue, '0', 5);

      // 同じ入力に対して同じ出力が得られることを確認
      expect(result1).toBe(result2);
      expect(result1).toBe('00042');
    });
  });

  describe('文字列化の動作確認', () => {
    test('数値から文字列への変換', () => {
      // 整数
      expect(padLeft(42, '0', 5)).toBe('00042');

      // 浮動小数点数
      const pi = Math.PI;
      expect(padLeft(pi, '0', 20)).toBe('0003.141592653589793');

      // 指数表記
      expect(padLeft(1e5, '0', 8)).toBe('00100000');
      expect(padLeft(1e-5, '0', 10)).toBe('0000.00001');
    });

    test('負の数値の文字列化', () => {
      expect(padLeft(-42, '0', 6)).toBe('000-42');
      expect(padLeft(-3.14, ' ', 8)).toBe('   -3.14');
    });

    test('ゼロの様々な表現', () => {
      expect(padLeft(0, '0', 3)).toBe('000');
      expect(padLeft(-0, '0', 3)).toBe('000');
      expect(padLeft(0.0, '0', 3)).toBe('000');
    });
  });
});
