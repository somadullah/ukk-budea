import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, u.username as peminjam, a.nama_alat, p.tanggal_pinjam, p.tanggal_kembali, p.status, 
               pg.denda, pg.kondisi_alat, pg.catatan
        FROM peminjaman p 
        JOIN users u ON p.user_id = u.id
        JOIN alat a ON p.alat_id = a.id
        LEFT JOIN pengembalian pg ON p.id = pg.peminjaman_id
        ORDER BY p.tanggal_pinjam DESC
      `);
      return res.status(200).json(rows);
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
