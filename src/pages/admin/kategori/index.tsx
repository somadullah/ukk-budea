import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Kategori {
  id: number;
  nama_kategori: string;
}

export default function KategoriAdmin() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama_kategori: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Search and Pagination Logic
  const filteredKategori = kategori.filter(k => 
    k.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredKategori.length / itemsPerPage);
  const displayedKategori = filteredKategori.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kategori');
      if (res.ok) {
        setKategori(await res.json());
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchKategori();
    })();
  }, []);

  const resetForm = () => {
    setFormData({ nama_kategori: '' });
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/admin/kategori/${editId}` : '/api/admin/kategori';
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
        fetchKategori();
        alert(method === 'POST' ? 'Kategori berhasil ditambahkan!' : 'Kategori berhasil diperbarui!');
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Error menyimpan kategori'}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleEdit = (item: Kategori) => {
    setEditId(item.id);
    setFormData({ nama_kategori: item.nama_kategori });
    setActiveTab('edit');
  };

  const handleDelete = async (id: number) => {
    if(confirm('Hapus kategori ini?')) {
      const res = await fetch(`/api/admin/kategori/${id}`, { method: 'DELETE' });
      if(res.ok) fetchKategori();
      else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Error menghapus kategori'}`);
      }
    }
  };

  return (
    <Layout title="Manajemen Kategori" allowedRoles={['admin']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Manajemen Kategori</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Organisir peralatan berdasarkan jenis dan fungsinya.</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'list' ? 'btn-primary' : ''}`} 
            style={{ background: activeTab === 'list' ? '' : 'transparent', border: activeTab === 'list' ? '' : '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => { setActiveTab('list'); setEditId(null); }}
          >
            📋 Daftar Kategori
          </button>
          <button 
            className={`btn ${activeTab === 'add' ? 'btn-primary' : ''}`}
            style={{ background: activeTab === 'add' ? '' : 'transparent', border: activeTab === 'add' ? '' : '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => { resetForm(); setActiveTab('add'); }}
          >
            ➕ Tambah Kategori
          </button>
          {activeTab === 'edit' && (
            <button className="btn btn-primary">✏️ Edit Kategori</button>
          )}
        </div>

        {activeTab === 'list' && (
          <>
            <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari kategori..." 
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
                    <th style={{ width: '80px' }}>No</th>
                    <th>Nama Kategori</th>
                    <th>ID Sistem</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</td></tr>
                  ) : displayedKategori.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data kategori.</td></tr>
                  ) : (
                    displayedKategori.map((k, index) => (
                      <tr key={k.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td style={{ fontWeight: 600, fontSize: '1rem' }}>{k.nama_kategori}</td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{k.id}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ 
                                padding: '0.4rem 0.8rem', 
                                fontSize: '0.75rem', 
                                borderRadius: '6px', 
                                fontWeight: 600, 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                background: 'linear-gradient(135deg, var(--primary-color), #6366f1)',
                                border: 'none',
                                color: 'white',
                                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
                              }} 
                              onClick={() => handleEdit(k)}
                            >
                              ✏️ Edit
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
                              onClick={() => handleDelete(k.id)}
                            >
                              🗑️ Hapus
                            </button>
                          </div>
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
          <div className="glass-card animate-scale-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{activeTab === 'add' ? 'Tambah Kategori Baru' : 'Perbarui Nama Kategori'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Kategori</label>
                <input 
                  required 
                  className="form-input" 
                  placeholder="Contoh: Alat Medis, Perlengkapan Olahraga"
                  value={formData.nama_kategori} 
                  onChange={e => setFormData({...formData, nama_kategori: e.target.value})} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                  {activeTab === 'add' ? '✨ Simpan Kategori' : '💾 Update Kategori'}
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

