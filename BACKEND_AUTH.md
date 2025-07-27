# Laravel (`tymon/jwt-auth`) と Next.js (SSR) での認証連携

Laravel側でJWTを生成し、それをNext.jsのSSRページで利用するためのアプローチは、HTTP Only Cookieです。これは、JWTをJavaScriptから直接アクセスできない安全な場所に保存しつつ、SSRでのリクエスト時にサーバーからサーバーへ自動的に送信されるためです。

CORSを考慮しなくても良いように、Next.jsからのリクエストは必ず `/api/proxy` 経由で行うようにします。  
`/api/proxy` ではLaravelからのレスポンスのヘッダに`Set-Cookie`が含まれる場合はドメインをNext.jsのものに変更してブラウザにレスポンスするようにし、リクエスト時にはcookieからjwtを取得してAuthorizationヘッダにBearerトークンとしてセットします。

こうすることでJavascriptからはJWTを隠しながら、CORSを考慮しなくても良いようになります。

## Laravel (`tymon/jwt-auth`) 側の設定

Laravel側では、ログイン成功時にJWT（アクセストークン）を生成し、それをHTTP Only CookieとしてNext.jsに送り返します。

### JWT生成とCookieへのセット

`tymon/jwt-auth` を使用してログイン処理を実装します。ログイン成功後、生成したJWTをHTTP OnlyかつSecureなCookieとしてレスポンスに含めます。

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * ユーザーを認証し、JWTを返す
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        // ログイン処理
        $token = JWTAuth::attempt($credentials);

        if (! $token) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'message' => 'Login successful',
        ])->cookie($this->getCookie($token));
    }

    /**
     * ユーザーをログアウトし、JWTを無効にする
     */
    public function logout()
    {
        // トークンを無効化
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'message' => 'Successfully logged out',
        ])->cookie($this->getCookie(null, -1));
    }

    /**
     * トークンをリフレッシュする
     */
    public function refresh()
    {
        try {
            // 新しいトークンでCookieを更新
            return response()->json([
                'message' => 'Token refreshed successfully',
            ])->cookie($this->getCookie(JWTAuth::refresh()));

        } catch (TokenInvalidException $e) {
            // 無効なトークンだった場合
            return response()->json(['error' => 'Token is invalid'], 401);
        } catch (TokenExpiredException $e) {
            // このエンドポイントは通常、期限切れのトークンでもリフレッシュできるはず
            // ただし、リフレッシュトークンも期限切れの場合は再ログインが必要
            return response()->json(['error' => 'Token has expired and cannot be refreshed'], 401);
        }
    }

    /**
     * 認証済みユーザー情報を取得
     */
    public function user()
    {
        return response()->json(auth()->user());
    }

    /**
     * クッキーを取得する
     */
    private function getCookie(?string $token, ?int $ttl = null): Cookie
    {
        $secure = $request->getScheme() === 'https';

        // 秒単位
        $ttl ??= config('jwt.ttl') * 60;

        return cookie(
            'jwt_token', // Cookie名
            $token,      // JWTの値
            $ttl,        // 有効期限 (分)
            '/',         // パス
            null,        // ドメイン (nullは現在のドメイン)
            $secure,     // Secure (HTTPSのみ送信) - クローズドネットワークでも推奨
            true,        // HttpOnly (JavaScriptからアクセス不可)
            false,       // Raw (エンコードしない)
            'Strict'     // SameSite属性
        );
    }
}
```

### トークンの自動リフレッシュ

[Laravel での tymon/jwt-auth による JWT トークンの自動更新 #Laravel - Qiita](https://qiita.com/yh1224/items/bd00e85d5c53350e93ca)

```php
<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Http\Middleware\BaseMiddleware;

/**
 * JWTを自動で更新するミドルウェア
 */
class RefreshToken extends BaseMiddleware
{
    public function handle($request, Closure $next)
    {
        $newToken = null;

        try {
            $token = $this->auth->parseToken();
            $token->authenticate();
        } catch (TokenExpiredException $e) {
            // 有効期限切れ
            try {
                // 新しいトークンを取得
                $newToken = $token->refresh();
            } catch (TokenExpiredException $e) {
                // リフレッシュトークンも期限切れの場合は再ログインが必要
            }
        } catch (TokenInvalidException $e) {
            // 無効なトークン
        }

        // 処理を実行
        $response = $next($request);

        if ($newToken) {
            $ttl = config('jwt.ttl') * 60;
            $secure = $request->getScheme() === 'https';

            // 新しいトークンがセットされている場合はクッキーを更新
            $cookie = cookie(
                'jwt_token', // Cookie名
                $newToken,   // JWTの値
                $ttl,        // 有効期限 (分)
                '/',         // パス
                null,        // ドメイン (nullは現在のドメイン)
                $secure,     // Secure (HTTPSのみ送信) - クローズドネットワークでも推奨
                true,        // HttpOnly (JavaScriptからアクセス不可)
                false,       // Raw (エンコードしない)
                'Strict'     // SameSite属性
            );

            // レスポンスにクッキーをセット
            $response->withCookie($cookie);
        }

        return $response;
    }
}
```

## Next.js (SSR) 側の設定

Next.js側では、`/api/proxy` 経由で必ず通信することによりCookieの管理や認証の管理を行うことができます。
