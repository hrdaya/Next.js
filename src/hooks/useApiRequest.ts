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
 * @returns APIリクエスト用のメソッド群
 */

import { NEXT_PUBLIC_API_BASE_URL } from '@/constants';
import type { ResponseBase } from '@/types/response';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

/**
 * バックエンドのLaravelへのリクエストはNext.jsのプロキシAPI経由で行います
 */
const proxy = `${NEXT_PUBLIC_API_BASE_URL}/proxy`;

/**
 * Next.jsのプロキシAPIへのリクエスト（ブラウザ → Next.jsのプロキシAPI）は必ずPOSTで行います
 */
const proxyRequestMethod = 'POST';

/**
 * デフォルトのコンテンツタイプ
 * - JSONを使用する場合は 'application/json'
 * - ファイルアップロードの場合は 'multipart/form-data'
 */
const defaultContentsType = 'application/json';

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
  contentsType: string,
  headers?: Record<string, string>,
  body?: string | FormData
): RequestInit => {
  let jsonContentType = {};

  if (contentsType === defaultContentsType) {
    jsonContentType = {
      'Content-Type': defaultContentsType,
      'X-Requested-With': 'XMLHttpRequest', // AJAXリクエストを示すヘッダー
    };
  }

  return {
    cache: 'no-store', // キャッシュを無効化
    credentials: 'include', // httpOnlyのcookieを含める
    method, // HTTPメソッドを設定
    headers: {
      ...headers,
      ...jsonContentType,
    },
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
 * APIのレスポンスを処理する
 * @param task - fetchのレスポンス
 * @param defaultResponseData - デフォルトのレスポンスデータ
 * @param message - エラーメッセージ配列
 * @param isDownload - ファイルダウンロードかどうか
 * @param t - 翻訳関数
 * @returns 処理されたレスポンスデータ
 */
const responseHandler = async <T>(
  response: Response,
  defaultResponseData: ResponseBase<T>,
  errorMessage: string,
  isDownload: boolean,
  t: TFunction
): Promise<ResponseBase<T>> => {
  const { ok, status, statusText } = response;

  defaultResponseData.status = status;
  defaultResponseData.statusText = statusText;

  // 正常レスポンスでファイルダウンロードの場合
  if (ok && isDownload) {
    await handleDownload(response);

    return { ...defaultResponseData, ok };
  }

  // レスポンスボディを初期化
  // JSONレスポンスを期待するため、初期値はundefined
  let payload = undefined;

  try {
    // レスポンスボディをJSONとしてパース
    payload = (await response.json()) || {};
  } catch (error) {
    console.warn('Failed to parse JSON response:', error);

    return {
      ...defaultResponseData,
      ok: false,
      message: errorMessage || t('common.ApiErrors.invalidResponseFormat'),
    };
  }

  // 正常レスポンスもしくはバリデーションエラーの場合
  if (ok || status === 422) {
    return {
      ...defaultResponseData,
      ok: true,
      ...(payload as T),
    };
  }

  switch (status) {
    case 400:
      // クライアントエラー（不正なリクエスト）
      defaultResponseData.message = t('common.ApiErrors.badRequest');
      break;
    case 401:
      // 認証エラー
      defaultResponseData.message = t('common.ApiErrors.unauthorized');
      break;
    case 403:
      // 認可エラー
      defaultResponseData.message = t('common.ApiErrors.forbidden');
      break;
    case 404:
      // データが存在しない
      defaultResponseData.message = t('common.ApiErrors.notFound');
      break;
    case 405:
      // メソッドが許可されていない
      defaultResponseData.message = t('common.ApiErrors.methodNotAllowed');
      break;
    case 409:
      // 楽観的ロックエラー（CSRF並びにCoolieの期限切れ）
      defaultResponseData.message = t('common.ApiErrors.optimisticLock');
      break;
    case 503:
      // メンテナンス中
      defaultResponseData.message = t('common.ApiErrors.maintenance');
      break;
    default:
      // その他のエラー
      defaultResponseData.message = errorMessage;
  }

  return { ...defaultResponseData, ok: false };
};

/**
 * useApiRequest フックの戻り値の型定義
 */
interface useApiRequestValue {
  /** データ取得用メソッド */
  get: <T, V>(
    url: string,
    body?: V,
    errorMessage?: string,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** データ作成用メソッド */
  create: <T, V>(
    url: string,
    body: V,
    errorMessage?: string,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** データ更新用メソッド */
  update: <T, V>(
    url: string,
    body: V,
    errorMessage?: string,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** データ削除用メソッド */
  del: <T, V>(
    url: string,
    body: V,
    errorMessage?: string,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
  /** ファイルダウンロード用メソッド */
  download: <V>(
    url: string,
    body?: V,
    errorMessage?: string,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<undefined>>;
  /** ファイルアップロード用メソッド */
  upload: <T>(
    url: string,
    body: FormData,
    errorMessage?: string,
    headers?: Record<string, string>
  ) => Promise<ResponseBase<T>>;
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
  const fetchWrap = async <T>(
    task: Promise<Response>,
    errorMessage: string,
    isDownload: boolean
  ): Promise<ResponseBase<T>> => {
    // レスポンスの初期値
    const defaultResponseData: ResponseBase<T> = {
      ok: false,
      status: -1,
      statusText: 'Unknown',
      message: '',
      data: undefined as T,
    };

    try {
      return responseHandler<T>(
        await task,
        defaultResponseData,
        errorMessage,
        isDownload,
        t
      );
    } catch (error) {
      // エラーメッセージをセット
      defaultResponseData.message = errorMessage;

      // エラーの詳細をログに出力
      console.error('API request failed:', error);

      return defaultResponseData;
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
    errorMessage?: string,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    return fetchWrap<T>(
      fetch(
        proxy,
        getOptions(
          proxyRequestMethod,
          defaultContentsType,
          headers,
          JSON.stringify({
            url,
            method: 'GET',
            body,
            language: i18n.language, // 現在の言語を追加
          })
        )
      ),
      errorMessage || t('common.ApiErrors.getData'),
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
    errorMessage?: string,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    return fetchWrap<T>(
      fetch(
        proxy,
        getOptions(
          proxyRequestMethod,
          defaultContentsType,
          headers,
          JSON.stringify({
            url,
            method: 'POST',
            body,
            language: i18n.language, // 現在の言語を追加
          })
        )
      ),
      errorMessage || t('common.ApiErrors.createData'),
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
    errorMessage?: string,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    return fetchWrap<T>(
      fetch(
        proxy,
        getOptions(
          proxyRequestMethod,
          defaultContentsType,
          headers,
          JSON.stringify({
            url,
            method: 'PUT',
            body,
            language: i18n.language, // 現在の言語を追加
          })
        )
      ),
      errorMessage || t('common.ApiErrors.updateData'),
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
    errorMessage?: string,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    return fetchWrap<T>(
      fetch(
        proxy,
        getOptions(
          proxyRequestMethod,
          defaultContentsType,
          headers,
          JSON.stringify({
            url,
            method: 'DELETE',
            body,
            language: i18n.language, // 現在の言語を追加
          })
        )
      ),
      errorMessage || t('common.ApiErrors.deleteData'),
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
    errorMessage?: string,
    headers?: Record<string, string>
  ): Promise<ResponseBase<undefined>> => {
    return fetchWrap<undefined>(
      fetch(
        proxy,
        getOptions(
          proxyRequestMethod,
          defaultContentsType,
          headers,
          JSON.stringify({
            url,
            method: 'POST',
            body,
            language: i18n.language, // 現在の言語を追加
          })
        )
      ),
      errorMessage || t('common.ApiErrors.downloadFile'),
      true
    );
  };

  /**
   * ファイルアップロード - プロキシ経由
   * @param url - バックエンドAPIのURL
   * @param body - FormData（ファイルを含む）
   * @param headers - 追加のヘッダー
   * @returns レスポンスデータ
   */
  const upload = async <T>(
    url: string,
    body: FormData,
    errorMessage?: string,
    headers?: Record<string, string>
  ): Promise<ResponseBase<T>> => {
    // Proxyで使用するデータをFormDataにセット
    body.append('proxy_url', url);
    body.append('proxy_method', 'POST');
    body.append('proxy_language', i18n.language); // 現在の言語を追加

    // FormDataはプロキシ経由では複雑になるため、
    // 直接バックエンドにアップロードし、認証はhttpOnlyのcookieで処理
    return fetchWrap<T>(
      fetch(
        proxy,
        getOptions(
          proxyRequestMethod,
          'multipart/form-data', // 明示的にmultipart/form-dataを指定
          headers,
          body // FormDataをそのまま使用
        )
      ),
      errorMessage || t('common.ApiErrors.uploadFile'),
      false
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
