import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { formatIDR } from '@/lib/format';

interface Alat {
  id: number;
  nama_alat: string;
  deskripsi: string;
  jumlah: number;
  kategori_id: number | null;
  nama_kategori: string;
  gambar: string;
  harga: number;
}

interface Kategori {
  id: number;
  nama_kategori: string;
}

export default function AlatAdmin() {
  const [alat, setAlat] = useState<Alat[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    nama_alat: '', 
    deskripsi: '', 
    jumlah: 1, 
    kategori_id: '',
    gambar: '/images/alat/placeholder.png',
    harga: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination Logic
  const filteredAlat = alat.filter(a => 
    a.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.nama_kategori && a.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredAlat.length / itemsPerPage);
  const displayedAlat = filteredAlat.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAlat, resKat] = await Promise.all([
        fetch('/api/admin/alat'),
        fetch('/api/admin/kategori')
      ]);
      if(resAlat.ok) setAlat(await resAlat.json());
      if(resKat.ok) setKategori(await resKat.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, []);

  const resetForm = () => {
    setFormData({ 
      nama_alat: '', 
      deskripsi: '', 
      jumlah: 1, 
      kategori_id: '', 
      gambar: '/images/alat/placeholder.png', 
      harga: 0 
    });
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/admin/alat/${editId}` : '/api/admin/alat';
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditId(null);
        resetForm();
        setActiveTab('list');
        fetchData();
        alert(method === 'POST' ? 'Alat berhasil ditambahkan!' : 'Alat berhasil diperbarui!');
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Error menyimpan alat'}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleEdit = (item: Alat) => {
    setEditId(item.id);
    setFormData({
      nama_alat: item.nama_alat,
      deskripsi: item.deskripsi,
      jumlah: item.jumlah,
      kategori_id: item.kategori_id ? item.kategori_id.toString() : '',
      gambar: item.gambar,
      harga: item.harga || 0
    });
    setActiveTab('edit');
  };

  const handleDelete = async (id: number) => {
    if(confirm('Hapus alat ini?')) {
      const res = await fetch(`/api/admin/alat/${id}`, { method: 'DELETE' });
      if(res.ok) fetchData();
      else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Error menghapus alat'}`);
      }
    }
  };

  return (
    <Layout title="Manajemen Alat" allowedRoles={['admin']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Manajemen Alat</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Kelola stok dan data peralatan olahraga & kesehatan.</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'list' ? 'btn-primary' : ''}`} 
            style={{ background: activeTab === 'list' ? '' : 'transparent', border: activeTab === 'list' ? '' : '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => { setActiveTab('list'); setEditId(null); }}
          >
            📋 Daftar Alat
          </button>
          <button 
            className={`btn ${activeTab === 'add' ? 'btn-primary' : ''}`}
            style={{ background: activeTab === 'add' ? '' : 'transparent', border: activeTab === 'add' ? '' : '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => { resetForm(); setActiveTab('add'); }}
          >
            ➕ Tambah Alat
          </button>
          {activeTab === 'edit' && (
            <button className="btn btn-primary">✏️ Edit Alat</button>
          )}
        </div>

        {activeTab === 'list' && (
          <>
            <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari alat atau kategori..." 
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
                    <th>Gambar</th>
                    <th>Nama Alat</th>
                    <th>Kategori</th>
                    <th>Nilai Asset</th>
                    <th>Stok</th>
                    <th>Deskripsi</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</td></tr>
                  ) : displayedAlat.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data alat.</td></tr>
                  ) : (
                    displayedAlat.map((a) => (
                      <tr key={a.id}>
                        <td><img src={a.gambar} alt={a.nama_alat} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /></td>
                        <td style={{ fontWeight: 600 }}>{a.nama_alat}</td>
                        <td>
                          <span style={{ padding: '4px 10px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {a.nama_kategori || 'Tanpa Kategori'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatIDR(a.harga)}</td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.jumlah}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Unit</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '200px' }}>{a.deskripsi}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', marginRight: '0.5rem' }} 
                            onClick={() => handleEdit(a)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} 
                            onClick={() => handleDelete(a.id)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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
          </>
        )}

        {(activeTab === 'add' || activeTab === 'edit') && (
          <div className="glass-card animate-scale-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{activeTab === 'add' ? 'Tambah Alat Baru' : 'Perbarui Data Alat'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Alat</label>
                  <input 
                    required 
                    className="form-input" 
                    placeholder="Contoh: Bola Basket Spalding"
                    value={formData.nama_alat} 
                    onChange={e => setFormData({...formData, nama_alat: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select 
                    required 
                    className="form-input" 
                    value={formData.kategori_id} 
                    onChange={e => setFormData({...formData, kategori_id: e.target.value})}
                  >
                    <option value="">Pilih Kategori</option>
                    {kategori.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kategori || `Kategori #${k.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah (Stok)</label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    className="form-input" 
                    value={formData.jumlah} 
                    onChange={e => setFormData({...formData, jumlah: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nilai Asset / Barang (Rp)</label>
                  <input 
                    required 
                    type="number" 
                    className="form-input" 
                    value={formData.harga} 
                    onChange={e => setFormData({...formData, harga: parseFloat(e.target.value) || 0})} 
                  />
                  <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Preview: <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{formatIDR(formData.harga)}</span>
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Deskripsi Alat</label>
                  <textarea 
                    className="form-input" 
                    rows={3} 
                    placeholder="Jelaskan kondisi atau detail alat..."
                    value={formData.deskripsi} 
                    onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                  ></textarea>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">URL Gambar</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                      className="form-input" 
                      value={formData.gambar} 
                      onChange={e => setFormData({...formData, gambar: e.target.value})} 
                      placeholder="/images/alat/..." 
                      style={{ flex: 1 }}
                    />
                    {formData.gambar && (
                      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary-color)' }}>
                        <img src={formData.gambar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                  {activeTab === 'add' ? '✨ Simpan Alat' : '💾 Update Alat'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.8rem' }} 
                  onClick={() => { setActiveTab('list'); resetForm(); }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
