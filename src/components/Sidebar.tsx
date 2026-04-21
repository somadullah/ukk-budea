import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  username: string;
}

const Sidebar: React.FC<SidebarProps> = ({ username }) => {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Profil Saya', path: '/admin/profile', icon: '👤' },
    { name: 'Data Peminjaman', path: '/admin/peminjaman', icon: '📥' },
    { name: 'Manajemen Alat', path: '/admin/alat', icon: '🔧' },
    { name: 'Kategori Alat', path: '/admin/kategori', icon: '🏷️' },
    { name: 'Kelola Users', path: '/admin/users', icon: '👥' },
    { name: 'Log Aktifitas', path: '/admin/logs', icon: '📜' },
    { name: 'Laporan', path: '/petugas/laporan', icon: '📈' },
  ];

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'white' }}>
          Peminjaman<span style={{ color: 'var(--primary-color)' }}>Alat</span>
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>v. 1.0.0 Alpha</p>
      </div>

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

      <div style={{ 
        marginTop: 'auto', 
        padding: '1rem', 
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <img 
          src="/images/avatar-admin.png" 
          alt="Avatar" 
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <div style={{ overflow: 'hidden' }}>
          <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {username}
          </p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>Administrator</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
