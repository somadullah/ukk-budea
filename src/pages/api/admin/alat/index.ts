import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ResultSetHeader } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`
        SELECT a.id, a.nama_alat, a.deskripsi, a.jumlah, a.kategori_id, a.gambar, a.harga, k.nama_kategori 
        FROM alat a 
        LEFT JOIN kategori k ON a.kategori_id = k.id
      `);
      return res.status(200).json(rows);
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  // Admin only
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'POST') {
    const { kategori_id, nama_alat, deskripsi, jumlah, gambar, harga } = req.body;
    try {
      const dbKategoriId = kategori_id === '' || !kategori_id ? null : parseInt(kategori_id);
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO alat (kategori_id, nama_alat, deskripsi, jumlah, gambar, harga) VALUES (?, ?, ?, ?, ?, ?)',
        [dbKategoriId, nama_alat, deskripsi, jumlah, gambar || '/images/alat/placeholder.png', harga || 0]
      );
      return res.status(201).json({ id: result.insertId, nama_alat });
    } catch {
      return res.status(500).json({ message: 'Database error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
