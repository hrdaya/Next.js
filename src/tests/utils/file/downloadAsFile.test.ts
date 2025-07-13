import { afterEach, describe, expect, test, vi } from 'vitest';
import { downloadAsFile } from '../../../utils/file';

// ブラウザ環境のモック
const createObjectURL = vi.fn((blob) => `blob:${blob.type}/${Math.random()}`);
const revokeObjectURL = vi.fn();
const appendChild = vi.fn();
const removeChild = vi.fn();
const click = vi.fn();

global.URL.createObjectURL = createObjectURL;
global.URL.revokeObjectURL = revokeObjectURL;
global.document.body.appendChild = appendChild;
global.document.body.removeChild = removeChild;

// a要素のモック
vi.stubGlobal('document', {
  ...global.document,
  createElement: (tag: string) => {
    if (tag === 'a') {
      return {
        href: '',
        download: '',
        style: { display: '' },
        click: click,
      };
    }
    return document.createElement(tag);
  },
  body: {
    appendChild: appendChild,
    removeChild: removeChild,
  },
});

describe('downloadAsFile', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本機能テスト', () => {
    test('文字列データを正しいMIMEタイプでダウンロードできる', () => {
      const data = 'Hello, World!';
      const filename = 'greeting.txt';
      const mimeType = 'text/plain';

      downloadAsFile(data, filename, mimeType);

      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.size).toBe(data.length);
      expect(blob.type).toBe(mimeType);

      expect(appendChild).toHaveBeenCalledTimes(1);
      const link = appendChild.mock.calls[0][0];
      expect(link.href).toMatch(/^blob:text\/plain\//);
      expect(link.download).toBe(filename);

      expect(click).toHaveBeenCalledTimes(1);
      expect(removeChild).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    });

    test('Blobデータを直接ダウンロードできる', () => {
      const data = new Blob(['{"key":"value"}'], { type: 'application/json' });
      const filename = 'data.json';

      downloadAsFile(data, filename);

      expect(createObjectURL).toHaveBeenCalledWith(data);
      expect(appendChild).toHaveBeenCalledTimes(1);
      expect(click).toHaveBeenCalledTimes(1);
    });

    test('デフォルトのMIMEタイプが正しく適用される', () => {
      const data = 'some data';
      const filename = 'file.bin';

      downloadAsFile(data, filename);

      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.type).toBe('application/octet-stream');
    });
  });

  describe('エッジケース', () => {
    test('空の文字列データをダウンロードできる', () => {
      downloadAsFile('', 'empty.txt');
      expect(click).toHaveBeenCalledTimes(1);
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.size).toBe(0);
    });

    test('空のファイル名でダウンロードできる', () => {
      downloadAsFile('data', '');
      expect(click).toHaveBeenCalledTimes(1);
      const link = appendChild.mock.calls[0][0];
      expect(link.download).toBe('');
    });

    test('特殊文字を含むファイル名でダウンロードできる', () => {
      const filename = 'file with spaces & chars.txt';
      downloadAsFile('data', filename);
      const link = appendChild.mock.calls[0][0];
      expect(link.download).toBe(filename);
    });
  });
});
