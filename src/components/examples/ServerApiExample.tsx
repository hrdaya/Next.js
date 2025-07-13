/**
 * サーバーサイドAPI使用例
 *
 * Server ComponentでのfetchServerData使用方法を示すサンプルコンポーネント
 */

import { fetchServerData } from '@/hooks';
import type { User } from '@/types';
import type { ResponseBase } from '@/types/response';

interface ServerApiExampleProps {
  userId?: string;
}

// エラー情報表示コンポーネント
function ErrorDetails({
  usersResponse,
  userDetailResponse,
}: {
  usersResponse: ResponseBase<User[]>;
  userDetailResponse: ResponseBase<User> | null;
}) {
  if (usersResponse.ok && (!userDetailResponse || userDetailResponse.ok)) {
    return null;
  }

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2 text-red-600">エラー詳細</h2>
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        {!usersResponse.ok && (
          <div className="mb-2">
            <p>
              <strong>ユーザー一覧取得エラー:</strong>
            </p>
            <p>
              ステータス: {usersResponse.status} ({usersResponse.statusText})
            </p>
            <p>
              メッセージ:{' '}
              {Array.isArray(usersResponse.message)
                ? usersResponse.message.join(', ')
                : usersResponse.message}
            </p>
          </div>
        )}
        {userDetailResponse && !userDetailResponse.ok && (
          <div>
            <p>
              <strong>ユーザー詳細取得エラー:</strong>
            </p>
            <p>
              ステータス: {userDetailResponse.status} (
              {userDetailResponse.statusText})
            </p>
            <p>
              メッセージ:{' '}
              {Array.isArray(userDetailResponse.message)
                ? userDetailResponse.message.join(', ')
                : userDetailResponse.message}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ユーザー一覧表示コンポーネント
function UsersList({ usersResponse }: { usersResponse: ResponseBase<User[]> }) {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">ユーザー一覧</h2>
      {usersResponse.ok && usersResponse.data ? (
        <ul className="space-y-2">
          {usersResponse.data.map((user) => (
            <li key={user.id} className="p-2 border rounded">
              <span className="font-medium">{user.name}</span>
              <span className="text-gray-600 ml-2">({user.email})</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-red-500">ユーザー一覧の取得に失敗しました</p>
      )}
    </section>
  );
}

export default async function ServerApiExample({
  userId,
}: ServerApiExampleProps) {
  // ユーザー一覧を取得（POST専用なので空オブジェクトを送信）
  const usersResponse = await fetchServerData<User[]>('/api/users', {});

  // 特定のユーザー情報を取得（userIdが指定されている場合）
  let userDetailResponse: ResponseBase<User> | null = null;
  if (userId) {
    userDetailResponse = await fetchServerData<User>(`/api/users/${userId}`, {
      userId, // IDをボディで送信
    });
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Server API Example</h1>

      <UsersList usersResponse={usersResponse} />

      <ErrorDetails
        usersResponse={usersResponse}
        userDetailResponse={userDetailResponse}
      />

      {/* 特定ユーザーの詳細表示 */}
      {userId && userDetailResponse && (
        <section>
          <h2 className="text-xl font-semibold mb-2">
            ユーザー詳細 (ID: {userId})
          </h2>
          {userDetailResponse.ok && userDetailResponse.data ? (
            <div className="p-4 border rounded bg-gray-50">
              <p>
                <strong>名前:</strong> {userDetailResponse.data.name}
              </p>
              <p>
                <strong>メール:</strong> {userDetailResponse.data.email}
              </p>
              <p>
                <strong>ID:</strong> {userDetailResponse.data.id}
              </p>
            </div>
          ) : (
            <p className="text-red-500">ユーザー詳細の取得に失敗しました</p>
          )}
        </section>
      )}
    </div>
  );
}
