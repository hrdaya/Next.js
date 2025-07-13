import { afterEach, describe, expect, test, vi } from 'vitest';
import { readFileAsText } from '../../../utils/file';

// FileReaderのモック
const mockFileReader = {
  readAsText: vi.fn(),
  onload: vi.fn(),
  onerror: vi.fn(),
  onabort: vi.fn(),
  result: '',
};

vi.stubGlobal(
  'FileReader',
  vi.fn(() => mockFileReader)
);

describe('readFileAsText', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockFileReader.result = '';
  });

  describe('基本機能テスト', () => {
    test('FileオブジェクトをUTF-8テキストとして正しく読み込める', async () => {
      const content = 'Hello, World!';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const promise = readFileAsText(file);

      // readAsTextが呼ばれたことを確認
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(file, 'UTF-8');

      // onloadをシミュレート
      mockFileReader.result = content;
      mockFileReader.onload({} as ProgressEvent<FileReader>);

      await expect(promise).resolves.toBe(content);
    });

    test('BlobをFileに変換してテキストとして読み込める', async () => {
      const content = 'こんにちは、世界！';
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'test.txt', { type: blob.type });
      const promise = readFileAsText(file);

      expect(mockFileReader.readAsText).toHaveBeenCalledWith(file, 'UTF-8');

      mockFileReader.result = content;
      mockFileReader.onload({} as ProgressEvent<FileReader>);

      await expect(promise).resolves.toBe(content);
    });
  });

  describe('エラーハンドリング', () => {
    test('読み込みエラー時にPromiseがrejectされる', async () => {
      const file = new File([''], 'error.txt');
      const promise = readFileAsText(file);
      const errorEvent = new ProgressEvent('error');

      // onerrorをシミュレート
      mockFileReader.onerror(errorEvent);

      await expect(promise).rejects.toBe(errorEvent);
    });

    test('読み込み中断時にPromiseがrejectされる', async () => {
      const file = new File([''], 'abort.txt');
      const promise = readFileAsText(file);
      const abortEvent = new ProgressEvent('abort');

      // onabortをシミュレート
      mockFileReader.onabort(abortEvent);

      await expect(promise).rejects.toBe(abortEvent);
    });
  });

  describe('エッジケース', () => {
    test('空のファイルを読み込むと空文字列が返る', async () => {
      const file = new File([], 'empty.txt');
      const promise = readFileAsText(file);

      mockFileReader.result = '';
      mockFileReader.onload({} as ProgressEvent<FileReader>);

      await expect(promise).resolves.toBe('');
    });
  });
});
