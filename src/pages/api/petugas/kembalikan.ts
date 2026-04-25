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

  if (req.method === 'POST') {
    const { peminjaman_id, kondisi_alat, denda, catatan } = req.body;

    if (!peminjaman_id || !kondisi_alat) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Get loan details to find tool ID
      const [loan]: any = await connection.query(
        'SELECT alat_id, status FROM peminjaman WHERE id = ?',
        [peminjaman_id]
      );

      if (!loan || loan.length === 0) {
        throw new Error('Peminjaman not found');
      }

      if (loan[0].status !== 'dipinjam' && loan[0].status !== 'kembali_diajukan') {
        throw new Error('Alat tidak dalam status dapat dikembalikan');
      }

      const alat_id = loan[0].alat_id;

      // 2. Update status to 'dikembalikan'
      await connection.query(
        'UPDATE peminjaman SET status = ? WHERE id = ?',
        ['dikembalikan', peminjaman_id]
      );

      // 3. Insert into pengembalian
      await connection.query(
        `INSERT INTO pengembalian (peminjaman_id, tanggal_dikembalikan, denda, kondisi_alat, catatan, petugas_id) 
         VALUES (?, NOW(), ?, ?, ?, ?)`,
        [peminjaman_id, denda || 0, kondisi_alat, catatan || '', user.id]
      );

      // 4. Update tool stock if condition is 'baik'
      // If 'rusak' or 'hilang', we might not want to increase stock immediately
      if (kondisi_alat === 'baik') {
        await connection.query(
          'UPDATE alat SET stok = stok + 1 WHERE id = ?',
          [alat_id]
        );
      } else if (kondisi_alat === 'rusak') {
        // Log damage or something? For now, we don't increase stock
        // Maybe we have a logic to mark tool itself as damaged if it's a unique tool, 
        // but here it seems tools have "stok" (quantity).
      }

      // 5. Log Activity
      await connection.query(
        'INSERT INTO log_aktifitas (user_id, aksi) VALUES (?, ?)',
        [user.id, `Petugas mencatat pengembalian ID ${peminjaman_id} - Kondisi: ${kondisi_alat}`]
      );

      await connection.commit();
      return res.status(200).json({ message: 'Pengembalian berhasil dicatat' });

    } catch (err: any) {
      await connection.rollback();
      console.error(err);
      return res.status(500).json({ message: err.message || 'Database error' });
    } finally {
      connection.release();
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
