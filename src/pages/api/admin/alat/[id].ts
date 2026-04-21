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
      await pool.query('DELETE FROM alat WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Alat deleted' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  if (req.method === 'PUT') {
    const { nama_alat, deskripsi, jumlah, kategori_id, gambar } = req.body;
    try {
      const dbKategoriId = kategori_id === '' || !kategori_id ? null : parseInt(kategori_id);
      await pool.query(
        'UPDATE alat SET nama_alat = ?, deskripsi = ?, jumlah = ?, kategori_id = ?, gambar = ? WHERE id = ?',
        [nama_alat, deskripsi, jumlah, dbKategoriId, gambar, id]
      );
      return res.status(200).json({ message: 'Alat updated' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
