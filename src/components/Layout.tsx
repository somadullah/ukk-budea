import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Sidebar from '@/components/Sidebar';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'petugas' | 'peminjam';
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  allowedRoles?: ('admin' | 'petugas' | 'peminjam')[];
}

export default function Layout({ children, title = 'Aplikasi Peminjaman Alat', allowedRoles }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (allowedRoles && !allowedRoles.includes(data.user.role)) {
            router.push('/unauthorized'); // or redirect based on their role
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    // Skip auth check if we explicitly allow no roles (e.g. login page)
    if (allowedRoles === undefined) {
      setLoading(false);
    } else {
      checkAuth();
    }
  }, [router, allowedRoles]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading && allowedRoles !== undefined) {
    return <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      
      {user && user.role !== 'admin' && (
        <nav className="navbar">
          <div style={{ fontWeight: '600', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
            Peminjaman Alat
          </div>
          <div className="nav-links">
            {user.role === 'petugas' && (
              <>
                <Link href="/petugas/persetujuan" className="nav-link">Persetujuan</Link>
                <Link href="/petugas/laporan" className="nav-link">Laporan</Link>
              </>
            )}
            {user.role === 'peminjam' && (
              <>
                <Link href="/peminjam/alat" className="nav-link">Daftar Alat</Link>
                <Link href="/peminjam/pinjam" className="nav-link">Peminjaman Saya</Link>
              </>
            )}
            <button onClick={handleLogout} className="btn" style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Logout ({user.username})</button>
          </div>
        </nav>
      )}

      {user && user.role === 'admin' && <Sidebar username={user.username} />}

      <main className={user?.role === 'admin' ? "main-content-with-sidebar" : "container"} style={{ padding: user?.role === 'admin' ? '2rem 3rem' : '2rem 1rem', flex: 1 }}>
        <div className="animate-fade-in">
          {user && user.role === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
               <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px solid var(--glass-border)' }}>Logout</button>
            </div>
          )}
          {children}
        </div>
      </main>
      
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} Aplikasi Peminjaman Alat
      </footer>
    </>
  );
}
