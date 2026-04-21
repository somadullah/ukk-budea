import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  profile_image: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ message: 'Invalid token' });

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query<UserRow[]>(
        'SELECT id, username, full_name, email, bio, profile_image FROM users WHERE id = ?',
        [user.id]
      );
      if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json(rows[0]);
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  if (req.method === 'PUT') {
    const { full_name, email, bio, profile_image } = req.body;
    try {
      await pool.query<ResultSetHeader>(
        'UPDATE users SET full_name = ?, email = ?, bio = ?, profile_image = ? WHERE id = ?',
        [full_name, email, bio, profile_image, user.id]
      );

      // Log activity
      await pool.query(
        'INSERT INTO log_aktifitas (user_id, aksi) VALUES (?, ?)',
        [user.id, `Memperbarui profil akun`]
      );

      return res.status(200).json({ message: 'Profile updated successfully' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
