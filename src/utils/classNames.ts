/**
 * CSSクラス名操作用ユーティリティ関数群
 *
 * このファイルには、CSSクラス名の条件付き結合や操作を行う
 * ユーティリティ関数が含まれています。
 */

/**
 * CSSクラス名を条件付きで結合するユーティリティ関数
 *
 * falsy値（false、null、undefined）をフィルタリングし、
 * 残ったクラス名をスペースで結合します。
 * 動的にクラス名を生成する際に便利です。
 *
 * @param classes - クラス名の配列（文字列、undefined、false、null）
 * @returns 結合されたクラス名文字列
 *
 * @example
 * ```typescript
 * cn('btn', isActive && 'active', 'primary') // 'btn active primary'
 * cn('card', false, null, 'shadow') // 'card shadow'
 * ```
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  // Boolean()関数でfalsyな値を除外し、残った文字列をスペースで結合
  return classes.filter(Boolean).join(' ');
}

/**
 * オブジェクト形式でクラス名を条件付き適用する関数
 *
 * ベースとなるクラス名に加えて、条件オブジェクトに基づいて
 * 追加のクラス名を適用します。条件がtrueの場合のみクラス名が追加されます。
 *
 * @param baseClasses - 常に適用されるベースクラス名
 * @param conditionalClasses - 条件とそれに対応するクラス名のオブジェクト
 * @returns 結合されたクラス名文字列
 *
 * @example
 * ```typescript
 * clsx('btn', {
 *   'btn-primary': variant === 'primary',    // variantがprimaryの場合のみ適用
 *   'btn-disabled': disabled,                // disabledがtrueの場合のみ適用
 *   'btn-large': size === 'large'           // sizeがlargeの場合のみ適用
 * })
 * ```
 */
export function clsx(
  baseClasses: string,
  conditionalClasses: Record<string, boolean>
): string {
  // 条件オブジェクトから条件がtrueのエントリのみを抽出し、クラス名配列を作成
  const conditionals = Object.entries(conditionalClasses)
    .filter(([, condition]) => condition) // 条件がtrueのもののみフィルタ
    .map(([className]) => className); // クラス名のみを抽出

  // ベースクラスと条件付きクラスを結合
  return cn(baseClasses, ...conditionals);
}
