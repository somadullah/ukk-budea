import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Peminjaman {
  id: number;
  peminjam: string;
  nama_alat: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
}

export default function PeminjamanAdmin() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPeminjaman = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/peminjaman');
    if (res.ok) {
      setPeminjaman(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      await fetchPeminjaman();
    })();
  }, []);

  return (
    <Layout title="Data Peminjaman" allowedRoles={['admin']}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Data Peminjaman</h2>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Peminjam</th>
              <th>Alat</th>
              <th>Tanggal Pinjam</th>
              <th>Tanggal Kembali</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{textAlign: 'center'}}>Loading...</td></tr> : 
              peminjaman.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.peminjam}</td>
                  <td>{p.nama_alat}</td>
                  <td>{new Date(p.tanggal_pinjam).toLocaleDateString()}</td>
                  <td>{new Date(p.tanggal_kembali).toLocaleDateString()}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'white',
                      background: p.status === 'dipinjam' ? 'var(--warning)' : 
                                  p.status === 'dikembalikan' ? 'var(--success)' : 
                                  p.status === 'ditolak' ? 'var(--danger)' : 'var(--primary-color)' 
                    }}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
