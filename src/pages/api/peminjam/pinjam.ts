import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const user = verifyToken(token);
  if (!user || user.role !== 'peminjam') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'POST') {
    const { alat_id, tanggal_pinjam, tanggal_kembali } = req.body;
    try {
      // Create peminjaman with default status 'menunggu'
      await pool.query(
        'INSERT INTO peminjaman (user_id, alat_id, tanggal_pinjam, tanggal_kembali) VALUES (?, ?, ?, ?)',
        [user.id, alat_id, tanggal_pinjam, tanggal_kembali]
      );
      
      // Also insert into log_aktifitas
      await pool.query(
        'INSERT INTO log_aktifitas (user_id, aksi) VALUES (?, ?)',
        [user.id, `User melakukan request peminjaman alat ID ${alat_id}`]
      );

      return res.status(201).json({ message: 'Requested successfully' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
