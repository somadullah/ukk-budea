import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Alat {
  id: number;
  nama_alat: string;
  deskripsi: string;
  jumlah: number;
  nama_kategori: string;
  gambar: string;
}

export default function PeminjamAlat() {
  const [alat, setAlat] = useState<Alat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlat, setSelectedAlat] = useState<Alat | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchAlat = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/alat'); // we can reuse this GET endpoint
    if(res.ok) setAlat(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      await fetchAlat();
    })();
  }, []);

  const handlePinjam = async () => {
    if (!selectedAlat) return;
    const tgl_pinjam = new Date().toISOString().split('T')[0];
    const tgl_kembali = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0];

    const res = await fetch('/api/peminjam/pinjam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alat_id: selectedAlat.id, tanggal_pinjam: tgl_pinjam, tanggal_kembali: tgl_kembali })
    });
    
    if (res.ok) {
      alert('Peminjaman berhasil diajukan, menunggu persetujuan petugas.');
      setShowConfirm(false);
      fetchAlat();
    } else {
      alert('Gagal mengajukan peminjaman.');
    }
  };

  return (
    <Layout title="Daftar Alat" allowedRoles={['peminjam']}>
      <h2>Daftar Alat Tersedia</h2>
      <p>Pilih alat yang ingin Anda pinjam dari daftar di bawah ini.</p>

      {showConfirm && selectedAlat && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card animate-fade-in" style={{ width: '450px', background: 'var(--bg-color)', padding: '2rem', textAlign: 'center' }}>
            <img src={selectedAlat.gambar} alt={selectedAlat.nama_alat} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Konfirmasi Peminjaman</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Apakah Anda yakin ingin meminjam <strong>{selectedAlat.nama_alat}</strong> selama 7 hari ke depan?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePinjam}>Ya, Pinjam Sekarang</button>
              <button className="btn" style={{ flex: 1, background: 'var(--text-muted)', color: 'white' }} onClick={() => setShowConfirm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {loading ? <p>Loading...</p> : alat.map(a => (
          <div key={a.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '180px' }}>
              <img src={a.gambar} alt={a.nama_alat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', color: 'white', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)' }}>
                  {a.nama_kategori}
                </span>
              </div>
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{a.nama_alat}</h3>
              <p style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-muted)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.deskripsi}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <span style={{ fontWeight: 600, color: a.jumlah > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem' }}>
                  Stok: {a.jumlah} unit
                </span>
                <button 
                  className="btn btn-primary" 
                  disabled={a.jumlah === 0}
                  onClick={() => { setSelectedAlat(a); setShowConfirm(true); }}
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}
                >
                  {a.jumlah > 0 ? 'Pinjam Sekarang' : 'Habis'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
