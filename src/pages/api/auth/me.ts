import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  return res.status(200).json({ user });
}
