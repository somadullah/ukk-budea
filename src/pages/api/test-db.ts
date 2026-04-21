import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Jalankan query sederhana untuk ngetes koneksi
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Koneksi Database Berhasil!',
      data: rows
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      success: false, 
      message: 'Koneksi Database Gagal!',
      error: errorMessage 
    });
  }
}
