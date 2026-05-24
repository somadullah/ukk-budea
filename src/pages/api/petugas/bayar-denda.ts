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
    const { invoice_id } = req.body;
    try {
      await pool.query(
        'UPDATE pengembalian SET status_denda = "lunas" WHERE id = ?',
        [invoice_id]
      );
      return res.status(200).json({ message: 'Pembayaran denda berhasil dikonfirmasi!' });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
