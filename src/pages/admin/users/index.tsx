import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'peminjam' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      await fetchUsers();
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/admin/users/${editId}` : '/api/admin/users';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowModal(false);
      setEditId(null);
      setFormData({ username: '', password: '', role: 'peminjam' });
      fetchUsers();
    } else {
      const data = await res.json();
      alert(`Gagal: ${data.message || 'Error menyimpan user'}`);
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setFormData({
      username: user.username,
      password: '', // Leave empty for editing
      role: user.role
    });
    setShowModal(true);
  };

  // Delete function would be similar sending DELETE request...
  const handleDelete = async (id: number) => {
    if(confirm('Hapus user ini?')) {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if(res.ok) fetchUsers();
      else alert('Failed to delete');
    }
  };

  return (
    <Layout title="Manajemen Users" allowedRoles={['admin']}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Manajemen Users</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tambah User</button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '400px', background: 'var(--bg-color)' }}>
            <h3>{editId ? 'Edit User' : 'Tambah User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input required className="form-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
               <div className="form-group">
                <label className="form-label">Password {editId && <small>(Kosongkan jika tidak ingin diubah)</small>}</label>
                <input required={!editId} type="password" className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="peminjam">Peminjam</option>
                  <option value="petugas">Petugas</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Update' : 'Simpan'}</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--text-muted)', color: 'white' }} onClick={() => { setShowModal(false); setEditId(null); setFormData({ username: '', password: '', role: 'peminjam' }); }}>Batal</button>
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
            placeholder="Cari username..." 
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
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Tanggal Daftar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{textAlign: 'center'}}>Loading...</td></tr> : 
              users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td><span style={{ padding: '4px 8px', borderRadius: '12px', background: u.role === 'admin' ? 'var(--danger)' : u.role === 'petugas' ? 'var(--warning)' : 'var(--primary-color)', color: 'white', fontSize: '0.8rem' }}>{u.role.toUpperCase()}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.4rem' }} onClick={() => handleEdit(u)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDelete(u.id)}>Hapus</button>
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
