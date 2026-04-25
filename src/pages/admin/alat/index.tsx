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
  const [showModal, setShowModal] = useState(false);
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
      setFormData({ nama_alat: '', deskripsi: '', jumlah: 1, kategori_id: '', gambar: '/images/alat/placeholder.png', harga: 0 });
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
      gambar: item.gambar,
      harga: item.harga || 0
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
        <div className="modal-overlay">
          <div className="glass-card animate-fade-in" style={{ width: '500px', background: 'var(--bg-color)', margin: 'auto' }}>
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
                <label className="form-label">Harga Satuan (Rp)</label>
                <input required type="number" className="form-input" value={formData.harga} onChange={e => setFormData({...formData, harga: parseFloat(e.target.value) || 0})} />
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
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--text-muted)', color: 'white' }} onClick={() => { setShowModal(false); setEditId(null); setFormData({ nama_alat: '', deskripsi: '', jumlah: 1, kategori_id: '', gambar: '/images/alat/placeholder.png', harga: 0 }); }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <th>Harga</th>
              <th>Stok</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{textAlign: 'center'}}>Loading...</td></tr> : 
              alat.filter(a => 
                a.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (a.nama_kategori && a.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map(a => (
                <tr key={a.id}>
                  <td><img src={a.gambar} alt={a.nama_alat} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /></td>
                  <td style={{ fontWeight: 500 }}>{a.nama_alat}</td>
                  <td><span style={{ padding: '2px 8px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)', borderRadius: '12px', fontSize: '0.8rem' }}>{a.nama_kategori || 'Tanpa Kategori'}</span></td>
                  <td style={{ fontWeight: 600 }}>Rp{a.harga ? a.harga.toLocaleString('id-ID') : '0'}</td>
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
