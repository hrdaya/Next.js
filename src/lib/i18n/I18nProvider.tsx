/**
 * Next.js App Router対応 国際化プロバイダーコンポーネント
 *
 * このコンポーネントは、Next.js App RouterのSSR環境で
 * i18next を安全に初期化し、Hydrationエラーを防ぐ
 * ためのラッパープロバイダーです。
 *
 * 主な役割:
 * - クライアントサイドでのi18next遅延初期化
 * - サーバーから渡された初期言語設定の適用
 * - Hydrationエラーの防止
 * - React Contextを通じた翻訳機能の提供
 *
 * 技術的課題の解決:
 * - SSR時とCSR時の言語設定不一致の解決
 * - 初期化タイミングの制御
 * - 非同期初期化処理の適切な管理
 *
 * 使用場所:
 * - アプリケーションのルートレイアウト
 * - 国際化が必要なページの最上位
 */

'use client';

import i18n from '@/lib/i18n/i18n';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

/**
 * I18nProviderコンポーネントのProps型定義
 */
interface I18nProviderProps {
  /** レンダリング対象の子要素 */
  children: React.ReactNode;
  /**
   * サーバーサイドから渡される初期言語設定
   * SSR時の言語検出結果をクライアントに引き継ぐために使用
   * 省略可能：省略時はクライアントサイドの言語検出に依存
   */
  initialLanguage?: string;
}

/**
 * 国際化プロバイダーコンポーネント
 *
 * Next.js App RouterのSSR環境で安全にi18nextを初期化し、
 * アプリケーション全体に翻訳機能を提供します。
 *
 * 動作フロー:
 * 1. コンポーネントマウント時にi18nextの初期化状態をチェック
 * 2. 未初期化の場合は遅延初期化を実行
 * 3. initialLanguageが指定されている場合は言語を切り替え
 * 4. I18nextProviderでコンテキストを提供
 *
 * Hydrationエラー対策:
 * - 初期化の完了を待たずに常に子要素をレンダリング
 * - サーバーとクライアントで一貫したDOM構造を維持
 * - 非同期的な言語変更処理
 *
 * @param children - ラップする子要素
 * @param initialLanguage - サーバーから指定される初期言語（オプション）
 */
export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  /**
   * i18next初期化処理
   *
   * このエフェクトは以下の処理を非同期で実行します:
   * 1. i18nextインスタンスの初期化確認
   * 2. 必要に応じた遅延初期化
   * 3. サーバーから指定された言語への切り替え
   */
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        // i18nextが未初期化の場合のみ初期化を実行
        // 重複初期化を防ぎ、パフォーマンスを最適化
        if (!i18n.isInitialized) {
          await i18n.init();
        }

        // サーバーサイドから受け取った初期言語を適用
        // SSR時の言語検出結果をクライアントサイドに正確に反映
        if (initialLanguage && i18n.language !== initialLanguage) {
          await i18n.changeLanguage(initialLanguage);
        }
      } catch (error) {
        // 初期化エラーをログに記録
        // アプリケーションの動作は継続（フォールバック動作）
        console.error('i18n initialization failed:', error);
      }
    };

    // 非同期初期化の実行
    // useEffectは非同期関数を直接受け取れないため、内部で定義・実行
    initializeI18n();
  }, [initialLanguage]); // initialLanguageの変更時に再実行

  /**
   * レンダリング処理
   *
   * Hydrationエラー防止の重要な設計:
   * - i18nextの初期化完了を待たずに即座にレンダリング
   * - サーバーサイドとクライアントサイドで同じDOM構造を維持
   * - I18nextProviderで一貫したコンテキストを提供
   *
   * この設計により:
   * - 初期表示が高速化される
   * - Hydrationエラーが発生しない
   * - 翻訳データの読み込み完了後に自動的に再レンダリング
   */
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
