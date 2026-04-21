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
      await pool.query('DELETE FROM kategori WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Kategori deleted' });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Tidak bisa menghapus kategori yang masih digunakan oleh alat.' });
      }
      return res.status(500).json({ message: 'Database error' });
    }
  }

  if (req.method === 'PUT') {
    const { nama_kategori } = req.body;
    try {
      await pool.query('UPDATE kategori SET nama_kategori = ? WHERE id = ?', [nama_kategori, id]);
      return res.status(200).json({ message: 'Kategori updated' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
