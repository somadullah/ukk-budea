import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { formatIDR } from '@/lib/format';

interface Peminjaman {
  id: number;
  peminjam: string;
  nama_alat: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  gambar: string;
  harga: number;
  kondisi_peminjam: 'baik' | 'rusak' | 'hilang' | null;
  catatan_peminjam: string | null;
}

export default function PengembalianPetugas() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View states
  const [activeView, setActiveView] = useState<'list' | 'proses'>('list');
  const [selectedLoan, setSelectedLoan] = useState<Peminjaman | null>(null);
  const [kondisi, setKondisi] = useState<'baik' | 'rusak' | 'hilang'>('baik');
  const [denda, setDenda] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/petugas/peminjaman-aktif');
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, []);

  const openReturnModal = (loan: Peminjaman) => {
    setSelectedLoan(loan);
    setKondisi('baik');
    
    // Hitung denda otomatis saat buka modal
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(loan.tanggal_kembali);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      setDenda(diffDays * 5000); // Otomatis Rp 5.000 per hari telat
    } else {
      setDenda(0);
    }
    
    setCatatan('');
    setActiveView('proses');
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/petugas/kembalikan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peminjaman_id: selectedLoan.id,
          kondisi_alat: kondisi,
          denda: denda,
          catatan: catatan
        })
      });

      if (res.ok) {
        setActiveView('list');
        fetchData();
        alert('Pengembalian berhasil dicatat!');
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal mencatat pengembalian');
      }
    } catch (err: unknown) {
      alert('Kesalahan jaringan: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Proses Pengembalian" allowedRoles={['petugas', 'admin']}>
      <div className="animate-fade-in">
        {activeView === 'list' ? (
          <>
            <h2 style={{ marginBottom: '0.5rem' }}>Proses Pengembalian Alat</h2>
            <p style={{ color: 'var(--text-muted)' }}>Cek kondisi alat saat dikembalikan oleh peminjam.</p>

            <div className="glass-card" style={{ marginTop: '2rem', padding: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari peminjam atau nama alat yang sedang dipinjam..." 
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
                    <th>Tgl Pinjam</th>
                    <th>Batas Kembali</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} style={{textAlign: 'center'}}>Loading...</td></tr> : 
                   data.length === 0 ? <tr><td colSpan={6} style={{textAlign: 'center', color: 'var(--text-muted)'}}>Tidak ada alat yang sedang dipinjam</td></tr> :
                    data.filter(p => 
                      p.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      p.nama_alat.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(p => (
                      <tr key={p.id}>
                        <td><img src={p.gambar} alt={p.nama_alat} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /></td>
                        <td style={{ fontWeight: 600 }}>{p.peminjam}</td>
                        <td style={{ fontWeight: 600 }}>
                          {p.nama_alat}
                          {p.status === 'kembali_diajukan' && (
                            <span style={{ 
                              marginLeft: '10px', 
                              fontSize: '0.65rem', 
                              background: 'var(--primary-color)', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              verticalAlign: 'middle',
                              animation: 'pulse 2s infinite'
                            }}>
                              MINTA KEMBALI
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{new Date(p.tanggal_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        <td style={{ fontSize: '0.85rem' }}>{new Date(p.tanggal_kembali).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        <td>
                          <button 
                            className={p.status === 'kembali_diajukan' ? "btn btn-primary" : "btn"} 
                            style={{ 
                              padding: '0.4rem 1rem', 
                              fontSize: '0.75rem', 
                              borderRadius: '6px', 
                              fontWeight: 600,
                              background: p.status === 'kembali_diajukan' ? 'linear-gradient(135deg, var(--primary-color), #6366f1)' : 'rgba(255,255,255,0.05)',
                              border: 'none',
                              color: 'white',
                              boxShadow: p.status === 'kembali_diajukan' ? '0 2px 4px rgba(79, 70, 229, 0.2)' : 'none'
                            }} 
                            onClick={() => openReturnModal(p)}
                          >
                            {p.status === 'kembali_diajukan' ? '📥 Konfirmasi' : '🔍 Cek Kembali'}
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </>
        ) : (
          selectedLoan && (
            <div>
              <div 
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s', width: 'fit-content' }} 
                onClick={() => setActiveView('list')}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <span style={{ fontSize: '1.25rem' }}>⬅️</span>
                <span style={{ fontWeight: 600 }}>Kembali ke Daftar</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Left Column: Loan Details */}
                <div className="glass-card card-premium" style={{ padding: '2rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 800 }}>📦 Detail Peminjaman</h3>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                    <img 
                      src={selectedLoan.gambar} 
                      alt={selectedLoan.nama_alat} 
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} 
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{selectedLoan.nama_alat}</h4>
                      <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Peminjam: <strong style={{ color: 'var(--primary-color)' }}>{selectedLoan.peminjam}</strong></p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tanggal Pinjam</p>
                      <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'white' }}>{new Date(selectedLoan.tanggal_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Batas Kembali</p>
                      <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'white' }}>{new Date(selectedLoan.tanggal_kembali).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {selectedLoan.status === 'kembali_diajukan' && (
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📢 Laporan Mandiri Peminjam</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>
                        Kondisi yang dilaporkan: <span style={{ fontWeight: 700, color: selectedLoan.kondisi_peminjam === 'baik' ? 'var(--success)' : 'var(--danger)' }}>
                          {selectedLoan.kondisi_peminjam?.toUpperCase()}
                        </span>
                      </p>
                      {selectedLoan.catatan_peminjam && (
                        <p style={{ margin: '8px 0 0', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px' }}>
                          &quot;{selectedLoan.catatan_peminjam}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Return Form */}
                <div className="glass-card card-premium" style={{ padding: '2rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 800 }}>📥 Form Pengembalian</h3>

                  <form onSubmit={handleReturn}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Kondisi Alat Saat Ini</label>
                      <select 
                        className="form-input" 
                        value={kondisi} 
                        onChange={e => setKondisi(e.target.value as 'baik' | 'rusak' | 'hilang')}
                        style={{ cursor: 'pointer', background: 'var(--bg-color)' }}
                      >
                        <option value="baik">✅ Baik / Normal</option>
                        <option value="rusak">⚠️ Rusak</option>
                        <option value="hilang">❌ Hilang</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Denda / Biaya (Rp)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => setDenda(0)}>Reset</span>
                      </label>
                      
                      {/* Info Telat Otomatis */}
                      {Math.ceil((new Date().getTime() - new Date(selectedLoan.tanggal_kembali).getTime()) / (1000 * 3600 * 24)) > 0 && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>⚠️</span> Terlambat {Math.ceil((new Date().getTime() - new Date(selectedLoan.tanggal_kembali).getTime()) / (1000 * 3600 * 24))} hari
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Denda keterlambatan otomatis: <strong>Rp5.000 x {Math.ceil((new Date().getTime() - new Date(selectedLoan.tanggal_kembali).getTime()) / (1000 * 3600 * 24))} hari</strong>.
                          </p>
                        </div>
                      )}

                      <div style={{ position: 'relative' }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ paddingLeft: '1rem', fontSize: '1.25rem', fontWeight: 800, color: denda > 0 ? 'var(--danger)' : 'var(--primary-color)', textAlign: 'right' }}
                          placeholder="0" 
                          value={denda} 
                          onChange={e => setDenda(parseInt(e.target.value) || 0)} 
                        />
                      </div>
                      <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        Terbilang: <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{formatIDR(denda)}</span>
                      </div>

                      {/* Quick Presets Berdasarkan Harga Alat */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid var(--glass-border)', background: 'transparent' }} onClick={() => setDenda(selectedLoan.harga * 0.1)}>10% Rusak</button>
                        <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid var(--glass-border)', background: 'transparent' }} onClick={() => setDenda(selectedLoan.harga * 0.25)}>25% Rusak</button>
                        <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid var(--glass-border)', background: 'transparent' }} onClick={() => setDenda(selectedLoan.harga * 0.5)}>50% Rusak Berat</button>
                        <button type="button" className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.65rem' }} onClick={() => setDenda(selectedLoan.harga)}>100% Ganti Baru</button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                      <label className="form-label">Catatan Kerusakan / Keterangan</label>
                      <textarea 
                        className="form-input" 
                        rows={3} 
                        placeholder="Ceritakan detail kerusakan jika ada..."
                        value={catatan}
                        onChange={e => setCatatan(e.target.value)}
                        style={{ resize: 'none' }}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        type="button" 
                        className="btn" 
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white' }} 
                        onClick={() => setActiveView('list')}
                        disabled={submitting}
                      >
                        Batal
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ flex: 1.5, background: 'linear-gradient(135deg, var(--primary-color), #6366f1)', border: 'none' }}
                        disabled={submitting}
                      >
                        {submitting ? 'Memproses...' : '✨ Simpan Pengembalian'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </Layout>
  );
}
