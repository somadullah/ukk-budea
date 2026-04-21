import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Loan {
  id: number;
  nama_alat: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: 'menunggu' | 'dipinjam' | 'dikembalikan' | 'ditolak';
  tanggal_dikembalikan: string | null;
  denda: number | null;
  gambar: string;
}

export default function MyLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

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
            <div style={{ display: 'grid', gap: '1rem' }}>
              {loans.map((loan) => (
                <div key={loan.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <img 
                      src={loan.gambar} 
                      alt={loan.nama_alat} 
                      style={{ 
                        width: '70px', 
                        height: '70px', 
                        objectFit: 'cover',
                        borderRadius: '12px', 
                        border: '1px solid var(--glass-border)'
                      }} 
                    />
                    <div>
                      <h3 style={{ margin: 0 }}>{loan.nama_alat}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Pinjam: {new Date(loan.tanggal_pinjam).toLocaleDateString()} | 
                        Harus Kembali: {new Date(loan.tanggal_kembali).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: 
                        loan.status === 'dipinjam' ? 'rgba(245, 158, 11, 0.15)' :
                        loan.status === 'dikembalikan' ? 'rgba(16, 185, 129, 0.15)' :
                        loan.status === 'ditolak' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      color: 
                        loan.status === 'dipinjam' ? 'var(--warning)' :
                        loan.status === 'dikembalikan' ? 'var(--success)' :
                        loan.status === 'ditolak' ? 'var(--danger)' : 'var(--primary-color)'
                    }}>
                      {loan.status.toUpperCase()}
                    </div>
                    {loan.denda && loan.denda > 0 && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>
                        Denda: Rp{loan.denda.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
