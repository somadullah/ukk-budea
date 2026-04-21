import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Kategori {
  id: number;
  nama_kategori: string;
}

export default function KategoriAdmin() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama_kategori: '' });

  const fetchKategori = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/kategori');
    if (res.ok) {
      setKategori(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      await fetchKategori();
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/admin/kategori/${editId}` : '/api/admin/kategori';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowModal(false);
      setEditId(null);
      setFormData({ nama_kategori: '' });
      fetchKategori();
    } else {
      const data = await res.json();
      alert(`Gagal: ${data.message || 'Error menyimpan kategori'}`);
    }
  };

  const handleEdit = (item: Kategori) => {
    setEditId(item.id);
    setFormData({ nama_kategori: item.nama_kategori });
    setShowModal(true);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Manajemen Kategori</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tambah Kategori</button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '400px', background: 'var(--bg-color)' }}>
            <h3>{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Kategori</label>
                <input required className="form-input" value={formData.nama_kategori} onChange={e => setFormData({...formData, nama_kategori: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Update' : 'Simpan'}</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--text-muted)', color: 'white' }} onClick={() => { setShowModal(false); setEditId(null); setFormData({ nama_kategori: '' }); }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Kategori</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={3} style={{textAlign: 'center'}}>Loading...</td></tr> : 
              kategori.map(k => (
                <tr key={k.id}>
                  <td>{k.id}</td>
                  <td style={{ fontWeight: 500 }}>{k.nama_kategori}</td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => handleEdit(k)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDelete(k.id)}>Hapus</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
