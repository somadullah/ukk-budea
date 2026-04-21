import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Activity {
  id: number;
  username: string;
  nama_alat: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  tanggal_dikembalikan: string | null;
  denda: number;
}

interface ReportData {
  summary: {
    total: number;
    active: number;
    returned: number;
  };
  activities: Activity[];
}

export default function LaporanPetugas() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/petugas/laporan');
      if (res.ok) setData(await res.json());
    } catch {
      console.error("Failed to fetch laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout title="Laporan Peminjaman" allowedRoles={['petugas', 'admin']}>
      <div className="animate-fade-in">
        <h2 style={{ marginBottom: '1.5rem' }}>Laporan Aktivitas Peminjaman</h2>
        
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>TOTAL TRANSAKSI</p>
              <h1 style={{ margin: 0 }}>{data.summary.total}</h1>
            </div>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SEDANG DIPINJAM</p>
              <h1 style={{ margin: 0 }}>{data.summary.active}</h1>
            </div>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SUDAH DIKEMBALIKAN</p>
              <h1 style={{ margin: 0 }}>{data.summary.returned}</h1>
            </div>
          </div>
        )}

        <div className="table-container">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Peminjam</th>
                <th>Alat</th>
                <th>Tgl Pinjam</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
                <th>Info Tambahan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{textAlign: 'center'}}>Loading data...</td></tr> : 
                data?.activities.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{item.username}</td>
                    <td>{item.nama_alat}</td>
                    <td>{new Date(item.tanggal_pinjam).toLocaleDateString()}</td>
                    <td>{new Date(item.tanggal_kembali).toLocaleDateString()}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: item.status === 'dikembalikan' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: item.status === 'dikembalikan' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {item.tanggal_dikembalikan ? `Dikembalikan: ${new Date(item.tanggal_dikembalikan).toLocaleDateString()}` : '-'}
                      {item.denda > 0 && <span style={{ color: 'var(--danger)', marginLeft: '10px' }}>(Denda: Rp{item.denda.toLocaleString()})</span>}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
