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

  if (req.method === 'POST') {
    const { peminjaman_id, kondisi_alat, denda, catatan } = req.body;

    if (!peminjaman_id || !kondisi_alat) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Get loan details to find tool ID
      const [loan] = await connection.query<RowDataPacket[]>(
        'SELECT alat_id, status FROM peminjaman WHERE id = ?',
        [peminjaman_id]
      );

      if (!loan || loan.length === 0) {
        throw new Error('Peminjaman not found');
      }

      if (loan[0].status !== 'dipinjam' && loan[0].status !== 'kembali_diajukan') {
        throw new Error('Alat tidak dalam status dapat dikembalikan');
      }

      // 2. Insert into pengembalian
      // The trigger 'after_pengembalian_insert' will automatically:
      // - Update peminjaman status to 'dikembalikan'
      // - Increase tool 'jumlah' (stock) if condition is 'baik'
      await connection.query(
        `INSERT INTO pengembalian (peminjaman_id, tanggal_dikembalikan, denda, kondisi_alat, catatan, petugas_id) 
         VALUES (?, NOW(), ?, ?, ?, ?)`,
        [peminjaman_id, denda || 0, kondisi_alat, catatan || '', user.id]
      );

      // 5. Log Activity
      await connection.query(
        'INSERT INTO log_aktifitas (user_id, aksi) VALUES (?, ?)',
        [user.id, `Petugas mencatat pengembalian ID ${peminjaman_id} - Kondisi: ${kondisi_alat}`]
      );

      await connection.commit();
      return res.status(200).json({ message: 'Pengembalian berhasil dicatat' });

    } catch (err: unknown) {
      await connection.rollback();
      console.error(err);
      return res.status(500).json({ message: err instanceof Error ? err.message : 'Database error' });
    } finally {
      connection.release();
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
