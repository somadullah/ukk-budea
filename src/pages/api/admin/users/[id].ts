import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return res.status(200).json({ message: 'User deleted' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  if (req.method === 'PUT') {
    const { username, password, role } = req.body;
    try {
      if (password && password.trim() !== '') {
        // Update with new password
        await pool.query(
          'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?',
          [username, password, role, id]
        );
      } else {
        // Update without changing password
        await pool.query(
          'UPDATE users SET username = ?, role = ? WHERE id = ?',
          [username, role, id]
        );
      }
      return res.status(200).json({ message: 'User updated' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
