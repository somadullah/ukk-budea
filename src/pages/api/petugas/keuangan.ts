import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  const user = verifyToken(token);
  if (!user || (user.role !== 'petugas' && user.role !== 'admin')) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      // 1. Get total collected fines (Lunas)
      const [[{ collected }]] = await pool.query<RowDataPacket[]>('SELECT SUM(denda) as collected FROM pengembalian WHERE status_denda = "lunas"');
      
      // 2. Get pending fines (Belum Lunas)
      const [[{ pending }]] = await pool.query<RowDataPacket[]>('SELECT SUM(denda) as pending FROM pengembalian WHERE status_denda = "belum_lunas"');

      // 3. Get detailed financial history
      const [history] = await pool.query<RowDataPacket[]>(`
        SELECT pg.id as invoice_id, u.username as peminjam, a.nama_alat, a.harga as nilai_barang,
               pg.tanggal_dikembalikan, pg.denda, pg.kondisi_alat, pg.catatan, pg.status_denda,
               petugas.username as nama_petugas
        FROM pengembalian pg
        JOIN peminjaman p ON pg.peminjaman_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN alat a ON p.alat_id = a.id
        LEFT JOIN users petugas ON pg.petugas_id = petugas.id
        WHERE pg.denda > 0
        ORDER BY pg.status_denda ASC, pg.tanggal_dikembalikan DESC
      `);

      return res.status(200).json({
        summary: {
          collected: collected || 0,
          pending: pending || 0
        },
        history
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
