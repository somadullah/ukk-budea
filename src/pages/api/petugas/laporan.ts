import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

interface CountSummary extends RowDataPacket {
  count: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  const user = verifyToken(token);
  if (!user || (user.role !== 'petugas' && user.role !== 'admin')) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      const [[totalLoans]] = await pool.query<CountSummary[]>('SELECT COUNT(*) as count FROM peminjaman');
      const [[activeLoans]] = await pool.query<CountSummary[]>('SELECT COUNT(*) as count FROM peminjaman WHERE status = "dipinjam"');
      const [[returnedLoans]] = await pool.query<CountSummary[]>('SELECT COUNT(*) as count FROM peminjaman WHERE status = "dikembalikan"');
      
      const [activities] = await pool.query<RowDataPacket[]>(`
        SELECT p.id, u.username, a.nama_alat, p.tanggal_pinjam, p.tanggal_kembali, p.status, 
               pg.tanggal_dikembalikan, pg.denda, pg.kondisi_alat, pg.catatan, pg.status_denda
        FROM peminjaman p
        JOIN users u ON p.user_id = u.id
        JOIN alat a ON p.alat_id = a.id
        LEFT JOIN pengembalian pg ON p.id = pg.peminjaman_id
        ORDER BY p.tanggal_pinjam DESC
      `);

      return res.status(200).json({
        summary: {
          total: totalLoans?.count || 0,
          active: activeLoans?.count || 0,
          returned: returnedLoans?.count || 0
        },
        activities
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
