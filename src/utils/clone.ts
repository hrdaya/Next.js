/**
 * オブジェクトのディープコピーを作成するユーティリティ関数
 *
 * JSON.parse(JSON.stringify())を使用してオブジェクトの完全なコピーを作成します。
 * 注意：関数、undefined、Symbol、Dateオブジェクトなどは正しくコピーされません。
 *
 * @param obj - コピーしたいオブジェクト
 * @returns コピーされたオブジェクト
 */
export const clone = <T>(obj: T): T => {
  // null や undefined の場合はそのまま返す
  if (obj === null || obj === undefined) {
    return obj;
  }

  // JSONシリアライゼーション/デシリアライゼーションでディープコピーを実現
  const data = JSON.parse(JSON.stringify(obj)) as T;
  return data;
};

// デフォルトエクスポート
export default { clone };
