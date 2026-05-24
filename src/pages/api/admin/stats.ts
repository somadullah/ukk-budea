import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

interface CountRow extends RowDataPacket {
  usersCount?: number;
  alatCount?: number;
  pinjamCount?: number;
  requestCount?: number;
  totalDenda?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const [[{ usersCount }]] = await pool.query<CountRow[]>('SELECT COUNT(*) as usersCount FROM users');
      const [[{ alatCount }]] = await pool.query<CountRow[]>('SELECT COUNT(*) as alatCount FROM alat');
      const [[{ pinjamCount }]] = await pool.query<CountRow[]>('SELECT COUNT(*) as pinjamCount FROM peminjaman WHERE status IN ("dipinjam", "kembali_diajukan")');
      const [[{ requestCount }]] = await pool.query<CountRow[]>('SELECT COUNT(*) as requestCount FROM peminjaman WHERE status = "menunggu"');
      const [[{ totalDenda }]] = await pool.query<CountRow[]>('SELECT SUM(denda) as totalDenda FROM pengembalian');
      
      // Historical data for chart (Last 7 days or mock for visual impact)
      const chartData = [
        { name: 'Mon', value: 30 },
        { name: 'Tue', value: 45 },
        { name: 'Wed', value: 25 },
        { name: 'Thu', value: 60 },
        { name: 'Fri', value: 35 },
        { name: 'Sat', value: 50 },
        { name: 'Sun', value: 42 },
      ];

      const satisfaction = 85; // Simulated satisfaction rate

      return res.status(200).json({
        users: usersCount || 0,
        alat: alatCount || 0,
        pinjam: pinjamCount || 0,
        requests: requestCount || 0,
        totalDenda: totalDenda || 0,
        chartData,
        satisfaction
      });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
