import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const user = verifyToken(token);
  if (!user || user.role !== 'petugas') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, p.tanggal_pinjam, p.tanggal_kembali, p.status, 
               u.username as peminjam, a.nama_alat, a.gambar 
        FROM peminjaman p
        JOIN users u ON p.user_id = u.id
        JOIN alat a ON p.alat_id = a.id
        WHERE p.status = 'menunggu'
      `);
      return res.status(200).json(rows);
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  if (req.method === 'POST') {
    const { peminjaman_id, aksi } = req.body; // aksi = 'approve' | 'reject'
    try {
      const newStatus = aksi === 'approve' ? 'dipinjam' : 'ditolak';
      
      // Update the status. If approved, the trigger we wrote in DB schema
      // "after_peminjaman_approved" will automatically decrease tool stock!
      await pool.query(
        'UPDATE peminjaman SET status = ? WHERE id = ?',
        [newStatus, peminjaman_id]
      );

      // Log activity
      await pool.query(
        'INSERT INTO log_aktifitas (user_id, aksi) VALUES (?, ?)',
        [user.id, `Petugas ${newStatus} peminjaman ID ${peminjaman_id}`]
      );

      return res.status(200).json({ message: `Peminjaman ${newStatus}` });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
