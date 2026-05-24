import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Peminjaman {
  id: number;
  peminjam: string;
  nama_alat: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  gambar: string;
}

export default function PersetujuanPetugas() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/petugas/persetujuan');
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, []);

  const handleAction = async (peminjaman_id: number, aksi: 'approve' | 'reject') => {
    const confirmation = aksi === 'approve' 
      ? 'Setujui peminjaman ini?' 
      : 'Tolak peminjaman ini?';
      
    if (confirm(confirmation)) {
      const res = await fetch('/api/petugas/persetujuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peminjaman_id, aksi })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Action failed');
      }
    }
  };

  return (
    <Layout title="Persetujuan Peminjaman" allowedRoles={['petugas', 'admin']}>
      <h2>Persetujuan Peminjaman</h2>
      <p>Daftar permintaan peminjaman alat yang belum disetujui.</p>

      <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1rem' }}>
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

      <div className="table-container" style={{ marginTop: '2rem' }}>
        <table>
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Peminjam</th>
              <th>Alat</th>
              <th>Tanggal Pinjam</th>
              <th>Harus Kembali</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{textAlign: 'center'}}>Loading...</td></tr> : 
             data.length === 0 ? <tr><td colSpan={6} style={{textAlign: 'center', color: 'var(--text-muted)'}}>Tidak ada permintaan peminjaman</td></tr> :
              data.filter(p => 
                p.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.nama_alat.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(p => (
                <tr key={p.id}>
                  <td><img src={p.gambar} alt={p.nama_alat} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /></td>
                  <td>{p.peminjam}</td>
                  <td style={{ fontWeight: 500 }}>{p.nama_alat}</td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(p.tanggal_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(p.tanggal_kembali).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        className="btn btn-success" 
                        style={{ 
                          padding: '0.4rem 0.8rem', 
                          fontSize: '0.75rem', 
                          borderRadius: '6px', 
                          fontWeight: 600, 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          background: 'linear-gradient(135deg, var(--success), #34d399)',
                          border: 'none',
                          color: 'white',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                        }} 
                        onClick={() => handleAction(p.id, 'approve')}
                      >
                        ✅ Setujui
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ 
                          padding: '0.4rem 0.8rem', 
                          fontSize: '0.75rem', 
                          borderRadius: '6px', 
                          fontWeight: 600, 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          background: 'linear-gradient(135deg, var(--danger), #f87171)',
                          border: 'none',
                          color: 'white',
                          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                        }} 
                        onClick={() => handleAction(p.id, 'reject')}
                      >
                        ❌ Tolak
                      </button>
                    </div>
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
