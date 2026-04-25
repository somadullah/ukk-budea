import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Peminjaman {
  id: number;
  peminjam: string;
  nama_alat: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  kondisi_alat: string | null;
  denda: number | null;
  catatan: string | null;
}

export default function PeminjamanAdmin() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Cari peminjam atau alat..." 
            className="form-input" 
            style={{ paddingLeft: '2.5rem', width: '100%', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Peminjam</th>
              <th>Alat</th>
              <th>Pinjam</th>
              <th>Kembali</th>
              <th>Status</th>
              <th>Kondisi</th>
              <th>Denda</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{textAlign: 'center'}}>Loading...</td></tr> : 
              peminjaman.filter(p => 
                p.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.nama_alat.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(p => (
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
                  <td>
                    {p.kondisi_alat ? (
                      <span style={{ color: p.kondisi_alat === 'baik' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {p.kondisi_alat === 'baik' ? 'Baik' : p.kondisi_alat === 'rusak' ? 'Rusak' : 'Hilang'}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ color: (p.denda || 0) > 0 ? 'var(--danger)' : 'inherit', fontWeight: (p.denda || 0) > 0 ? 600 : 400 }}>
                    {p.denda ? `Rp${p.denda.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.catatan || ''}>
                    {p.catatan || '-'}
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
