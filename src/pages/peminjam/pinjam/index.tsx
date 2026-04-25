import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Loan {
  id: number;
  nama_alat: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: 'menunggu' | 'dipinjam' | 'dikembalikan' | 'ditolak' | 'kembali_diajukan';
  tanggal_dikembalikan: string | null;
  denda: number | null;
  kondisi_alat: 'baik' | 'rusak' | 'hilang' | null;
  catatan: string | null;
  gambar: string;
}

export default function MyLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [kondisi, setKondisi] = useState<'baik' | 'rusak' | 'hilang'>('baik');
  const [catatan, setCatatan] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/peminjam/my-loans');
      if (res.ok) setLoans(await res.json());
    } catch {
      console.error("Failed to fetch my loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchLoans();
    })();
  }, []);

  const handleReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;
    
    setSubmittingId(selectedLoanId);
    try {
      const res = await fetch('/api/peminjam/ajukan-kembali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          peminjaman_id: selectedLoanId,
          kondisi_peminjam: kondisi,
          catatan_peminjam: catatan
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchLoans();
        alert('Permintaan pengembalian terkirim. Silakan temui petugas.');
      } else {
        alert('Gagal mengirim permintaan');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setSubmittingId(null);
    }
  };

  const openReturnModal = (id: number) => {
    setSelectedLoanId(id);
    setKondisi('baik');
    setCatatan('');
    setShowModal(true);
  };

  return (
    <Layout title="Peminjaman Saya" allowedRoles={['peminjam']}>
      <div className="animate-fade-in">
        <h2 style={{ marginBottom: '1.5rem' }}>Status Peminjaman Saya</h2>
        <p style={{ color: 'var(--text-muted)' }}>Pantau daftar alat yang sedang Anda pinjam atau riwayat pengembalian.</p>

        <div style={{ marginTop: '2rem' }}>
          {loading ? <p>Memuat data...</p> : loans.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Anda belum memiliki riwayat peminjaman.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => window.location.href='/peminjam/alat'}>Pinjam Sekarang</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {loans.map((loan) => (
                <div key={loan.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative', border: loan.status === 'dikembalikan' && loan.kondisi_alat !== 'baik' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <img 
                        src={loan.gambar} 
                        alt={loan.nama_alat} 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover',
                          borderRadius: '12px', 
                          border: '1px solid var(--glass-border)'
                        }} 
                      />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{loan.nama_alat}</h3>
                        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          🗓️ Pinjam: {new Date(loan.tanggal_pinjam).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          🏁 Batas: {new Date(loan.tanggal_kembali).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 
                          loan.status === 'dipinjam' ? 'rgba(245, 158, 11, 0.15)' :
                          loan.status === 'dikembalikan' ? 'rgba(16, 185, 129, 0.15)' :
                          loan.status === 'kembali_diajukan' ? 'rgba(99, 102, 241, 0.15)' :
                          loan.status === 'ditolak' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: 
                          loan.status === 'dipinjam' ? 'var(--warning)' :
                          loan.status === 'dikembalikan' ? 'var(--success)' :
                          loan.status === 'kembali_diajukan' ? 'var(--primary-color)' :
                          loan.status === 'ditolak' ? 'var(--danger)' : 'var(--primary-color)'
                      }}>
                        {loan.status === 'kembali_diajukan' ? 'MENUNGGU KONFIRMASI' : loan.status.toUpperCase()}
                      </div>
                      
                      {loan.status === 'dipinjam' && (
                        <div style={{ marginTop: '1rem' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                            onClick={() => openReturnModal(loan.id)}
                            disabled={submittingId === loan.id}
                          >
                            {submittingId === loan.id ? 'Memproses...' : 'Kembalikan Alat'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detail Pengembalian */}
                  {loan.status === 'dikembalikan' && (
                    <div style={{ 
                      marginTop: '1.5rem', 
                      paddingTop: '1rem', 
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kondisi Saat Kembali</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 600, color: loan.kondisi_alat === 'baik' ? 'var(--success)' : 'var(--danger)' }}>
                           {loan.kondisi_alat === 'baik' ? '✅ Bagus / Normal' : 
                            loan.kondisi_alat === 'rusak' ? '⚠️ Rusak' : '❌ Hilang'}
                        </p>
                      </div>
                      
                      {loan.denda !== null && loan.denda > 0 && (
                        <div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Denda Terpilih</p>
                          <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--danger)' }}>
                            Rp{loan.denda.toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}

                      {loan.catatan && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Catatan Petugas</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                            "{loan.catatan}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '450px', background: 'var(--bg-color)', border: '1px solid var(--glass-border)', padding: '2rem', margin: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Laporan Kondisi Alat</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Berikan informasi jujur mengenai kondisi alat saat Anda ingin mengembalikannya.</p>
            
            <form onSubmit={handleReturnRequest}>
              <div className="form-group">
                <label className="form-label">Kondisi Alat</label>
                <select className="form-input" value={kondisi} onChange={e => setKondisi(e.target.value as any)}>
                  <option value="baik">✅ Baik</option>
                  <option value="rusak">⚠️ Rusak</option>
                  <option value="hilang">❌ Hilang</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Catatan Tambahan (Opsional)</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Contoh: Baut agak kendor, atau kabel sedikit terkelupas..."
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!!submittingId}>
                  {submittingId ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
