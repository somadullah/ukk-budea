import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { formatIDR } from '@/lib/format';

interface FineHistory {
  invoice_id: number;
  peminjam: string;
  nama_alat: string;
  nilai_barang: number;
  tanggal_dikembalikan: string;
  denda: number;
  kondisi_alat: string;
  catatan: string;
  nama_petugas: string;
  status_denda: 'lunas' | 'belum_lunas';
}

export default function ManajemenDenda() {
  const [data, setData] = useState<{ summary: Record<string, number>, history: FineHistory[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<FineHistory | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/petugas/keuangan');
      if (res.ok) setData(await res.json());
    } catch {
      console.error("Failed to fetch financial data");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id: number) => {
    if (!confirm('Konfirmasi pembayaran denda ini?')) return;
    setProcessingId(id);
    try {
      const res = await fetch('/api/petugas/bayar-denda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: id })
      });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Gagal mengonfirmasi pembayaran');
      }
    } catch {
      alert('Kesalahan koneksi');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout title="Catatan Sanksi & Denda" allowedRoles={['admin', 'petugas']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Pusat Sanksi Peminjaman</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Monitoring sanksi keterlambatan dan kerusakan peminjaman alat.</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem' }}>
            <span>🖨️</span> Cetak Laporan Sanksi
          </button>
        </div>

        {/* Financial Overview Cards */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="glass-card card-premium" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(18, 20, 24, 1) 100%)',
              borderLeft: '5px solid var(--success)', 
              padding: '2rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Total Sanksi Diselesaikan</p>
                  <h2 style={{ fontSize: '3rem', margin: 0, color: 'var(--success)', fontWeight: 900 }}>{formatIDR(data.summary.collected)}</h2>
                </div>
                <div style={{ color: 'var(--success)', opacity: 0.2 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
              </div>
            </div>
            <div className="glass-card card-premium" style={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(18, 20, 24, 1) 100%)',
              borderLeft: '5px solid var(--danger)', 
              padding: '2rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Sanksi Berjalan (Belum Lunas)</p>
                  <h2 style={{ fontSize: '3rem', margin: 0, color: 'var(--danger)', fontWeight: 900 }}>{formatIDR(data.summary.pending)}</h2>
                </div>
                <div style={{ color: 'var(--danger)', opacity: 0.2 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card card-premium" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Riwayat Sanksi Peminjaman</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <span style={{ fontSize: '0.75rem', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 700 }}>
                LUNAS: {data?.history.filter(h => h.status_denda === 'lunas').length}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '6px 14px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontWeight: 700 }}>
                PENDING: {data?.history.filter(h => h.status_denda === 'belum_lunas').length}
              </span>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID Referensi</th>
                  <th>Peminjam</th>
                  <th>Alat / Barang</th>
                  <th>Tgl Pengembalian</th>
                  <th>Status</th>
                  <th>Jumlah Denda</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{textAlign: 'center', padding: '5rem'}}>
                  <div className="animate-pulse">Menghitung data finansial...</div>
                </td></tr> : 
                 data?.history.length === 0 ? <tr><td colSpan={7} style={{textAlign: 'center', padding: '5rem', color: 'var(--text-muted)'}}>Belum ada data transaksi denda.</td></tr> :
                 data?.history.map((h) => (
                  <tr key={h.invoice_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.3s' }} className="table-row-hover">
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.9rem' }}>#REF-{h.invoice_id.toString().padStart(5, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{h.peminjam}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{h.nama_alat}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '2px' }}>
                        <span>Kondisi: {h.kondisi_alat.toUpperCase()}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(h.tanggal_dikembalikan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900,
                        background: h.status_denda === 'lunas' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: h.status_denda === 'lunas' ? 'var(--success)' : 'var(--danger)',
                        border: h.status_denda === 'lunas' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                        {h.status_denda === 'lunas' ? '✅ LUNAS' : '⌛ BELUM BAYAR'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 900, color: h.status_denda === 'lunas' ? 'white' : 'var(--danger)', fontSize: '1.2rem' }}>
                      {formatIDR(h.denda)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} onClick={() => setSelectedInvoice(h)}>
                          Detail
                        </button>
                        {h.status_denda === 'belum_lunas' && (
                          <button 
                            className="btn btn-success" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }} 
                            onClick={() => handlePay(h.invoice_id)}
                            disabled={processingId === h.invoice_id}
                          >
                            {processingId === h.invoice_id ? '...' : 'Bayar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                 ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Sanksi Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="glass-card animate-scale-in" style={{ width: '450px', padding: '2.5rem', borderTop: '4px solid var(--primary-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Detail Sanksi</h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sistem Peminjaman Alat Digital</p>
              </div>
              <span style={{ 
                padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                background: selectedInvoice.status_denda === 'lunas' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: selectedInvoice.status_denda === 'lunas' ? 'var(--success)' : 'var(--danger)'
              }}>
                {selectedInvoice.status_denda === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
              </span>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ID Referensi</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>#REF-{selectedInvoice.invoice_id.toString().padStart(5, '0')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Peminjam</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{selectedInvoice.peminjam}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tgl. Pengembalian</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{new Date(selectedInvoice.tanggal_dikembalikan).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Petugas Pemeriksa</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{selectedInvoice.nama_petugas}</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Rincian Alat & Penilaian</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedInvoice.nama_alat}</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kondisi: <span style={{ color: 'white' }}>{selectedInvoice.kondisi_alat.toUpperCase()}</span></p>
                </div>
              </div>
              
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', marginTop: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', fontStyle: 'italic', color: '#ffb3b3' }}>Catatan Kerusakan: &quot;{selectedInvoice.catatan}&quot;</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Sanksi Denda</p>
                {selectedInvoice.status_denda === 'lunas' && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>Telah Diselesaikan</p>}
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: selectedInvoice.status_denda === 'lunas' ? 'white' : 'var(--danger)' }}>
                {formatIDR(selectedInvoice.denda)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setSelectedInvoice(null)}>Tutup</button>
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => window.print()}>
                <span>🖨️</span> Cetak Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          .sidebar, .navbar, .btn, .glass-card:not(.animate-scale-in) {
            display: none !important;
          }
          .modal-overlay {
            background: white !important;
            position: static !important;
          }
          .animate-scale-in {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </Layout>
  );
}
