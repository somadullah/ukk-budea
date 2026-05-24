import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT id, username, role, nomor_telepon, kelas, email, created_at FROM users WHERE role != \'admin\'');
      return res.status(200).json(rows);
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  if (req.method === 'POST') {
    const { username, password, role, nomor_telepon, kelas, email } = req.body;
    
    // Allowing admin to be added but it won't be shown in the list as per user request
    if (role !== 'peminjam' && role !== 'petugas' && role !== 'admin' && role !== 'guru') {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO users (username, password, role, nomor_telepon, kelas, email) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, role, nomor_telepon, kelas, email]
      );
      return res.status(201).json({ id: result.insertId, username, role });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Username sudah digunakan' });
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
