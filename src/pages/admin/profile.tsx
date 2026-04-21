import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface ProfileData {
  username: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  profile_image: string | null;
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    full_name: '',
    email: '',
    bio: '',
    profile_image: '/images/avatar-admin.png'
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/profile');
    if (res.ok) {
      const data = await res.json();
      setProfile({
        ...data,
        full_name: data.full_name || '',
        email: data.email || '',
        bio: data.bio || ''
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });

    if (res.ok) {
      setMessage('Profil berhasil diperbarui!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Gagal memperbarui profil.');
    }
    setUpdating(false);
  };

  if (loading) return <Layout title="Loading..."><p>Memuat profil...</p></Layout>;

  return (
    <Layout title="Profil Admin" allowedRoles={['admin']}>
      <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem' }}>Pengaturan Akun</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Section 1: Profile Preview Card */}
          <div className="glass-card card-premium" style={{ textAlign: 'center', position: 'sticky', top: '100px' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
              <img 
                src={profile.profile_image || '/images/avatar-admin.png'} 
                alt="Avatar" 
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)', boxShadow: '0 0 20px var(--primary-glow)' }} 
              />
              <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '30px', height: '30px', background: 'var(--primary-color)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid #0a0b0e' }}>
                ✏️
              </div>
            </div>
            
            <h3 style={{ margin: '0 0 0.25rem 0' }}>{profile.full_name || profile.username}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Administrator Level</p>
            
            <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neon-border)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>💎</span>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '0.1em' }}>PLATINUM ACCESS</p>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              "{profile.bio || 'Hiduplah seolah-olah kamu akan mati besok. Belajarlah seolah-olah kamu akan hidup selamanya.'}"
            </p>
          </div>

          {/* Section 2: Edit Form */}
          <div className="glass-card card-premium">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Informasi Pribadi</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Username (Read Only)</label>
                  <input className="form-input" value={profile.username} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Utama</label>
                  <input className="form-input" type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} placeholder="admin@example.com" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input required className="form-input" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} placeholder="Masukkan nama lengkap Anda" />
              </div>

              <div className="form-group">
                <label className="form-label">Bio Singkat</label>
                <textarea className="form-input" rows={4} value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Tuliskan sesuatu tentang Anda..."></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">URL Foto Profil</label>
                <input className="form-input" value={profile.profile_image || ''} onChange={e => setProfile({...profile, profile_image: e.target.value})} placeholder="/images/avatars/..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
                {message && <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>}
                <button type="submit" className="btn btn-primary" disabled={updating} style={{ minWidth: '150px' }}>
                  {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
}
