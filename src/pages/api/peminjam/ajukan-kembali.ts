import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  const user = verifyToken(token);
  if (!user || user.role !== 'peminjam') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'POST') {
    const { peminjaman_id, kondisi_peminjam, catatan_peminjam } = req.body;

    if (!peminjaman_id) {
      return res.status(400).json({ message: 'Missing peminjaman_id' });
    }

    try {
      // Ensure the loan belongs to the user and is currently 'dipinjam'
      const [loan] = await pool.query<RowDataPacket[]>(
        'SELECT id, status FROM peminjaman WHERE id = ? AND user_id = ?',
        [peminjaman_id, user.id]
      );

      if (!loan || loan.length === 0) {
        return res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
      }

      if (loan[0].status !== 'dipinjam') {
        return res.status(400).json({ message: 'Alat tidak dalam status dipinjam' });
      }

      // Update status to 'kembali_diajukan' and save borrower's report
      await pool.query(
        'UPDATE peminjaman SET status = ?, kondisi_peminjam = ?, catatan_peminjam = ? WHERE id = ?',
        ['kembali_diajukan', kondisi_peminjam || 'baik', catatan_peminjam || '', peminjaman_id]
      );

      // Log activity
      await pool.query(
        'INSERT INTO log_aktifitas (user_id, aksi) VALUES (?, ?)',
        [user.id, `Peminjam mengajukan pengembalian ID ${peminjaman_id}`]
      );

      return res.status(200).json({ message: 'Permintaan pengembalian dikirim. Silakan serahkan alat ke petugas.' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
