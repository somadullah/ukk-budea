import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[API] ${req.method} request to /api/admin/users/[id]`);
  const token = req.cookies.auth_token;
  if (!token) {
    console.warn(`[API] Missing auth_token cookie. Cookies received:`, req.cookies);
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    console.warn(`[API] Invalid token or insufficient role:`, user);
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return res.status(200).json({ message: 'User deleted' });
    } catch (err: any) {
      console.error('Delete error:', err);
      return res.status(500).json({ 
        message: 'Database error', 
        error: err.message || 'Unknown error',
        code: err.code
      });
    }
  }

  if (req.method === 'PUT') {
    const { username, password, role, nomor_telepon, kelas, email } = req.body;
    try {
      if (password && password.trim() !== '') {
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          'UPDATE users SET username = ?, password = ?, role = ?, nomor_telepon = ?, kelas = ?, email = ? WHERE id = ?',
          [username, hashedPassword, role, nomor_telepon, kelas, email, id]
        );
      } else {
        // Update without changing password
        await pool.query(
          'UPDATE users SET username = ?, role = ?, nomor_telepon = ?, kelas = ?, email = ? WHERE id = ?',
          [username, role, nomor_telepon, kelas, email, id]
        );
      }
      return res.status(200).json({ message: 'User updated' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
