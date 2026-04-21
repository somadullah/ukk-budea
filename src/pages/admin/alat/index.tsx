import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Alat {
  id: number;
  nama_alat: string;
  deskripsi: string;
  jumlah: number;
  kategori_id: number | null;
  nama_kategori: string;
  gambar: string;
}

interface Kategori {
  id: number;
  nama_kategori: string;
}

export default function AlatAdmin() {
  const [alat, setAlat] = useState<Alat[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    nama_alat: '', 
    deskripsi: '', 
    jumlah: 1, 
    kategori_id: '',
    gambar: '/images/alat/placeholder.png'
  });

  const fetchData = async () => {
    setLoading(true);
    const [resAlat, resKat] = await Promise.all([
      fetch('/api/admin/alat'),
      fetch('/api/admin/kategori')
    ]);
    if(resAlat.ok) setAlat(await resAlat.json());
    if(resKat.ok) setKategori(await resKat.json());
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/admin/alat/${editId}` : '/api/admin/alat';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowModal(false);
      setEditId(null);
      setFormData({ nama_alat: '', deskripsi: '', jumlah: 1, kategori_id: '', gambar: '/images/alat/placeholder.png' });
      fetchData();
    } else {
      const data = await res.json();
      alert(`Gagal: ${data.message || 'Failed to save alat'}`);
    }
  };

  const handleEdit = (item: Alat) => {
    setEditId(item.id);
    setFormData({
      nama_alat: item.nama_alat,
      deskripsi: item.deskripsi,
      jumlah: item.jumlah,
      kategori_id: item.kategori_id ? item.kategori_id.toString() : '',
      gambar: item.gambar
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if(confirm('Hapus alat ini?')) {
      const res = await fetch(`/api/admin/alat/${id}`, { method: 'DELETE' });
      if(res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Error menghapus alat'}`);
      }
    }
  };

  return (
    <Layout title="Manajemen Alat" allowedRoles={['admin']}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Manajemen Alat</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tambah Alat</button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '500px', background: 'var(--bg-color)' }}>
            <h3>{editId ? 'Edit Alat' : 'Tambah Alat'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Alat</label>
                <input required className="form-input" value={formData.nama_alat} onChange={e => setFormData({...formData, nama_alat: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select required className="form-input" value={formData.kategori_id} onChange={e => setFormData({...formData, kategori_id: e.target.value})}>
                  <option value="">Pilih Kategori</option>
                  {kategori.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kategori || `Kategori #${k.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Jumlah</label>
                <input required type="number" min="1" className="form-input" value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={2} value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">URL Gambar</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="form-input" value={formData.gambar} onChange={e => setFormData({...formData, gambar: e.target.value})} placeholder="/images/alat/..." />
                  {formData.gambar && (
                    <img src={formData.gambar} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Update' : 'Simpan'}</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--text-muted)', color: 'white' }} onClick={() => { setShowModal(false); setEditId(null); setFormData({ nama_alat: '', deskripsi: '', jumlah: 1, kategori_id: '', gambar: '/images/alat/placeholder.png' }); }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Nama Alat</th>
              <th>Kategori</th>
              <th>Stok</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{textAlign: 'center'}}>Loading...</td></tr> : 
              alat.map(a => (
                <tr key={a.id}>
                  <td><img src={a.gambar} alt={a.nama_alat} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /></td>
                  <td style={{ fontWeight: 500 }}>{a.nama_alat}</td>
                  <td><span style={{ padding: '2px 8px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)', borderRadius: '12px', fontSize: '0.8rem' }}>{a.nama_kategori || 'Tanpa Kategori'}</span></td>
                  <td>{a.jumlah}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{a.deskripsi}</td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => handleEdit(a)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDelete(a.id)}>Hapus</button>
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
