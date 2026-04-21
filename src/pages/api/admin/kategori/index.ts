import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ResultSetHeader } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM kategori');
      return res.status(200).json(rows);
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  // Admin only below this point
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'POST') {
    const { nama_kategori } = req.body;
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO kategori (nama_kategori) VALUES (?)', [nama_kategori]);
      return res.status(201).json({ id: result.insertId, nama_kategori });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
