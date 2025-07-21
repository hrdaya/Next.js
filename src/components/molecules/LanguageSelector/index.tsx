'use client';

import {
  type LanguageConfig,
  getLanguageConfig,
  languagesConfig,
} from '@/lib/i18n/languages';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface LanguageSelectorProps {
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** 表示スタイル */
  variant?: 'default' | 'compact' | 'icon-only';
  /** カスタムクラス名 */
  className?: string;
  /** 無効状態 */
  disabled?: boolean;
}

export function LanguageSelector({
  size = 'md',
  variant = 'default',
  className = '',
  disabled = false,
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLanguage =
    getLanguageConfig(i18n.language) || languagesConfig[0];

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ESCキーでドロップダウンを閉じる
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleLanguageChange = (languageCode: string) => {
    // i18nextインスタンスの言語を変更
    // i18nextがCookie設定も自動的に行う（detection.caches: ['cookie']により）
    i18n.changeLanguage(languageCode);

    setIsOpen(false);
  };

  // サイズ別のスタイル
  const sizeStyles = {
    sm: {
      button: 'px-2 py-1.5 text-sm',
      dropdown: 'text-sm min-w-[120px]',
      icon: 'h-4 w-4',
      flag: 'text-sm',
    },
    md: {
      button: 'px-3 py-2 text-base',
      dropdown: 'text-base min-w-[140px]',
      icon: 'h-5 w-5',
      flag: 'text-base',
    },
    lg: {
      button: 'px-4 py-3 text-lg',
      dropdown: 'text-lg min-w-[160px]',
      icon: 'h-6 w-6',
      flag: 'text-lg',
    },
  };

  const styles = sizeStyles[size];

  const renderButton = () => {
    const baseButtonClasses = `
      group relative inline-flex items-center gap-2 font-medium rounded-xl
      bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl
      border border-white/20 dark:border-gray-700/50
      shadow-lg hover:shadow-xl
      transition-all duration-200 transform hover:scale-105
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      text-gray-700 dark:text-gray-300
      hover:text-indigo-600 dark:hover:text-indigo-400
      ${styles.button}
      ${className}
    `;

    if (variant === 'icon-only') {
      return (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={baseButtonClasses}
          aria-label={`Current language: ${currentLanguage.name}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span
            className={styles.flag}
            role="img"
            aria-label={currentLanguage.englishName}
          >
            {currentLanguage.flag}
          </span>
          <svg
            className={`${styles.icon} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={baseButtonClasses}
          aria-label={`Current language: ${currentLanguage.name}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span
            className={styles.flag}
            role="img"
            aria-label={currentLanguage.englishName}
          >
            {currentLanguage.flag}
          </span>
          <span className="font-semibold">{currentLanguage.name}</span>
          <svg
            className={`${styles.icon} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      );
    }

    // default variant
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={baseButtonClasses}
        aria-label={`Current language: ${currentLanguage.name}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <svg
          className={`${styles.icon} text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 919-9"
          />
        </svg>
        <span
          className={styles.flag}
          role="img"
          aria-label={currentLanguage.englishName}
        >
          {currentLanguage.flag}
        </span>
        <span className="font-semibold">{currentLanguage.name}</span>
        <svg
          className={`${styles.icon} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {renderButton()}

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className={`
          absolute right-0 mt-2 origin-top-right z-50
          bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
          border border-white/20 dark:border-gray-700/50
          rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5
          animate-in slide-in-from-top-2 duration-200
          ${styles.dropdown}
        `}
        >
          <div className="py-2" aria-label="Language selection">
            {languagesConfig.map((language) => {
              const isSelected = language.code === currentLanguage.code;

              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => handleLanguageChange(language.code)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5
                    text-left transition-all duration-150
                    hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                    focus:outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/30
                    ${
                      isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100'
                        : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                  aria-pressed={isSelected}
                >
                  <span
                    className={styles.flag}
                    role="img"
                    aria-label={language.englishName}
                  >
                    {language.flag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{language.name}</div>
                    {variant === 'default' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {language.englishName}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <svg
                      className={`${styles.icon} text-indigo-600 dark:text-indigo-400 flex-shrink-0`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
