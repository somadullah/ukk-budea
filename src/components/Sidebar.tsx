import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  username: string;
  role: 'admin' | 'petugas' | 'peminjam' | 'guru';
}

const Sidebar: React.FC<SidebarProps> = ({ username, role }) => {
  const router = useRouter();

  const allItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊', roles: ['admin'] },
    // Admin Features
    { name: 'Kelola User', path: '/admin/users', icon: '👥', roles: ['admin'] },
    { name: 'Kelola Alat', path: '/admin/alat', icon: '🔧', roles: ['admin'] },
    { name: 'Kelola Kategori', path: '/admin/kategori', icon: '📁', roles: ['admin'] },
    { name: 'Data Peminjaman', path: '/admin/peminjaman', icon: '📋', roles: ['admin'] },
    { name: 'Data Pengembalian', path: '/petugas/pengembalian', icon: '📥', roles: ['admin'] },
    { name: 'Log Aktivitas', path: '/admin/logs', icon: '📜', roles: ['admin'] },
    
    // Petugas Features
    { name: 'Menyetujui Peminjaman', path: '/petugas/persetujuan', icon: '✅', roles: ['petugas'] },
    { name: 'Memantau Pengembalian', path: '/petugas/pengembalian', icon: '📥', roles: ['petugas'] },
    { name: 'Catatan Sanksi', path: '/petugas/denda', icon: '⚠️', roles: ['petugas'] },
    { name: 'Mencetak Laporan', path: '/petugas/laporan', icon: '📈', roles: ['petugas'] },
    
    // Peminjam Features
    { name: 'Melihat Daftar Alat', path: '/peminjam/alat', icon: '🔍', roles: ['peminjam'] },
    { name: 'Mengajukan Peminjaman', path: '/peminjam/pinjam', icon: '📦', roles: ['peminjam'] },
  ];

  const menuItems = allItems.filter(item => item.roles.includes(role));

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'white' }}>
          Peminjaman<span style={{ color: 'var(--primary-color)' }}>Alat</span>
        </h2>
      </div>

      <Link href={`/${role}/profile`} style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'var(--transition)',
        textDecoration: 'none'
      }} className="profile-header-link">
        <img 
          src="/images/avatar-admin.png" 
          alt="Avatar" 
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <div style={{ overflow: 'hidden' }}>
          <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {username}
          </p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {role === 'admin' ? 'Administrator' : role === 'petugas' ? 'Petugas Lapangan' : role === 'guru' ? 'Guru' : 'Peminjam Alat'}
          </p>
        </div>
      </Link>


      <nav style={{ flex: 1 }}>
        <p style={{ padding: '0 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Menu Utama
        </p>
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path} 
            className={`sidebar-link ${router.pathname === item.path ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

    </div>
  );
};

export default Sidebar;
