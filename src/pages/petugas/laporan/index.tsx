import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { formatIDR } from '@/lib/format';

interface Activity {
  id: number;
  username: string;
  nama_alat: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  tanggal_dikembalikan: string | null;
  denda: number;
  kondisi_alat: 'baik' | 'rusak' | 'hilang' | null;
  catatan: string | null;
  status_denda: 'lunas' | 'belum_lunas' | null;
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
  const [searchTerm, setSearchTerm] = useState('');

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
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Peminjam</th>
                <th>Alat</th>
                <th>Tgl Pinjam</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
                <th>Kondisi</th>
                <th>Denda</th>
                <th>Catatan Kerusakan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={9} style={{textAlign: 'center'}}>Loading data...</td></tr> : 
                data?.activities.filter(item => 
                  item.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  item.nama_alat.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{item.username}</td>
                    <td>{item.nama_alat}</td>
                    <td style={{ fontSize: '0.85rem' }}>{item.tanggal_pinjam ? new Date(item.tanggal_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{item.tanggal_kembali ? new Date(item.tanggal_kembali).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: 
                          item.status === 'dikembalikan' ? 'rgba(16, 185, 129, 0.1)' : 
                          item.status === 'dipinjam' ? 'rgba(245, 158, 11, 0.1)' : 
                          item.status === 'kembali_diajukan' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: 
                          item.status === 'dikembalikan' ? 'var(--success)' : 
                          item.status === 'dipinjam' ? 'var(--warning)' : 
                          item.status === 'kembali_diajukan' ? 'var(--primary-color)' : 'var(--danger)'
                      }}>
                        {item.status?.toUpperCase().replace('_', ' ') || 'UNKNOWN'}
                      </span>
                    </td>
                    <td>
                      {item.kondisi_alat === 'baik' && <span style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Baik</span>}
                      {item.kondisi_alat === 'rusak' && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠️ Rusak</span>}
                      {item.kondisi_alat === 'hilang' && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>❌ Hilang</span>}
                      {!item.kondisi_alat && '-'}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {item.denda > 0 ? (
                        <div>
                          <div style={{ color: item.status_denda === 'lunas' ? 'var(--success)' : 'var(--danger)', fontSize: '1rem' }}>
                            {formatIDR(item.denda)}
                          </div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', marginTop: '2px' }}>
                            {item.status_denda === 'lunas' ? '✅ Lunas' : '⌛ Belum Bayar'}
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.catatan || ''}>
                      {item.catatan || '-'}
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
