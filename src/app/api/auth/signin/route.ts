import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * リクエストからemail/passwordを抽出
 */
async function extractCredentials(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const jsonData = await request.json();
    return {
      email: jsonData.email,
      password: jsonData.password,
      isFormData: false,
    };
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    return {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      isFormData: true,
    };
  }

  throw new Error('Unsupported content type');
}

/**
 * エラーレスポンスを作成
 */
function createErrorResponse(
  request: NextRequest,
  error: string,
  status: number,
  isFormData: boolean
) {
  if (isFormData) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/signin?error=${encodeURIComponent(error)}`
    );
  }
  return NextResponse.json({ error }, { status });
}

/**
 * 成功レスポンスを作成
 */
function createSuccessResponse(
  request: NextRequest,
  authData: { user?: unknown },
  proxyResponse: Response,
  isFormData: boolean
) {
  let response: NextResponse;

  if (isFormData) {
    response = NextResponse.redirect(`${request.nextUrl.origin}/`);
  } else {
    response = NextResponse.json({
      success: true,
      user: authData.user,
    });
  }

  // プロキシAPIで設定されたCookieを転送
  const cookies = proxyResponse.headers.get('set-cookie');
  if (cookies) {
    response.headers.set('set-cookie', cookies);
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, isFormData } = await extractCredentials(request);

    if (!email || !password) {
      return createErrorResponse(
        request,
        'Email and password are required',
        400,
        isFormData
      );
    }

    const authServerUrl =
      process.env.BACKEND_API_URL || 'http://localhost:8080';

    // プロキシAPIを使用して認証を行う
    const proxyResponse = await fetch(`${request.nextUrl.origin}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${authServerUrl}/auth/signin`,
        method: 'POST',
        body: { email, password },
      }),
    });

    if (!proxyResponse.ok) {
      const errorData = await proxyResponse.json().catch(() => ({}));
      return createErrorResponse(
        request,
        errorData.error || 'Invalid credentials',
        proxyResponse.status,
        isFormData
      );
    }

    const authData = await proxyResponse.json();
    return createSuccessResponse(request, authData, proxyResponse, isFormData);
  } catch (error) {
    console.error('Auth server connection error:', error);

    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes(
      'application/x-www-form-urlencoded'
    );

    return createErrorResponse(
      request,
      'Authentication server unavailable',
      503,
      isFormData
    );
  }
}
