import { signOut } from '@/lib/auth/utils';
import type { ResponseBase } from '@/types/response';
import { forbidden, notFound, unauthorized } from 'next/navigation';

/**
 * クライアントサイドでJWTトークンの存在を確認する
 * httpOnlyのcookieは直接アクセスできないため、APIエンドポイント経由でチェック
 * @returns JWTトークン（存在しない場合は空文字）
 */
const getJwtToken = async (): Promise<string> => {
  // サーバーサイドレンダリング時は空文字を返す
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // httpOnlyのcookieを含める
    });

    if (response.ok) {
      // レスポンスヘッダーからJWTを取得
      const authHeader = response.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }
    return '';
  } catch (error) {
    console.warn('Failed to get JWT token:', error);
    return '';
  }
};

/**
 * API リクエスト用のカスタムReactフック
 *
 * @description
 * - fetchAPIのラッパーとして動作
 * - 統一されたエラーハンドリング（401, 403, 404など）
 * - 自動的な認証エラー処理とリダイレクト
 * - ファイルアップロード・ダウンロード対応
 * - TypeScript型安全性
 * - JWTトークンの自動付与（Cookieから取得してBearerヘッダーに設定）
 *
 * @example
 * ```tsx
 * import type { User } from '@/types'; // システム管理用のUser型
 *
 * const MyComponent = () => {
 *   const api = useApiRequest();
 *
 *   // データ取得（自動的にBearerトークンが付与される）
 *   const fetchUser = async (id: number) => {
 *     const response = await api.get<User>('/api/users', { id });
 *     if (response.ok) {
 *       console.log(response.data);
 *     }
 *   };
 *
 *   // データ作成（自動的にBearerトークンが付与される）
 *   const createUser = async (userData: CreateUserRequest) => {
 *     const response = await api.create<User>('/api/users', userData);
 *     return response;
 *   };
 *
 *   // ファイルアップロード（自動的にBearerトークンが付与される）
 *   const uploadFile = async (file: File) => {
 *     const formData = new FormData();
 *     formData.append('file', file);
 *     const response = await api.upload('/api/upload', formData);
 *     return response;
 *   };
 * };
 * ```
 *
 * @returns APIリクエスト用のメソッド群
 */

/**
 * プロキシAPIを使用してバックエンドにリクエストを送信
 * httpOnlyのcookieは自動的にプロキシAPIで処理される
 * @param method - HTTPメソッド
 * @param body - リクエストボディ
 * @param headers - 追加のヘッダー
 * @returns RequestInit オブジェクト
 */
const getOptions = (
  method: string,
  body?: string,
  headers?: Record<string, string>
): RequestInit => {
  return {
    cache: 'no-store',
    credentials: 'include', // httpOnlyのcookieを含める
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method,
    body,
  };
};

/**
 * APIのレスポンスを処理する
 * @param response - fetchのレスポンス
 * @param defaultResponseData - デフォルトのレスポンスデータ
 * @param message - エラーメッセージ配列
 * @param isDownload - ファイルダウンロードかどうか
 * @returns 処理されたレスポンスデータ
 */
const handler = async <T>(
  response: Response,
  defaultResponseData: ResponseBase<T>,
  message: string[],
  isDownload = false
): Promise<ResponseBase<T>> => {
  const { ok, status, url, statusText } = response;

  // httpOnlyのcookieを使用するため、JWTの処理は不要
  // JWTはサーバーサイドで自動的に管理される

  // 正常レスポンスでファイルダウンロードの場合
  if (ok && isDownload) {
    // ダウンロードが成功したら疑似的にリンクを作成して、それを疑似クリックすることでダウンロードさせる
    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    const contentType = response.headers.get('Content-Type');

    let ext = '.txt';
    switch (contentType) {
      case 'text/csv':
        ext = '.csv';
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        ext = '.xlsx';
        break;
      case 'application/pdf':
        ext = '.pdf';
        break;
      default:
        break;
    }
    const filename = contentDisposition?.split(/filename\*=UTF-8''/i)[1];

    const anchor = document.createElement('a');
    anchor.href = window.URL.createObjectURL(blob);
    anchor.download = decodeURI(filename || `download${ext}`);
    anchor.click();

    window.URL.revokeObjectURL(anchor.href);

    return {
      ...defaultResponseData,
      ok,
      status,
      statusText,
    };
  }

  // 204(データ削除の場合のレスポンス)はレスポンスボディが存在しないので別処理
  if (status === 204) {
    return {
      ...defaultResponseData,
      ok: true,
      status,
      statusText,
    };
  }

  // 正常レスポンスもしくはバリデーションエラーの場合
  if (ok || status === 422) {
    const payload = await response.json();
    if (payload) {
      return {
        ...defaultResponseData,
        ok: true,
        status,
        statusText,
        ...payload,
      };
    }
  }

  // 401: 認証エラー
  if (status === 401) {
    // ログアウト処理
    await signOut();

    // ログイン画面に遷移
    unauthorized();
  }

  // 403: 認可エラー
  if (status === 403) {
    forbidden();
  }

  // 404: ページもしくはデータが存在しない
  if (status === 404) {
    notFound();
  }

  switch (status) {
    case 405: // ルーティングの設定漏れ
      message.push(`メソッドが許可されていません。[${url}]`);
      break;
    case 409: // 楽観的ロック
      message.push(
        '他の人によって更新されています。再度データを読み込みなおしてください。'
      );
      break;
    case 503: // メンテナンス画面
      message.push('メンテナンス中です。');
      break;
    default:
      message.push(`${status} for ${url}`);
      break;
  }

  return {
    ...defaultResponseData,
    ok,
    status,
    statusText,
    message,
  };
};

/**
 * useApiRequest フックの戻り値の型定義
 */
interface useApiRequestValue {
  /** データ取得用メソッド */
  get: <T, V>(
    url: string,
    body?: V,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** データ作成用メソッド */
  create: <T, V>(
    url: string,
    body: V,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** データ更新用メソッド */
  update: <T, V>(
    url: string,
    body: V,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** データ削除用メソッド */
  del: <T, V>(
    url: string,
    body: V,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** ファイルアップロード用メソッド */
  upload: <T>(
    url: string,
    body: FormData,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** ファイルダウンロード用メソッド */
  download: <V>(
    url: string,
    body?: V,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<undefined>>;
}

/**
 * API リクエスト用のカスタムフック
 *
 * fetchメソッドのラッパー関数群を提供し、
 * 統一されたエラーハンドリングと認証処理を行います。
 *
 * @returns APIリクエスト用のメソッド群
 */
export const useApiRequest = (): useApiRequestValue => {
  /**
   * fetchのラッパー関数
   * @param task - fetch Promise
   * @param errorMessage - エラー時のメッセージ
   * @param isDownload - ダウンロード処理かどうか
   * @returns レスポンスデータ
   */
  const wrap = async <T>(
    task: Promise<Response>,
    errorMessage: string,
    isDownload: boolean
  ): Promise<ResponseBase<T>> => {
    // レスポンスの初期値
    const defaultResponseData: ResponseBase<T> = {
      ok: true,
      status: 0,
      statusText: '',
      message: undefined,
      data: undefined,
      errors: undefined,
    };

    // メッセージ
    const message: string[] = [];

    try {
      return handler<T>(await task, defaultResponseData, message, isDownload);
    } catch (error) {
      // エラーメッセージをセット
      message.push(errorMessage);

      const { message: errMsg, stack } = error as Error;
      console.log(errMsg);

      if (stack) {
        message.push(`<pre><code>${stack}</code></pre>`);
      }

      return {
        ...defaultResponseData,
        ok: false,
        status: -1,
        statusText: 'exception occurred',
        message,
      };
    }
  };

  /**
   * データ取得（GET相当） - プロキシ経由
   * @param url - バックエンドAPIのURL
   * @param body - リクエストボディ（検索条件など）
   * @param headers - 追加のヘッダー
   * @returns レスポンスデータ
   */
  const get = async <T, V>(
    url: string,
    body?: V,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    return wrap<T>(
      fetch(
        '/api/proxy',
        getOptions(
          'POST',
          JSON.stringify({
            url,
            method: 'GET',
            body,
          }),
          headers
        )
      ),
      'データ取得に失敗しました。',
      false
    );
  };

  /**
   * データ作成（POST） - プロキシ経由
   * @param url - バックエンドAPIのURL
   * @param body - 作成データ
   * @param headers - 追加のヘッダー
   * @returns レスポンスデータ
   */
  const create = async <T, V>(
    url: string,
    body: V,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    return wrap<T>(
      fetch(
        '/api/proxy',
        getOptions(
          'POST',
          JSON.stringify({
            url,
            method: 'POST',
            body,
          }),
          headers
        )
      ),
      'データ作成に失敗しました。',
      false
    );
  };

  /**
   * データ更新（PUT） - プロキシ経由
   * @param url - バックエンドAPIのURL
   * @param body - 更新データ
   * @param headers - 追加のヘッダー
   * @returns レスポンスデータ
   */
  const update = async <T, V>(
    url: string,
    body: V,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    return wrap<T>(
      fetch(
        '/api/proxy',
        getOptions(
          'POST',
          JSON.stringify({
            url,
            method: 'PUT',
            body,
          }),
          headers
        )
      ),
      'データ更新に失敗しました。',
      false
    );
  };

  /**
   * データ削除（DELETE） - プロキシ経由
   * @param url - バックエンドAPIのURL
   * @param body - 削除対象の識別情報
   * @param headers - 追加のヘッダー
   * @returns レスポンスデータ
   */
  const del = async <T, V>(
    url: string,
    body: V,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    return wrap<T>(
      fetch(
        '/api/proxy',
        getOptions(
          'POST',
          JSON.stringify({
            url,
            method: 'DELETE',
            body,
          }),
          headers
        )
      ),
      'データ削除に失敗しました。',
      false
    );
  };

  /**
   * ファイルアップロード - プロキシ経由
   * 注意: httpOnlyのcookieを使用する場合、FormDataはプロキシAPIで特別な処理が必要
   * @param url - バックエンドAPIのURL
   * @param body - FormData（ファイルを含む）
   * @param headers - 追加のヘッダー
   * @returns レスポンスデータ
   */
  const upload = async <T>(
    url: string,
    body: FormData,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    // FormDataはプロキシ経由では複雑になるため、
    // 直接バックエンドにアップロードし、認証はhttpOnlyのcookieで処理
    return wrap<T>(
      fetch(url, {
        cache: 'no-store',
        credentials: 'include', // httpOnlyのcookieを含める
        method: 'POST',
        headers: {
          ...headers,
          // Content-Typeはブラウザが自動で設定（multipart/form-data）
        },
        body,
      }),
      'ファイルアップロードに失敗しました。',
      false
    );
  };

  /**
   * ファイルダウンロード - プロキシ経由
   * @param url - バックエンドAPIのURL
   * @param body - ダウンロード条件
   * @param headers - 追加のヘッダー
   * @returns レスポンスデータ
   */
  const download = async <V>(
    url: string,
    body?: V,
    headers?: Record<string, string>
  ): Promise<ResponseBase<undefined>> => {
    return wrap<undefined>(
      fetch(
        '/api/proxy',
        getOptions(
          'POST',
          JSON.stringify({
            url,
            method: 'POST',
            body,
          }),
          headers
        )
      ),
      'ファイルダウンロードに失敗しました。',
      true
    );
  };

  return {
    get,
    create,
    update,
    del,
    upload,
    download,
  };
};
