// Laravelのレスポンスに関する型定義、初期値

/**
 * レスポンスのベース
 */
export interface ResponseBase<T> {
  ok: boolean;
  status: number;
  statusText: string;
  message?: string | string[];
  data?: T;
  errors?: { [name: string]: string[] };
}

/**
 * ペジネーションされたレスポンス用
 */
export interface PaginatedResponseAttributes<T> {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  path: string;
  from: number;
  to: number;
  data: T[];
}

/**
 * バリデーションエラーのレスポンス用
 */
export interface ValidationErrorsAttributes {
  [name: string]: string[];
}

// バリデーションエラーの初期値
export const validationErrorsInitialState: ValidationErrorsAttributes = {};

/**
 * 成功時のレスポンスの形式
 */
export interface ServerResponse<T> {
  message: string;
  data: T;
}

/**
 * バリデーションエラーのレスポンスの形式
 */
export interface ValidationErrorsResponse {
  message: string;
  errors: ValidationErrorsAttributes;
}
