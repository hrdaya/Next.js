'use client';

import { fontSettings, getFontClassByLang } from '@/lib/i18n/font-settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 現在の言語に応じてフォントを動的に切り替えるコンポーネント
 */
export function DynamicFont() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const root = document.documentElement;
    const currentLang = i18n.language;

    // 既存のフォントクラスをすべて削除
    for (const { fontClass } of Object.values(fontSettings)) {
      root.classList.remove(fontClass);
    }

    // 現在の言語に応じた新しいフォントクラスを追加
    const newFontClass = getFontClassByLang(currentLang);
    root.classList.add(newFontClass);
  }, [i18n.language]);

  return null; // このコンポーネントはUIを描画しない
}
