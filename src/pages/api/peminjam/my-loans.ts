import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  const user = verifyToken(token);
  if (!user || user.role !== 'peminjam') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT p.id, a.nama_alat, a.gambar, p.tanggal_pinjam, p.tanggal_kembali, p.status, pg.tanggal_dikembalikan, pg.denda
        FROM peminjaman p
        JOIN alat a ON p.alat_id = a.id
        LEFT JOIN pengembalian pg ON p.id = pg.peminjaman_id
        WHERE p.user_id = ?
        ORDER BY p.tanggal_pinjam DESC
      `, [user.id]);
      
      return res.status(200).json(rows);
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
