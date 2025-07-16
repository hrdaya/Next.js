/**
 * @fileoverview バックエンドAPIプロキシエンドポイント
 *
 * このファイルは、フロントエンドとバックエンドAPI間の安全な通信を仲介するプロキシサーバーを実装しています。
 * 主な機能：
 * - セキュアなJWT管理（httpOnlyクッキー ⇔ Bearerトークン変換）
 * - 国際化対応（X-Languageヘッダー自動付与）
 * - CORS問題の解決
 * - 統一されたエラーハンドリング
 * - クライアントサイドからのJWT隠蔽
 *
 * セキュリティ特徴：
 * - httpOnlyクッキーによるXSS攻撃防止
 * - JWT情報のクライアントサイド隠蔽
 * - Same-originポリシーによるCSRF対策
 * - プロダクション環境でのSecure Cookie強制
 *
 * @route POST /api/proxy
 * @security JWT management, httpOnly cookies, CORS handling
 * @dependencies Backend API Server (BACKEND_API_URL), getServerSession for JWT extraction
 */

import { BACKEND_API_URL } from '@/constants';
import { getServerSession } from '@/lib/auth/session';
import { setJwtCookie } from '@/lib/auth/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * バックエンドAPIへのプロキシ処理メイン関数
 *
 * フロントエンドからのAPIリクエストを安全にバックエンドサーバーに転送し、
 * レスポンスを適切に処理してクライアントに返します。
 *
 * 処理フロー：
 * 1. リクエストボディから転送先URL、HTTPメソッド、ボディデータを抽出
 * 2. サーバーサイドセッションからJWTを取得
 * 3. 国際化対応：現在言語をX-Languageヘッダーに設定
 * 4. バックエンドAPIへリクエスト送信（JWT付き）
 * 5. レスポンス処理：新しいJWTがあればhttpOnlyクッキーに保存
 * 6. セキュリティ：Authorizationヘッダーをクライアントレスポンスから削除
 *
 * セキュリティメカニズム：
 * - JWT管理：httpOnlyクッキー（読み取り専用）⇔ Bearerトークン（バックエンド用）変換
 * - クライアント隠蔽：JWTや認証情報をフロントエンドJavaScriptから完全に隠蔽
 * - 自動更新：バックエンドから新しいJWTが返された場合の自動更新機能
 *
 * 国際化機能：
 * - リクエストボディのlanguageパラメータを最優先
 * - Accept-Languageヘッダーからの自動言語検出
 * - バックエンドAPIでの適切な言語レスポンス生成支援
 *
 * @param request - フロントエンドからのプロキシリクエスト
 * @returns Promise<NextResponse> - プロキシされたレスポンス（JWT情報除去済み）
 *
 * @example
 * ```tsx
 * // useApiRequestフックを使用した推奨方法
 * 'use client';
 *
 * import { useApiRequest } from '@/hooks/useApiRequest';
 * import { useState } from 'react';
 *
 * const UserComponent = () => {
 *   const api = useApiRequest();
 *   const [users, setUsers] = useState([]);
 *
 *   // ユーザー一覧取得
 *   const fetchUsers = async () => {
 *     const response = await api.get('https://backend.example.com/api/users');
 *     if (response.ok) {
 *       setUsers(response.data);
 *     }
 *   };
 *
 *   // 新規ユーザー作成
 *   const createUser = async () => {
 *     const response = await api.create('https://backend.example.com/api/users', {
 *       name: 'John Doe',
 *       email: 'john@example.com'
 *     });
 *     if (response.ok) {
 *       console.log('ユーザー作成成功:', response.data);
 *       fetchUsers(); // 一覧を再取得
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={fetchUsers}>ユーザー一覧取得</button>
 *       <button onClick={createUser}>新規ユーザー作成</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // 直接プロキシAPIを呼び出す場合（非推奨）
 * // useApiRequestフックの使用を強く推奨します
 * const response = await fetch('/api/proxy', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     url: 'https://backend.example.com/api/users',
 *     method: 'GET',
 *     language: 'ja' // オプション：明示的な言語指定
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: リクエストボディからプロキシパラメータを抽出
    // フロントエンドから送信される転送先情報とオプションパラメータの取得
    const { url, method = 'POST', body, language } = await request.json();

    // Step 2: 基本バリデーション
    // 転送先URLは必須パラメータ（セキュリティのため空値チェック）
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Step 3: サーバーサイドセッションからJWT認証トークンを取得
    // httpOnlyクッキーに保存されたJWTを安全に読み取り
    // クライアントサイドJavaScriptからはアクセス不可能
    const jwt = await getServerSession();

    // Step 4: バックエンドリクエスト用ヘッダーの準備
    // デフォルトでJSON通信を想定、後続でJWTと言語情報を追加
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Step 5: JWT認証ヘッダーの設定
    // サーバーサイドでJWTをBearerトークン形式に変換してバックエンドに送信
    // これによりクライアントサイドからJWT情報を完全に隠蔽
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }

    // Step 6: 国際化対応 - 言語情報のX-Languageヘッダー設定
    // バックエンドAPIが適切な言語でレスポンスを返すための言語情報の送信
    // 優先順位: 1) リクエストボディのlanguageパラメータ > 2) Accept-Languageヘッダー
    let targetLanguage = language;
    if (!targetLanguage) {
      // Accept-Languageヘッダーから言語コードを抽出
      // 例: "ja,en;q=0.9,fr;q=0.8" -> "ja" を抽出
      const acceptLanguage = request.headers.get('Accept-Language');
      if (acceptLanguage) {
        // Accept-Languageから最初の言語コードを抽出（品質値やサブタグを除去）
        targetLanguage = acceptLanguage.split(',')[0].split(';')[0].trim();
      }
    }

    // バックエンドが国際化対応している場合、X-Languageヘッダーで言語を通知
    // これによりバックエンドは適切な言語でエラーメッセージやコンテンツを返すことが可能
    if (targetLanguage) {
      headers['X-Language'] = targetLanguage;
    }

    // Step 7: バックエンドAPIへのリクエスト送信
    // JWT認証ヘッダーと言語情報を含めてバックエンドサーバーに転送
    // GETリクエストの場合はボディを送信しない（HTTP仕様遵守）
    const backendResponse = await fetch(BACKEND_API_URL + url, {
      method,
      headers,
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    // Step 8: バックエンドレスポンスの解析
    // JSON解析に失敗した場合は空オブジェクトを返す（安全なフォールバック）
    // バイナリデータやHTML等のレスポンスでもエラーにならないよう配慮
    const responseData = await backendResponse.json().catch(() => ({}));

    // Step 9: クライアント向けレスポンスの作成
    // バックエンドのレスポンスデータとステータス情報をそのまま転送
    // HTTPステータスコードとメッセージもプロキシして一貫性を保つ
    const clientResponse = NextResponse.json(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Step 10: JWT自動更新機能
    // バックエンドから新しいJWTが返された場合の処理
    const responseAuthHeader = backendResponse.headers.get('Authorization');

    // バックエンドからJWTが返された場合、httpOnlyのcookieに安全に保存
    // 認証の更新（リフレッシュトークン、権限変更等）に対応
    if (responseAuthHeader?.startsWith('Bearer ')) {
      // "Bearer "プレフィックスを除去してJWT本体を抽出
      const newJwt = responseAuthHeader.substring(7);

      // Step 11: httpOnlyクッキーへのJWT保存
      // setJwtCookie関数を使用して一貫したクッキー設定を適用
      // XSS攻撃防止、CSRF攻撃防止、本番環境でのHTTPS必須等のセキュリティ設定を統一
      setJwtCookie(clientResponse, newJwt);

      // Step 12: セキュリティ処理 - Authorizationヘッダーの削除
      // クライアントレスポンスからJWT情報を完全に除去
      // フロントエンドJavaScriptからJWTにアクセスできないようにする
      // httpOnlyクッキーを使用するため、Authorizationヘッダーは不要
      clientResponse.headers.delete('Authorization');
    }

    // Step 13: 正常終了
    // プロキシ処理完了：JWT情報が安全に処理されたクリーンなレスポンスを返す
    return clientResponse;
  } catch (error) {
    // Step 14: エラーハンドリング
    // ネットワークエラー、JSONパースエラー、バックエンド接続エラー等の包括的処理
    // セキュリティのため詳細なエラー情報は隠蔽し、ログにのみ出力
    console.error('Backend proxy error:', error);

    // 統一されたエラーレスポンス（500 Internal Server Error）
    // 攻撃者に内部システム情報を漏洩させないよう一般的なメッセージを返す
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
