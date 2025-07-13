import { describe, expect, it } from 'vitest';
import { clone } from '../../../utils/clone';

/**
 * clone関数の包括的テスト
 *
 * オブジェクトのディープコピー機能をテストします。
 * 基本機能、エッジケース、制限事項、パフォーマンスをすべて含みます。
 */
describe('clone関数', () => {
  // 基本機能テスト
  describe('基本機能', () => {
    it('プリミティブ値を正しくコピーする', () => {
      expect(clone(42)).toBe(42);
      expect(clone('hello')).toBe('hello');
      expect(clone(true)).toBe(true);
      expect(clone(false)).toBe(false);
      expect(clone(null)).toBe(null);
    });

    it('単純なオブジェクトを正しくコピーする', () => {
      const original = { name: 'John', age: 30 };
      const copied = clone(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original); // 参照が異なることを確認

      // オリジナルの変更がコピーに影響しないことを確認
      original.age = 31;
      expect(copied.age).toBe(30);
    });

    it('単純な配列を正しくコピーする', () => {
      const original = [1, 2, 3, 'hello', true];
      const copied = clone(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original); // 参照が異なることを確認

      // オリジナルの変更がコピーに影響しないことを確認
      original.push('new');
      expect(copied).toEqual([1, 2, 3, 'hello', true]);
    });

    it('ネストしたオブジェクトを正しくディープコピーする', () => {
      const original = {
        user: {
          name: 'John',
          address: {
            city: 'Tokyo',
            country: 'Japan',
          },
        },
        scores: [90, 85, 88],
      };
      const copied = clone(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.user).not.toBe(original.user);
      expect(copied.user.address).not.toBe(original.user.address);
      expect(copied.scores).not.toBe(original.scores);

      // ネストしたオブジェクトの変更がコピーに影響しないことを確認
      original.user.name = 'Jane';
      original.user.address.city = 'Osaka';
      original.scores.push(95);

      expect(copied.user.name).toBe('John');
      expect(copied.user.address.city).toBe('Tokyo');
      expect(copied.scores).toEqual([90, 85, 88]);
    });
  });

  // 型別テスト
  describe('型別テスト', () => {
    it('文字列型を正しくコピーする', () => {
      const str = 'Hello World';
      const copied = clone(str);
      expect(copied).toBe(str);
      expect(typeof copied).toBe('string');
    });

    it('数値型を正しくコピーする', () => {
      const num = 123.456;
      const copied = clone(num);
      expect(copied).toBe(num);
      expect(typeof copied).toBe('number');
    });

    it('boolean型を正しくコピーする', () => {
      const bool = true;
      const copied = clone(bool);
      expect(copied).toBe(bool);
      expect(typeof copied).toBe('boolean');
    });

    it('null と undefined を正しく処理する', () => {
      expect(clone(null)).toBe(null);
      expect(clone(undefined)).toBe(undefined);
    });

    it('オブジェクト内の null と undefined を正しく処理する', () => {
      const original = { a: null, b: undefined, c: 'value' };
      const copied = clone(original);

      expect(copied.a).toBe(null);
      expect(copied.b).toBe(undefined);
      expect(copied.c).toBe('value');
    });
  });

  // 複雑なデータ構造のテスト
  describe('複雑なデータ構造', () => {
    it('多次元配列を正しくコピーする', () => {
      const original = [
        [1, 2, 3],
        ['a', 'b', 'c'],
        [{ name: 'John' }, { name: 'Jane' }],
      ] as [number[], string[], Array<{ name: string }>];
      const copied = clone(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied[0]).not.toBe(original[0]);
      expect(copied[2][0]).not.toBe(original[2][0]);

      // 変更の独立性を確認
      original[0][0] = 999;
      original[2][0].name = 'Changed';

      expect(copied[0][0]).toBe(1);
      expect(copied[2][0].name).toBe('John');
    });

    it('オブジェクトの配列を正しくコピーする', () => {
      const original = [
        { id: 1, name: 'Item 1', tags: ['tag1', 'tag2'] },
        { id: 2, name: 'Item 2', tags: ['tag3', 'tag4'] },
      ];
      const copied = clone(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied[0]).not.toBe(original[0]);
      expect(copied[0].tags).not.toBe(original[0].tags);

      // 変更の独立性を確認
      original[0].name = 'Modified';
      original[0].tags.push('new-tag');

      expect(copied[0].name).toBe('Item 1');
      expect(copied[0].tags).toEqual(['tag1', 'tag2']);
    });

    it('空のオブジェクトと配列を正しくコピーする', () => {
      expect(clone({})).toEqual({});
      expect(clone([])).toEqual([]);

      const emptyNested = { empty: {}, list: [] };
      const copied = clone(emptyNested);

      expect(copied).toEqual(emptyNested);
      expect(copied.empty).not.toBe(emptyNested.empty);
      expect(copied.list).not.toBe(emptyNested.list);
    });
  });

  // JSON制限のテスト
  describe('JSON制限事項', () => {
    it('関数は正しくコピーされない（JSON制限）', () => {
      const original = {
        name: 'Test',
        method: () => 'hello',
      };
      const copied = clone(original);

      expect(copied.name).toBe('Test');
      expect(copied.method).toBeUndefined(); // 関数は除外される
    });

    it('undefined プロパティは除外される（JSON制限）', () => {
      const original = {
        defined: 'value',
        notDefined: undefined,
      };
      const copied = clone(original);

      expect(copied.defined).toBe('value');
      expect('notDefined' in copied).toBe(false); // undefinedプロパティは除外
    });

    it('Symbolは正しくコピーされない（JSON制限）', () => {
      const sym = Symbol('test');
      const original = {
        normal: 'value',
        [sym]: 'symbol value',
      };
      const copied = clone(original);

      expect(copied.normal).toBe('value');
      expect(copied[sym]).toBeUndefined(); // Symbolプロパティは除外
    });

    it('Dateオブジェクトは文字列に変換される（JSON制限）', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const original = { date };
      const copied = clone(original);

      expect(typeof copied.date).toBe('string');
      expect(copied.date).toBe(date.toISOString());
    });

    it('RegExpオブジェクトは空オブジェクトになる（JSON制限）', () => {
      const original = { pattern: /test/gi };
      const copied = clone(original);

      expect(copied.pattern).toEqual({});
    });

    it('循環参照はエラーを発生させる', () => {
      const original: Record<string, unknown> = { name: 'test' };
      original.self = original; // 循環参照を作成

      expect(() => clone(original)).toThrow('circular'); // JSON.stringify がエラーを発生
    });

    it('BigIntはTypeErrorを発生させる', () => {
      const original = { value: 9007199254740991n };
      expect(() => clone(original)).toThrow(TypeError);
    });
  });

  // 特殊値のテスト
  describe('特殊値', () => {
    it('NaN と Infinity を正しく処理する', () => {
      const original = {
        nan: Number.NaN,
        infinity: Number.POSITIVE_INFINITY,
        negInfinity: Number.NEGATIVE_INFINITY,
      };
      const copied = clone(original);

      expect(copied.nan).toBe(null); // NaN は null に変換される
      expect(copied.infinity).toBe(null); // Infinity は null に変換される
      expect(copied.negInfinity).toBe(null); // -Infinity は null に変換される
    });

    it('BigInt は文字列に変換される', () => {
      const original = { big: BigInt(123) };

      // BigInt は JSON.stringify でエラーになる場合があるので、エラーテストとして扱う
      expect(() => clone(original)).toThrow();
    });

    it('Map と Set は正しくコピーされない', () => {
      const original = {
        map: new Map([['key', 'value']]),
        set: new Set([1, 2, 3]),
      };
      const copied = clone(original);

      expect(copied.map).toEqual({}); // Map は空オブジェクトになる
      expect(copied.set).toEqual({}); // Set は空オブジェクトになる
    });

    it('プロトタイプ上のプロパティはコピーされない', () => {
      function Dog(this: { name: string }, name: string) {
        this.name = name;
      }
      Dog.prototype.bark = () => 'woof!';

      const dog = new (
        Dog as unknown as new (
          name: string
        ) => { name: string; bark?: () => string }
      )('buddy');
      const clonedDog = clone(dog);

      expect(clonedDog.name).toBe('buddy');
      expect(clonedDog.bark).toBeUndefined();
    });
  });

  // 型安全性テスト
  describe('型安全性', () => {
    it('TypeScriptの型チェックで正しい型が受け入れられる', () => {
      expect(() => {
        clone({ name: 'test' });
        clone([1, 2, 3]);
        clone('string');
        clone(123);
        clone(true);
        clone(null);
      }).not.toThrow();
    });

    it('ジェネリック型が正しく保持される', () => {
      interface User {
        id: number;
        name: string;
      }

      const user: User = { id: 1, name: 'John' };
      const copied: User = clone(user);

      expect(copied.id).toBe(1);
      expect(copied.name).toBe('John');
    });
  });

  // 実世界のユースケーステスト
  describe('実世界のユースケース', () => {
    it('設定オブジェクトのコピーで正しく動作する', () => {
      const defaultConfig = {
        api: {
          baseUrl: 'https://api.example.com',
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        features: {
          authentication: true,
          logging: false,
        },
      };

      const userConfig = clone(defaultConfig);
      userConfig.api.timeout = 10000;
      userConfig.features.logging = true;

      // オリジナルが変更されていないことを確認
      expect(defaultConfig.api.timeout).toBe(5000);
      expect(defaultConfig.features.logging).toBe(false);

      // コピーが正しく変更されていることを確認
      expect(userConfig.api.timeout).toBe(10000);
      expect(userConfig.features.logging).toBe(true);
    });

    it('フォームデータのバックアップで正しく動作する', () => {
      const formData = {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        preferences: {
          theme: 'dark',
          notifications: ['email', 'push'],
        },
      };

      const backup = clone(formData);

      // フォームデータを変更
      formData.user.firstName = 'Jane';
      formData.preferences.notifications.push('sms');

      // バックアップが影響を受けていないことを確認
      expect(backup.user.firstName).toBe('John');
      expect(backup.preferences.notifications).toEqual(['email', 'push']);
    });

    it('APIレスポンスの処理で正しく動作する', () => {
      const apiResponse = {
        data: [
          { id: 1, name: 'Item 1', metadata: { category: 'A' } },
          { id: 2, name: 'Item 2', metadata: { category: 'B' } },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
        },
      };

      const processedData = clone(apiResponse);
      for (const item of processedData.data) {
        (item.metadata as { category: string; processed?: boolean }).processed =
          true;
      }

      // オリジナルが影響を受けていないことを確認
      expect(
        (
          apiResponse.data[0].metadata as {
            category: string;
            processed?: boolean;
          }
        ).processed
      ).toBeUndefined();
      expect(
        (
          apiResponse.data[1].metadata as {
            category: string;
            processed?: boolean;
          }
        ).processed
      ).toBeUndefined();

      // 処理済みデータが正しく変更されていることを確認
      expect(
        (
          processedData.data[0].metadata as {
            category: string;
            processed?: boolean;
          }
        ).processed
      ).toBe(true);
      expect(
        (
          processedData.data[1].metadata as {
            category: string;
            processed?: boolean;
          }
        ).processed
      ).toBe(true);
    });
  });
});
