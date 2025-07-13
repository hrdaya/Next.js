import { describe, expect, it } from 'vitest';
import { capitalize } from '../../../utils/string';

/**
 * capitalize関数の包括的テスト
 *
 * 文字列の最初の文字を大文字にする機能をテストします。
 * 基本機能、エッジケース、パフォーマンスをすべて含みます。
 */
describe('capitalize関数', () => {
  // 基本機能テスト
  describe('基本機能', () => {
    it('小文字の文字列を正しく大文字にする', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
      expect(capitalize('test')).toBe('Test');
    });

    it('既に大文字の文字列はそのまま返す', () => {
      expect(capitalize('Hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
      expect(capitalize('Test')).toBe('Test');
    });

    it('混合文字の文字列を正しく処理する', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
      expect(capitalize('tEST')).toBe('TEST');
      expect(capitalize('mIxEd')).toBe('MIxEd');
    });

    it('単一文字を正しく処理する', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('z')).toBe('Z');
      expect(capitalize('A')).toBe('A');
      expect(capitalize('Z')).toBe('Z');
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    it('空文字列を正しく処理する', () => {
      expect(capitalize('')).toBe('');
    });

    it('空白文字で始まる文字列を正しく処理する', () => {
      expect(capitalize(' hello')).toBe(' hello');
      expect(capitalize('  world')).toBe('  world');
      expect(capitalize('\thello')).toBe('\thello');
      expect(capitalize('\nhello')).toBe('\nhello');
    });

    it('数字で始まる文字列を正しく処理する', () => {
      expect(capitalize('123abc')).toBe('123abc');
      expect(capitalize('1hello')).toBe('1hello');
      expect(capitalize('9world')).toBe('9world');
    });

    it('特殊文字で始まる文字列を正しく処理する', () => {
      expect(capitalize('!hello')).toBe('!hello');
      expect(capitalize('@world')).toBe('@world');
      expect(capitalize('#test')).toBe('#test');
      expect(capitalize('$money')).toBe('$money');
      expect(capitalize('%percent')).toBe('%percent');
    });

    it('マルチバイト文字を正しく処理する', () => {
      expect(capitalize('こんにちは')).toBe('こんにちは');
      expect(capitalize('ñoño')).toBe('Ñoño');
      expect(capitalize('ñUeVo')).toBe('ÑUeVo');
      expect(capitalize('русский')).toBe('Русский');
      expect(capitalize('español')).toBe('Español');
    });

    it('アクセント付き文字を正しく処理する', () => {
      expect(capitalize('àbcd')).toBe('Àbcd');
      expect(capitalize('éfgh')).toBe('Éfgh');
      expect(capitalize('ümlaut')).toBe('Ümlaut');
      expect(capitalize('ñoño')).toBe('Ñoño');
    });

    it('全角文字を正しく処理する', () => {
      expect(capitalize('ａｂｃ')).toBe('Ａｂｃ');
      expect(capitalize('１２３')).toBe('１２３');
      expect(capitalize('　ｈｅｌｌｏ')).toBe('　ｈｅｌｌｏ'); // 全角スペース
    });
  });

  // 特殊文字と記号のテスト
  describe('特殊文字と記号', () => {
    it('各種括弧で始まる文字列を処理する', () => {
      expect(capitalize('(hello)')).toBe('(hello)');
      expect(capitalize('[world]')).toBe('[world]');
      expect(capitalize('{test}')).toBe('{test}');
      expect(capitalize('<tag>')).toBe('<tag>');
    });

    it('引用符で始まる文字列を処理する', () => {
      expect(capitalize('"hello"')).toBe('"hello"');
      expect(capitalize("'world'")).toBe("'world'");
      expect(capitalize('`test`')).toBe('`test`');
    });

    it('数学記号で始まる文字列を処理する', () => {
      expect(capitalize('+positive')).toBe('+positive');
      expect(capitalize('-negative')).toBe('-negative');
      expect(capitalize('=equal')).toBe('=equal');
      expect(capitalize('*multiply')).toBe('*multiply');
      expect(capitalize('/divide')).toBe('/divide');
    });

    it('通貨記号で始まる文字列を処理する', () => {
      expect(capitalize('$dollar')).toBe('$dollar');
      expect(capitalize('¥yen')).toBe('¥yen');
      expect(capitalize('€euro')).toBe('€euro');
      expect(capitalize('£pound')).toBe('£pound');
    });
  });

  // 複数単語の処理テスト
  describe('複数単語の処理', () => {
    it('スペース区切りの複数単語では最初の文字のみ大文字にする', () => {
      expect(capitalize('hello world')).toBe('Hello world');
      expect(capitalize('the quick brown fox')).toBe('The quick brown fox');
      expect(capitalize('multiple word string')).toBe('Multiple word string');
    });

    it('他の区切り文字がある文字列を処理する', () => {
      expect(capitalize('hello-world')).toBe('Hello-world');
      expect(capitalize('hello_world')).toBe('Hello_world');
      expect(capitalize('hello.world')).toBe('Hello.world');
      expect(capitalize('hello,world')).toBe('Hello,world');
    });

    it('文の先頭以外は変更しない', () => {
      expect(capitalize('hello WORLD')).toBe('Hello WORLD');
      expect(capitalize('the QUICK brown FOX')).toBe('The QUICK brown FOX');
      expect(capitalize('MiXeD cAsE sTrInG')).toBe('MiXeD cAsE sTrInG');
    });
  });

  // 型安全性テスト
  describe('型安全性', () => {
    it('TypeScriptの型チェックで正しい型が受け入れられる', () => {
      expect(() => {
        capitalize('string');
        capitalize('');
        capitalize('123');
        capitalize('special!@#');
      }).not.toThrow();
    });

    it('実行時エラーが発生しない', () => {
      expect(() => {
        capitalize('normal');
        capitalize('');
        capitalize('123');
        capitalize('UPPERCASE');
        capitalize('mixedCASE');
      }).not.toThrow();
    });
  });

  // 実世界のユースケーステスト
  describe('実世界のユースケース', () => {
    it('ユーザー名の表示で正しく動作する', () => {
      expect(capitalize('john')).toBe('John');
      expect(capitalize('mary')).toBe('Mary');
      expect(capitalize('josé')).toBe('José');
      expect(capitalize('müller')).toBe('Müller');
    });

    it('タイトルや見出しの表示で正しく動作する', () => {
      expect(capitalize('welcome to our website')).toBe(
        'Welcome to our website'
      );
      expect(capitalize('latest news and updates')).toBe(
        'Latest news and updates'
      );
      expect(capitalize('user profile settings')).toBe('User profile settings');
    });

    it('フォーム入力の正規化で正しく動作する', () => {
      // ユーザーが小文字で入力した名前を正規化
      expect(capitalize('smith')).toBe('Smith');
      expect(capitalize('johnson')).toBe('Johnson');
      expect(capitalize('williams')).toBe('Williams');
    });

    it('ファイル名や識別子の表示で正しく動作する', () => {
      expect(capitalize('readme.txt')).toBe('Readme.txt');
      expect(capitalize('config.json')).toBe('Config.json');
      expect(capitalize('user-settings')).toBe('User-settings');
    });

    it('多言語対応アプリケーションで正しく動作する', () => {
      expect(capitalize('français')).toBe('Français');
      expect(capitalize('español')).toBe('Español');
      expect(capitalize('deutsch')).toBe('Deutsch');
      expect(capitalize('italiano')).toBe('Italiano');
    });

    it('エラーメッセージの表示で正しく動作する', () => {
      expect(capitalize('invalid input')).toBe('Invalid input');
      expect(capitalize('connection failed')).toBe('Connection failed');
      expect(capitalize('permission denied')).toBe('Permission denied');
    });

    it('ナビゲーションメニューで正しく動作する', () => {
      expect(capitalize('home')).toBe('Home');
      expect(capitalize('about us')).toBe('About us');
      expect(capitalize('contact')).toBe('Contact');
      expect(capitalize('services')).toBe('Services');
    });
  });

  // エンコーディングと特殊ケース
  describe('エンコーディングと特殊ケース', () => {
    it('絵文字が含まれる文字列を正しく処理する', () => {
      expect(capitalize('hello 😊')).toBe('Hello 😊');
      expect(capitalize('🎉celebration')).toBe('🎉celebration');
      expect(capitalize('test🚀rocket')).toBe('Test🚀rocket');
    });

    it('CJK文字（中日韓）を正しく処理する', () => {
      expect(capitalize('中文')).toBe('中文');
      expect(capitalize('日本語')).toBe('日本語');
      expect(capitalize('한국어')).toBe('한국어');
    });

    it('制御文字が含まれる文字列を安全に処理する', () => {
      expect(capitalize('\x00hello')).toBe('\x00hello');
      expect(capitalize('\x1Ftest')).toBe('\x1Ftest');
    });
  });

  // 不正な入力値のテスト
  describe('不正な入力値', () => {
    it('nullを渡すと空文字列が返るべき', () => {
      // @ts-expect-error: Test invalid input
      expect(capitalize(null)).toBe('');
    });

    it('undefinedを渡すと空文字列が返るべき', () => {
      // @ts-expect-error: Test invalid input
      expect(capitalize(undefined)).toBe('');
    });

    it('数値や他の型を渡した場合、文字列に変換して処理するべき', () => {
      // JavaScript環境での堅牢性を確認
      // @ts-expect-error: Test invalid input
      expect(capitalize(123)).toBe('123');
      // @ts-expect-error: Test invalid input
      expect(capitalize({ obj: 'test' })).toBe('[object Object]');
      // @ts-expect-error: Test invalid input
      expect(capitalize(['a', 'b'])).toBe('a,b');
    });
  });
});
