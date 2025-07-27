// Expressモジュールを読み込む
import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import { BACKEND_API_URL } from '../src/constants/index.ts';

const parseURL = new URL(BACKEND_API_URL);
const PORT = parseURL.port || 8000;

// Expressインスタンスを生成する
const app = express();
const router = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', router);

// ルートハンドラーを定義する
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Hello from the mock server',
  });
});

// APIエンドポイントのハンドラーを定義する
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
  });
});

// ログイン
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@example.com' && password === 'password') {
    const expires = 60 * 1000; // 1 minute in milliseconds
    try {
      const token = jwt.sign(
        {
          sub: 'userId',
          email: email,
          name: 'Admin User',
        },
        'SECRET_KEY',
        { expiresIn: expires }
      );

      res.cookie('jwt_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPSでのみ送信
        maxAge: expires,
        sameSite: 'strict',
        path: '/',
      });

      return res.status(200).json({
        status: 'ok',
        message: 'Login successful',
      });
    } catch {
      throw new Error('Token generation failed!');
    }
  } else {
    console.log('test');
    return res.status(422).json({
      status: 'error',
      message: 'Invalid credentials',
      errors: {
        email: 'Invalid email or password',
      },
    });
  }
});

// ログアウト
router.post('/logout', (req, res) => {
  try {
    res.cookie('jwt_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPSでのみ送信
      maxAge: -1,
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({
      status: 'ok',
      message: 'Logout successful',
    });
  } catch {
    throw new Error('Token generation failed!');
  }
});

app.listen(PORT, () => console.log(`listen on port... ${PORT}`));
