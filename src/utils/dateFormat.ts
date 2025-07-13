import { padLeft } from './string';

/**
 * 日時をISO 8601ライクな形式（yyyy-mm-ddThh:mm）の文字列に変換します
 *
 * DateオブジェクトまたはISO文字列を受け取り、ローカル時刻で
 * 年-月-日T時:分の形式に変換します。HTMLのdatetime-local入力フィールドで使用可能です。
 *
 * @param date - 変換したい日時（DateオブジェクトまたはISO文字列）
 * @param separator - 日付と時刻の区切り文字（デフォルト：'T'）
 * @returns フォーマットされた日時文字列
 *
 * @example
 * formatLocalDatetime(new Date()) // "2023-12-25T14:30"
 * formatLocalDatetime("2023-12-25T14:30:00Z", " ") // "2023-12-25 14:30"
 */
export const formatLocalDatetime = (
  date: Date | string,
  separator = 'T'
): string => {
  // 文字列の場合は新しいDateオブジェクトを作成、そうでなければそのまま使用
  let dt: Date;
  if (typeof date === 'string') {
    // 空文字列の場合は無効な日付として扱う
    if (date.trim() === '') {
      dt = new Date('invalid');
    } else {
      // 数値文字列の場合は数値に変換してからDateオブジェクトを作成
      const numericTimestamp = Number(date);
      if (!Number.isNaN(numericTimestamp)) {
        dt = new Date(numericTimestamp);
      } else {
        dt = new Date(date);
      }
    }
  } else {
    dt = date;
  }

  // 各日時コンポーネントを取得（ローカル時刻）
  const y = dt.getFullYear(); // 年（4桁）
  const m = dt.getMonth() + 1; // 月（1-12、0ベースなので+1）
  const d = dt.getDate(); // 日（1-31）
  const h = dt.getHours(); // 時（0-23）
  const mi = dt.getMinutes(); // 分（0-59）

  // 各コンポーネントを2桁にパディングして結合
  return `${y}-${padLeft(m)}-${padLeft(d)}${separator}${padLeft(h)}:${padLeft(mi)}`;
};

/**
 * 日付を指定した区切り文字で結合した形式（yyyy/mm/dd）の文字列に変換します
 *
 * DateオブジェクトまたはISO文字列を受け取り、ローカル時刻での日付部分のみを
 * 指定した区切り文字で結合して返します。
 *
 * @param date - 変換したい日付（DateオブジェクトまたはISO文字列）
 * @param separator - 年月日の区切り文字（デフォルト：'/'）
 * @returns フォーマットされた日付文字列
 *
 * @example
 * formatDate(new Date()) // "2023/12/25"
 * formatDate("2023-12-25T14:30:00Z", "-") // "2023-12-25"
 * formatDate(new Date(), ".") // "2023.12.25"
 */
export const formatDate = (date: Date | string, separator = '/'): string => {
  // 文字列の場合は新しいDateオブジェクトを作成、そうでなければそのまま使用
  let dt: Date;
  if (typeof date === 'string') {
    // 空文字列の場合は無効な日付として扱う
    if (date.trim() === '') {
      dt = new Date('invalid');
    } else {
      // 数値文字列の場合は数値に変換してからDateオブジェクトを作成
      const numericTimestamp = Number(date);
      if (!Number.isNaN(numericTimestamp)) {
        dt = new Date(numericTimestamp);
      } else {
        dt = new Date(date);
      }
    }
  } else {
    dt = date;
  }

  // 日付コンポーネントを取得（ローカル時刻）
  const y = dt.getFullYear(); // 年（4桁）
  const m = dt.getMonth() + 1; // 月（1-12、0ベースなので+1）
  const d = dt.getDate(); // 日（1-31）

  // 年と月日を指定した区切り文字で結合（月日は2桁にパディング）
  return `${y}${separator}${padLeft(m)}${separator}${padLeft(d)}`;
};

// デフォルトエクスポート：すべての関数を含むオブジェクト
export default { formatLocalDatetime, formatDate };
