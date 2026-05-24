import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Unauthorized() {
  return (
    <>
      <Head>
        <title>Akses Ditolak - Aplikasi Peminjaman Alat</title>
      </Head>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: 'var(--bg-color)',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div className="glass-card animate-fade-in" style={{ padding: '3rem', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h1 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Akses Ditolak</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. 
            Silakan kembali ke dashboard atau hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>
          <Link href="/" className="btn btn-primary">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
