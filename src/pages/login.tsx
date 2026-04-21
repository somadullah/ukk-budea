import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';


export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.role === 'admin') router.push('/admin/dashboard');
        else if (data.user.role === 'petugas') router.push('/petugas/persetujuan');
        else if (data.user.role === 'peminjam') router.push('/peminjam/alat');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('An error occurred loading the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Aplikasi Peminjaman</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>Log In</h2>
          
          {error && (
            <div style={{ padding: '0.8rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input 
                id="username"
                type="text" 
                className="form-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input 
                id="password"
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                autoComplete="current-password"
              />
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </>
  );
}
