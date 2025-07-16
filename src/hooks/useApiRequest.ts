import { signOut } from '@/lib/auth/utils';
import type { ResponseBase } from '@/types/response';
import type { TFunction } from 'i18next';
import { forbidden, notFound, unauthorized } from 'next/navigation';
import { useTranslation } from 'react-i18next';

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
 * 'use client';
 *
 * import React, { useState, useEffect } from 'react';
 * import { useApiRequest } from '@/hooks/useApiRequest';
 * import type { User, CreateUserRequest } from '@/types';
 *
 * const UserManagementComponent = () => {
 *   const api = useApiRequest();
 *   const [users, setUsers] = useState<User[]>([]);
 *   const [loading, setLoading] = useState(false);
 *   const [selectedFile, setSelectedFile] = useState<File | null>(null);
 *
 *   // ユーザー一覧取得
 *   const fetchUsers = async () => {
 *     setLoading(true);
 *     const response = await api.get<User[]>('https://backend.example.com/api/users');
 *     if (response.ok && response.data) {
 *       setUsers(response.data);
 *     } else {
 *       console.error('ユーザー取得失敗:', response.message);
 *     }
 *     setLoading(false);
 *   };
 *
 *   // 新規ユーザー作成
 *   const createUser = async (userData: CreateUserRequest) => {
 *     const response = await api.create<User>('https://backend.example.com/api/users', userData);
 *     if (response.ok) {
 *       console.log('ユーザー作成成功:', response.data);
 *       await fetchUsers(); // 一覧を再取得
 *     } else {
 *       console.error('ユーザー作成失敗:', response.message);
 *     }
 *   };
 *
 *   // ユーザー情報更新
 *   const updateUser = async (id: number, userData: Partial<User>) => {
 *     const response = await api.update<User>(`https://backend.example.com/api/users/${id}`, userData);
 *     if (response.ok) {
 *       console.log('ユーザー更新成功:', response.data);
 *       await fetchUsers(); // 一覧を再取得
 *     }
 *   };
 *
 *   // ユーザー削除
 *   const deleteUser = async (id: number) => {
 *     const response = await api.del<void>('https://backend.example.com/api/users', { id });
 *     if (response.ok) {
 *       console.log('ユーザー削除成功');
 *       await fetchUsers(); // 一覧を再取得
 *     }
 *   };
 *
 *   // ファイルアップロード（プロフィール画像など）
 *   const handleFileUpload = async () => {
 *     if (!selectedFile) return;
 *
 *     const formData = new FormData();
 *     formData.append('file', selectedFile);
 *     formData.append('userId', '123');
 *
 *     const response = await api.upload('https://backend.example.com/api/upload/profile', formData);
 *     if (response.ok) {
 *       console.log('ファイルアップロード成功:', response.data);
 *     }
 *   };
 *
 *   // レポートダウンロード
 *   const downloadReport = async () => {
 *     const response = await api.download('https://backend.example.com/api/reports/users', {
 *       format: 'xlsx',
 *       dateRange: { start: '2024-01-01', end: '2024-12-31' }
 *     });
 *     if (response.ok) {
 *       console.log('レポートダウンロード完了');
 *     }
 *   };
 *
 *   // コンポーネント初期化時にユーザー一覧を取得
 *   useEffect(() => {
 *     fetchUsers();
 *   }, []);
 *
 *   return (
 *     <div>
 *       <h2>ユーザー管理</h2>
 *
 *       {loading && <p>読み込み中...</p>}
 *
 *       <ul>
 *         {users.map(user => (
 *           <li key={user.id}>
 *             {user.name} ({user.email})
 *             <button onClick={() => updateUser(user.id, { status: 'active' })}>
 *               有効化
 *             </button>
 *             <button onClick={() => deleteUser(user.id)}>削除</button>
 *           </li>
 *         ))}
 *       </ul>
 *
 *       <button onClick={() => createUser({ name: 'New User', email: 'new@example.com' })}>
 *         新規ユーザー作成
 *       </button>
 *
 *       <div>
 *         <input
 *           type="file"
 *           onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
 *         />
 *         <button onClick={handleFileUpload}>ファイルアップロード</button>
 *       </div>
 *
 *       <button onClick={downloadReport}>レポートダウンロード</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @returns APIリクエスト用のメソッド群
 */

/**
 * Next.jsのプロキシAPIのベースURL
 */
const nextApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

/**
 * バックエンドのLaravelへのリクエストはNext.jsのプロキシAPI経由で行います
 */
const proxy = `${nextApiBaseUrl}/api/proxy`;

/**
 * Next.jsのプロキシAPIへのリクエスト（ブラウザ → Next.jsのプロキシAPI）は必ずPOSTで行います
 */
const proxyRequestMethod = 'POST';

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
    cache: 'no-store', // キャッシュを無効化
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
 * ダウンロード処理
 */
const handleDownload = async (response: Response): Promise<void> => {
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
};

/**
 * 認証・認可エラーを処理
 */
const handleAuthErrors = async (status: number): Promise<void> => {
  if (status === 401) {
    // TODO: リフレッシュを試して再度401の場合はログイン画面に遷移
    unauthorized();
  } else if (status === 403) {
    forbidden();
  } else if (status === 404) {
    notFound();
  }
};

/**
 * APIのレスポンスを処理する
 * @param response - fetchのレスポンス
 * @param defaultResponseData - デフォルトのレスポンスデータ
 * @param message - エラーメッセージ配列
 * @param isDownload - ファイルダウンロードかどうか
 * @param t - 翻訳関数
 * @returns 処理されたレスポンスデータ
 */
const handler = async <T>(
  response: Response,
  defaultResponseData: ResponseBase<T>,
  message: string[],
  isDownload: boolean,
  t: TFunction
): Promise<ResponseBase<T>> => {
  const { ok, status, url, statusText } = response;

  // 正常レスポンスでファイルダウンロードの場合
  if (ok && isDownload) {
    await handleDownload(response);
    return { ...defaultResponseData, ok, status, statusText };
  }

  // 204(データ削除の場合のレスポンス)はレスポンスボディが存在しないので別処理
  if (status === 204) {
    return { ...defaultResponseData, ok: true, status, statusText };
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

  // 認証・認可エラーの処理
  await handleAuthErrors(status);

  switch (status) {
    case 405:
      message.push(t('common.ApiErrors.methodNotAllowed', { url }));
      break;
    case 409:
      message.push(t('common.ApiErrors.optimisticLock'));
      break;
    case 503:
      message.push(t('common.ApiErrors.maintenance'));
      break;
    default:
      message.push(t('common.ApiErrors.genericError', { status, url }));
  }

  return { ...defaultResponseData, ok, status, statusText, message };
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
  // 現在の言語を取得
  const { i18n, t } = useTranslation();

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
      return handler<T>(
        await task,
        defaultResponseData,
        message,
        isDownload,
        t
      );
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
        proxy,
        getOptions(
          proxyRequestMethod,
          JSON.stringify({
            url,
            method: 'GET',
            body,
            language: i18n.language, // 現在の言語を追加
          }),
          headers
        )
      ),
      t('common.ApiErrors.getData'),
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
        proxy,
        getOptions(
          proxyRequestMethod,
          JSON.stringify({
            url,
            method: 'POST',
            body,
            language: i18n.language, // 現在の言語を追加
          }),
          headers
        )
      ),
      t('common.ApiErrors.createData'),
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
        proxy,
        getOptions(
          proxyRequestMethod,
          JSON.stringify({
            url,
            method: 'PUT',
            body,
            language: i18n.language, // 現在の言語を追加
          }),
          headers
        )
      ),
      t('common.ApiErrors.updateData'),
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
        proxy,
        getOptions(
          proxyRequestMethod,
          JSON.stringify({
            url,
            method: 'DELETE',
            body,
            language: i18n.language, // 現在の言語を追加
          }),
          headers
        )
      ),
      t('common.ApiErrors.deleteData'),
      false
    );
  };

  /**
   * ファイルアップロード - プロキシ経由
   * TODO: アップロードのときはapplication/jsonではなく、multipart/form-dataを使用する必要がある
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
      t('common.ApiErrors.uploadFile'),
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
        proxy,
        getOptions(
          proxyRequestMethod,
          JSON.stringify({
            url,
            method: 'POST',
            body,
            language: i18n.language, // 現在の言語を追加
          }),
          headers
        )
      ),
      t('common.ApiErrors.downloadFile'),
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
