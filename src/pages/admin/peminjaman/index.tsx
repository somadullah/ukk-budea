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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Pagination Logic
  const filteredPeminjaman = peminjaman.filter(p => 
    p.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nama_alat.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPeminjaman.length / itemsPerPage);
  const displayedPeminjaman = filteredPeminjaman.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Layout title="Data Peminjaman" allowedRoles={['admin']}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Data Peminjaman</h2>
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
            <th style={{ width: '60px' }}>No</th>
            <th>Peminjam</th>
            <th>Detail Alat</th>
            <th>Tgl Pinjam</th>
            <th>Tgl Kembali</th>
            <th>Status</th>
            <th>Kondisi</th>
            <th>Denda</th>
            <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{textAlign: 'center', padding: '2rem'}}>Loading data...</td></tr> : 
              displayedPeminjaman.length === 0 ? <tr><td colSpan={9} style={{textAlign: 'center', padding: '2rem'}}>Tidak ada data peminjaman.</td></tr> :
              displayedPeminjaman.map((p, index) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.peminjam}</td>
                  <td style={{ fontWeight: 500 }}>{p.nama_alat}</td>
                  <td>{new Date(p.tanggal_pinjam).toLocaleDateString()}</td>
                  <td>{new Date(p.tanggal_kembali).toLocaleDateString()}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: p.status === 'dipinjam' ? 'rgba(245, 158, 11, 0.15)' : 
                                  p.status === 'dikembalikan' ? 'rgba(16, 185, 129, 0.15)' : 
                                  p.status === 'ditolak' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      color: p.status === 'dipinjam' ? 'var(--warning)' : 
                             p.status === 'dikembalikan' ? 'var(--success)' : 
                             p.status === 'ditolak' ? 'var(--danger)' : 'var(--primary-color)' 
                    }}>
                      {p.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td>
                    {p.kondisi_alat ? (
                      <span style={{ 
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
                        background: p.kondisi_alat === 'baik' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: p.kondisi_alat === 'baik' ? 'var(--success)' : 'var(--danger)', 
                        fontWeight: 600 
                      }}>
                        {p.kondisi_alat.toUpperCase()}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            disabled={currentPage === 1}
            className="btn" 
            style={{ 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.05)', 
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            ◀️ Prev
          </button>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Halaman <span style={{ color: 'var(--primary-color)' }}>{currentPage}</span> dari {totalPages}
          </div>
          <button 
            disabled={currentPage === totalPages}
            className="btn" 
            style={{ 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.05)', 
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next ▶️
          </button>
        </div>
      )}

    </Layout>
  );
}
