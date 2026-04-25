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
  harga: number;
  kondisi_peminjam: 'baik' | 'rusak' | 'hilang' | null;
  catatan_peminjam: string | null;
}

export default function PengembalianPetugas() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Peminjaman | null>(null);
  const [kondisi, setKondisi] = useState<'baik' | 'rusak' | 'hilang'>('baik');
  const [denda, setDenda] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // We need an API that returns currently borrowed items
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
    setDenda(0);
    setCatatan('');
    setShowModal(true);
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
        setShowModal(false);
        fetchData();
        alert('Pengembalian berhasil dicatat!');
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal mencatat pengembalian');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Proses Pengembalian" allowedRoles={['petugas', 'admin']}>
      <div className="animate-fade-in">
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
                    <td>{p.peminjam}</td>
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
                    <td>{new Date(p.tanggal_pinjam).toLocaleDateString()}</td>
                    <td>{new Date(p.tanggal_kembali).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className={p.status === 'kembali_diajukan' ? "btn btn-primary" : "btn"} 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} 
                        onClick={() => openReturnModal(p)}
                      >
                        {p.status === 'kembali_diajukan' ? 'Konfirmasi' : 'Cek Kembali'}
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedLoan && (
        <div className="modal-overlay">
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '500px', background: '#121418', border: '1px solid var(--glass-border)', padding: '2rem', margin: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📥</span> Konfirmasi Pengembalian
            </h3>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alat: <strong>{selectedLoan.nama_alat}</strong></p>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Peminjam: <strong>{selectedLoan.peminjam}</strong></p>
            </div>

            {selectedLoan.status === 'kembali_diajukan' && (
              <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase' }}>📢 Laporan Peminjam</p>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  Kondisi: <span style={{ fontWeight: 600, color: selectedLoan.kondisi_peminjam === 'baik' ? 'var(--success)' : 'var(--danger)' }}>
                    {selectedLoan.kondisi_peminjam?.toUpperCase()}
                  </span>
                </p>
                {selectedLoan.catatan_peminjam && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    "{selectedLoan.catatan_peminjam}"
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleReturn}>
              <div className="form-group">
                <label className="form-label">Kondisi Alat Saat Ini</label>
                <select 
                  className="form-input" 
                  value={kondisi} 
                  onChange={e => setKondisi(e.target.value as any)}
                  style={{ cursor: 'pointer' }}
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
                
                {/* Deteksi Telat Otomatis */}
                {Math.ceil((new Date().getTime() - new Date(selectedLoan.tanggal_kembali).getTime()) / (1000 * 3600 * 24)) > 0 && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>
                      ⚠️ Terlambat {Math.ceil((new Date().getTime() - new Date(selectedLoan.tanggal_kembali).getTime()) / (1000 * 3600 * 24))} Hari
                    </p>
                    <button 
                      type="button"
                      style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', marginTop: '4px', cursor: 'pointer' }}
                      onClick={() => {
                        const days = Math.ceil((new Date().getTime() - new Date(selectedLoan.tanggal_kembali).getTime()) / (1000 * 3600 * 24));
                        setDenda(prev => prev + (days * 5000));
                      }}
                    >
                      + Terapkan Denda Telat (Rp5.000/hr)
                    </button>
                  </div>
                )}

                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-muted)' }}>Rp</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ paddingLeft: '3rem', fontSize: '1.2rem', fontWeight: 700, color: denda > 0 ? 'var(--danger)' : 'inherit' }}
                    placeholder="0" 
                    value={denda} 
                    onChange={e => setDenda(parseInt(e.target.value) || 0)} 
                  />
                </div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                  Format: Rp{denda.toLocaleString('id-ID')}
                </div>

                {/* Quick Presets Berdasarkan Harga Alat */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid var(--glass-border)', background: 'transparent' }} onClick={() => setDenda(selectedLoan.harga * 0.1)}>10% Rusak</button>
                  <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid var(--glass-border)', background: 'transparent' }} onClick={() => setDenda(selectedLoan.harga * 0.25)}>25% Rusak</button>
                  <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid var(--glass-border)', background: 'transparent' }} onClick={() => setDenda(selectedLoan.harga * 0.5)}>50% Rusak Berat</button>
                  <button type="button" className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.65rem' }} onClick={() => setDenda(selectedLoan.harga)}>100% Ganti Baru</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Kerusakan / Keterangan</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  placeholder="Ceritakan detail kerusakan jika ada..."
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white' }} 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1.5 }}
                  disabled={submitting}
                >
                  {submitting ? 'Memproses...' : 'Simpan Pengembalian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
