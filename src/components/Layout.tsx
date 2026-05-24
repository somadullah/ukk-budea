import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Sidebar from '@/components/Sidebar';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'petugas' | 'peminjam' | 'guru';
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  allowedRoles?: ('admin' | 'petugas' | 'peminjam' | 'guru')[];
}

export default function Layout({ children, title = 'Aplikasi Peminjaman Alat', allowedRoles }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const allowedRolesString = JSON.stringify(allowedRoles);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (allowedRoles && !allowedRoles.includes(data.user.role)) {
            router.push('/unauthorized');
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
    
    if (allowedRoles === undefined) {
      setLoading(false);
    } else {
      checkAuth();
    }
  }, [router, allowedRolesString]);

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

      
      {user && <Sidebar username={user.username} role={user.role} />}
      
      <main className={user ? "main-content-with-sidebar" : "container"} style={{ padding: '2rem 3rem', flex: 1 }}>
        <div className="animate-fade-in">
          {user && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
               <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px solid var(--glass-border)' }}>Logout ({user.username})</button>
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
