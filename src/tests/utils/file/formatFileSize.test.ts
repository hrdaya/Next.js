import { describe, expect, it } from 'vitest';
import { formatFileSize } from '../../../utils/file';

/**
 * formatFileSize関数の包括的テスト
 *
 * ファイルサイズのフォーマット機能をテストします。
 * 基本機能、エッジケース、パフォーマンスをすべて含みます。
 */
describe('formatFileSize関数', () => {
  // 基本機能テスト
  describe('基本機能', () => {
    it('バイト単位を正しくフォーマットする', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1)).toBe('1 Bytes');
      expect(formatFileSize(512)).toBe('512 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('KB単位を正しくフォーマットする', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
      expect(formatFileSize(2048)).toBe('2.00 KB');
      expect(formatFileSize(1048575)).toBe('1024.00 KB');
    });

    it('MB単位を正しくフォーマットする', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB'); // 1024 * 1024
      expect(formatFileSize(1572864)).toBe('1.50 MB'); // 1.5 MB
      expect(formatFileSize(5242880)).toBe('5.00 MB'); // 5 MB
    });

    it('GB単位を正しくフォーマットする', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB'); // 1024^3
      expect(formatFileSize(2147483648)).toBe('2.00 GB'); // 2 GB
      expect(formatFileSize(5368709120)).toBe('5.00 GB'); // 5 GB
    });

    it('TB単位を正しくフォーマットする', () => {
      expect(formatFileSize(1099511627776)).toBe('1.00 TB'); // 1024^4
      expect(formatFileSize(2199023255552)).toBe('2.00 TB'); // 2 TB
    });
  });

  // 小数点桁数のテスト
  describe('小数点桁数オプション', () => {
    it('デフォルト（2桁）で正しくフォーマットする', () => {
      expect(formatFileSize(1536)).toBe('1.50 KB');
      expect(formatFileSize(1587.2)).toBe('1.55 KB');
    });

    it('小数点0桁で正しくフォーマットする', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1024, 0)).toBe('1 KB');
      expect(formatFileSize(1587.2, 0)).toBe('2 KB');
    });

    it('小数点1桁で正しくフォーマットする', () => {
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(formatFileSize(1587.2, 1)).toBe('1.6 KB');
    });

    it('小数点3桁で正しくフォーマットする', () => {
      expect(formatFileSize(1536, 3)).toBe('1.500 KB');
      expect(formatFileSize(1587.2, 3)).toBe('1.550 KB');
    });

    it('小数点4桁で正しくフォーマットする', () => {
      expect(formatFileSize(1587.2, 4)).toBe('1.5500 KB');
      expect(formatFileSize(1536.7, 4)).toBe('1.5007 KB');
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    it('0バイトを正しく処理する', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(0, 0)).toBe('0 Bytes');
      expect(formatFileSize(0, 5)).toBe('0 Bytes');
    });

    it('1バイト未満の小数値を正しく処理する', () => {
      expect(formatFileSize(0.5)).toBe('1 Bytes');
      expect(formatFileSize(0.1)).toBe('0 Bytes');
      expect(formatFileSize(0.9)).toBe('1 Bytes');
    });

    it('非常に大きなサイズを正しく処理する', () => {
      const petabyte = 1024 ** 5;
      expect(formatFileSize(petabyte)).toBe('1.00 PB'); // PBが正しい

      const exabyte = 1024 ** 6;
      expect(formatFileSize(exabyte)).toBe('1.00 EB'); // EBが正しい
    });

    it('負の値に対して適切に処理する', () => {
      expect(formatFileSize(-1024)).toBe('-1.00 KB');
      expect(formatFileSize(-1048576)).toBe('-1.00 MB');
      expect(formatFileSize(-512)).toBe('-512 Bytes');
    });

    it('小数点桁数が負の場合の処理', () => {
      expect(formatFileSize(1536, -1)).toBe('1.50 KB'); // デフォルトにフォールバック
      expect(formatFileSize(1536, -5)).toBe('1.50 KB');
    });

    it('小数点桁数が異常に大きい場合の処理', () => {
      expect(formatFileSize(1536, 100)).toBe('1.50 KB'); // 実装で制限される
    });
  });

  // 境界値テスト
  describe('境界値テスト', () => {
    it('単位変換の境界値を正しく処理する', () => {
      // Bytes → KB の境界
      expect(formatFileSize(1023)).toBe('1023 Bytes');
      expect(formatFileSize(1024)).toBe('1.00 KB');

      // KB → MB の境界
      expect(formatFileSize(1048575)).toBe('1024.00 KB'); // 1024 * 1024 - 1
      expect(formatFileSize(1048576)).toBe('1.00 MB'); // 1024 * 1024

      // MB → GB の境界
      expect(formatFileSize(1073741823)).toBe('1024.00 MB'); // 1024^3 - 1
      expect(formatFileSize(1073741824)).toBe('1.00 GB'); // 1024^3

      // GB → TB の境界
      expect(formatFileSize(1099511627775)).toBe('1024.00 GB'); // 1024^4 - 1
      expect(formatFileSize(1099511627776)).toBe('1.00 TB'); // 1024^4
    });

    it('最大・最小安全整数を処理する', () => {
      const maxSafeInt = Number.MAX_SAFE_INTEGER;
      const result = formatFileSize(maxSafeInt);
      expect(result).toContain('PB'); // 非常に大きなPB値
      expect(result).toMatch(/^\d+\.\d{2} PB$/);

      const minSafeInt = Number.MIN_SAFE_INTEGER;
      const negativeResult = formatFileSize(minSafeInt);
      expect(negativeResult).toContain('-');
      expect(negativeResult).toContain('PB');
    });
  });

  // 実世界のユースケーステスト
  describe('実世界のユースケース', () => {
    it('一般的なファイルサイズを正しくフォーマットする', () => {
      // 文書ファイル
      expect(formatFileSize(50000)).toBe('48.83 KB'); // 50KB程度のテキストファイル
      expect(formatFileSize(2097152)).toBe('2.00 MB'); // 2MBのPDFファイル

      // 画像ファイル
      expect(formatFileSize(204800)).toBe('200.00 KB'); // 200KBのJPEG
      expect(formatFileSize(5242880)).toBe('5.00 MB'); // 5MBの高解像度画像

      // 動画ファイル
      expect(formatFileSize(104857600)).toBe('100.00 MB'); // 100MBの動画
      expect(formatFileSize(2147483648)).toBe('2.00 GB'); // 2GBの長時間動画
    });

    it('ダウンロード進行状況の表示に適している', () => {
      const totalSize = 10485760; // 10MB
      const downloadedSizes = [0, 1048576, 5242880, 10485760]; // 0%, 10%, 50%, 100%

      const formatted = downloadedSizes.map((size) => formatFileSize(size));
      expect(formatted).toEqual(['0 Bytes', '1.00 MB', '5.00 MB', '10.00 MB']);
    });

    it('ストレージ容量の表示に適している', () => {
      // デバイスストレージ
      expect(formatFileSize(8589934592)).toBe('8.00 GB'); // 8GB RAM
      expect(formatFileSize(256000000000)).toBe('238.42 GB'); // 256GB SSD
      expect(formatFileSize(1000000000000)).toBe('931.32 GB'); // 1TB HDD
    });

    it('ファイルマネージャーでの表示に適している', () => {
      // 様々なファイルサイズの混在
      const fileSizes = [
        0, // 空ファイル
        1024, // 1KB設定ファイル
        51200, // 50KBドキュメント
        2097152, // 2MB画像
        52428800, // 50MB動画
        1073741824, // 1GBアーカイブ
      ];

      const formatted = fileSizes.map((size) => formatFileSize(size));
      expect(formatted).toEqual([
        '0 Bytes',
        '1.00 KB',
        '50.00 KB',
        '2.00 MB',
        '50.00 MB',
        '1.00 GB',
      ]);
    });
  });
});
