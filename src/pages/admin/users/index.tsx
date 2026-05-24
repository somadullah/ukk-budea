import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface User {
  id: number;
  username: string;
  role: string;
  nomor_telepon: string | null;
  kelas: string | null;
  email: string | null;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    role: 'peminjam',
    nomor_telepon: '',
    kelas: '',
    email: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination Logic
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
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
        fetchUsers();
        alert(method === 'POST' ? 'User berhasil ditambahkan!' : 'User berhasil diperbarui!');
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Error menyimpan user'}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setFormData({
      username: user.username,
      password: '', // Leave empty for editing
      role: user.role,
      nomor_telepon: user.nomor_telepon || '',
      kelas: user.kelas || '',
      email: user.email || ''
    });
    setActiveTab('edit');
  };

  const handleDelete = async (id: number) => {
    if(confirm('Hapus user ini?')) {
      const res = await fetch(`/api/admin/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
      });
      if(res.ok) fetchUsers();
      else {
        const data = await res.json();
        alert(`Gagal menghapus user: ${data.error || data.message || 'Error tidak diketahui'}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      username: '', 
      password: '', 
      role: 'peminjam',
      nomor_telepon: '',
      kelas: '',
      email: ''
    });
    setEditId(null);
  };

  return (
    <Layout title="Manajemen Users" allowedRoles={['admin']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Manajemen Users</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Kelola data guru, peminjam, dan petugas sistem.</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'list' ? 'btn-primary' : ''}`} 
            style={{ background: activeTab === 'list' ? '' : 'transparent', border: activeTab === 'list' ? '' : '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => { setActiveTab('list'); setEditId(null); }}
          >
            📋 Daftar User
          </button>
          <button 
            className={`btn ${activeTab === 'add' ? 'btn-primary' : ''}`}
            style={{ background: activeTab === 'add' ? '' : 'transparent', border: activeTab === 'add' ? '' : '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => { resetForm(); setActiveTab('add'); }}
          >
            ➕ Tambah User
          </button>
          {activeTab === 'edit' && (
            <button className="btn btn-primary">✏️ Edit User</button>
          )}
        </div>

        {activeTab === 'list' && (
          <>
            <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari berdasarkan username..." 
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
                    <th style={{ width: '60px' }}>No</th>
                    <th>User Detail</th>
                    <th>Role</th>
                    <th>Telepon</th>
                    <th>Kelas / Email</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</td></tr>
                  ) : displayedUsers.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data user.</td></tr>
                  ) : (
                    displayedUsers.map((u, index) => (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>{u.username}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{u.id}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : u.role === 'petugas' ? 'rgba(245, 158, 11, 0.15)' : u.role === 'guru' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)', 
                            color: u.role === 'admin' ? 'var(--danger)' : u.role === 'petugas' ? 'var(--warning)' : u.role === 'guru' ? 'var(--success)' : 'var(--primary-color)', 
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em'
                          }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.9rem' }}>{u.nomor_telepon || '-'}</td>
                        <td>
                          {u.role === 'peminjam' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '0.85rem' }}>{u.kelas || '-'}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email: {u.email || '-'}</span>
                            </div>
                          ) : '-'}
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
                              onClick={() => handleEdit(u)}
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
                              onClick={() => handleDelete(u.id)}
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
          <div className="glass-card animate-scale-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{activeTab === 'add' ? 'Tambah User Baru' : 'Perbarui Data User'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    required 
                    className="form-input" 
                    placeholder="Masukkan username"
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select 
                    className="form-input" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="peminjam">Peminjam (Siswa)</option>
                    <option value="guru">Guru</option>
                    <option value="petugas">Petugas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Password {editId && <small style={{ display: 'block', color: 'var(--warning)', marginTop: '4px' }}>(Kosongkan jika tidak ingin diubah)</small>}</label>
                  <input 
                    required={!editId} 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nomor Telepon</label>
                  <input 
                    className="form-input" 
                    placeholder="Contoh: 0812..."
                    value={formData.nomor_telepon} 
                    onChange={e => setFormData({...formData, nomor_telepon: e.target.value})} 
                  />
                </div>
                {formData.role === 'peminjam' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Kelas</label>
                      <input 
                        className="form-input" 
                        placeholder="Contoh: XII RPL 1"
                        value={formData.kelas} 
                        onChange={e => setFormData({...formData, kelas: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input 
                        type="email"
                        className="form-input" 
                        placeholder="contoh@email.com"
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                  {activeTab === 'add' ? '✨ Simpan User' : '💾 Update User'}
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
