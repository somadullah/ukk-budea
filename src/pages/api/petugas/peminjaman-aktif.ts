import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  const user = verifyToken(token);
  if (!user || (user.role !== 'petugas' && user.role !== 'admin')) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, p.tanggal_pinjam, p.tanggal_kembali, p.status, 
               u.username as peminjam, a.nama_alat, a.gambar,
               p.kondisi_peminjam, p.catatan_peminjam
        FROM peminjaman p
        JOIN users u ON p.user_id = u.id
        JOIN alat a ON p.alat_id = a.id
        WHERE p.status IN ('dipinjam', 'kembali_diajukan')
        ORDER BY FIELD(p.status, 'kembali_diajukan', 'dipinjam'), p.tanggal_kembali ASC
      `);
      return res.status(200).json(rows);
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
