import { afterEach, describe, expect, test, vi } from 'vitest';
import { readFileAsDataUrl } from '../../../utils/file';

// FileReaderのモック
const mockFileReader = {
  readAsDataURL: vi.fn(),
  onload: vi.fn(),
  onerror: vi.fn(),
  onabort: vi.fn(),
  result: '',
};

vi.stubGlobal(
  'FileReader',
  vi.fn(() => mockFileReader)
);

describe('readFileAsDataURL', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockFileReader.result = '';
  });

  describe('基本機能テスト', () => {
    test('FileオブジェクトをData URLとして正しく読み込める', async () => {
      const content = 'some binary data';
      const file = new File([content], 'test.bin', {
        type: 'application/octet-stream',
      });
      const promise = readFileAsDataUrl(file);
      const expectedDataURL = `data:${file.type};base64,${btoa(content)}`;

      // readAsDataURLが呼ばれたことを確認
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);

      // onloadをシミュレート
      mockFileReader.result = expectedDataURL;
      mockFileReader.onload({} as ProgressEvent<FileReader>);

      await expect(promise).resolves.toBe(expectedDataURL);
    });

    test('BlobをFileに変換してData URLとして読み込める', async () => {
      const content = '{"key":"value"}';
      const blob = new Blob([content], { type: 'application/json' });
      const file = new File([blob], 'data.json', { type: blob.type });
      const promise = readFileAsDataUrl(file);
      const expectedDataURL = `data:${file.type};base64,${btoa(content)}`;

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);

      mockFileReader.result = expectedDataURL;
      mockFileReader.onload({} as ProgressEvent<FileReader>);

      await expect(promise).resolves.toBe(expectedDataURL);
    });
  });

  describe('エラーハンドリング', () => {
    test('読み込みエラー時にPromiseがrejectされる', async () => {
      const file = new File([''], 'error.txt');
      const promise = readFileAsDataUrl(file);
      const errorEvent = new ProgressEvent('error');

      // onerrorをシミュレート
      mockFileReader.onerror(errorEvent);

      await expect(promise).rejects.toBe(errorEvent);
    });

    test('読み込み中断時にPromiseがrejectされる', async () => {
      const file = new File([''], 'abort.txt');
      const promise = readFileAsDataUrl(file);
      const abortEvent = new ProgressEvent('abort');

      // onabortをシミュレート
      mockFileReader.onabort(abortEvent);

      await expect(promise).rejects.toBe(abortEvent);
    });
  });

  describe('エッジケース', () => {
    test('空のファイルを読み込むと空のData URLが返る', async () => {
      const file = new File([], 'empty.txt', { type: 'text/plain' });
      const promise = readFileAsDataUrl(file);
      const expectedDataURL = `data:${file.type};base64,`;

      mockFileReader.result = expectedDataURL;
      mockFileReader.onload({} as ProgressEvent<FileReader>);

      await expect(promise).resolves.toBe(expectedDataURL);
    });
  });
});
