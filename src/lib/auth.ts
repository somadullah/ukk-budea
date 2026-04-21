import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'rahasia_negara_super_kuat';

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'petugas' | 'peminjam';
}

export function signToken(payload: AuthUser) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded as AuthUser;
  } catch {
    return null;
  }
}
