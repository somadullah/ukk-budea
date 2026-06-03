import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface LogAktifitas {
  id: number;
  username: string;
  role: 'admin' | 'petugas' | 'peminjam' | 'guru';
  aksi: string;
  tanggal: string;
}

export default function LogAktifitasAdmin() {
  const [logs, setLogs] = useState<LogAktifitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogAktifitas | null>(null);

  const itemsPerPage = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchLogs();
    })();
  }, []);

  // Filter logs based on search and role
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.aksi.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalize role string comparison
    const matchesRole = roleFilter === 'all' || (log.role && log.role.toLowerCase() === roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const displayedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const getActionMeta = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('request') || lower.includes('mengajukan pinjaman') || lower.includes('peminjaman')) {
      return { icon: '📥', color: 'var(--primary-color)', bg: 'rgba(79, 70, 229, 0.1)' };
    }
    if (lower.includes('setuju') || lower.includes('approve') || lower.includes('dipinjam')) {
      return { icon: '✅', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' };
    }
    if (lower.includes('kembali') || lower.includes('pengembalian')) {
      return { icon: '📦', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' };
    }
    if (lower.includes('tolak') || lower.includes('reject') || lower.includes('batal')) {
      return { icon: '❌', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' };
    }
    if (lower.includes('profil') || lower.includes('akun') || lower.includes('password')) {
      return { icon: '👤', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
    }
    return { icon: '⚙️', color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };
  };

  const getRoleBadgeStyle = (role: string) => {
    if (!role) return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
    switch (role.toLowerCase()) {
      case 'admin':
        return { background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' };
      case 'petugas':
        return { background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', border: '1px solid rgba(20, 184, 166, 0.3)' };
      case 'guru':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      default: // peminjam
        return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
    }
  };

  // Helper to parse and render Aksi beautifully (detecting JSON)
  const renderAksiContent = (aksiStr: string, isShort = true) => {
    try {
      const trimmed = aksiStr.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.25rem 0' }}>
            <span style={{ 
              fontWeight: 800, 
              color: 'var(--warning)', 
              fontSize: '0.7rem', 
              letterSpacing: '0.08em',
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              width: 'fit-content'
            }}>
              📊 DETAIL AKTIVITAS (JSON)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {parsed.reason && (
                <div>
                  <strong>Alasan:</strong> <span style={{ color: 'var(--text-muted)' }}>{parsed.reason}</span>
                </div>
              )}
              {parsed.status && (
                <div>
                  <strong>Status:</strong> <span style={{ color: 'var(--success)', fontWeight: 700 }}>{parsed.status}</span>
                </div>
              )}
              {parsed.dueDate && (
                <div>
                  <strong>Batas Waktu:</strong> <span style={{ color: 'var(--text-muted)' }}>{new Date(parsed.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
            {parsed.items && Array.isArray(parsed.items) && (
              <div style={{ 
                padding: '0.5rem 0.75rem', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '6px', 
                borderLeft: '3px solid var(--primary-color)',
                marginTop: '0.25rem',
                fontSize: '0.85rem'
              }}>
                <strong style={{ color: 'var(--text-main)' }}>Barang ({parsed.items.length}):</strong>
                {isShort ? (
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                    {parsed.items.map((item: any) => `Alat #${item.toolId || item.id}`).join(', ')}
                  </span>
                ) : (
                  <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                    {parsed.items.map((item: any, i: number) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>
                        ID Alat: <code style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{item.toolId || item.id}</code>
                        {item.qtyMin !== undefined && ` - Qty: ${item.qtyMin}`}
                        {item.returnedQty !== undefined && ` - Diambil/Kembali: ${item.returnedQty}`}
                        {item.condition && ` (${item.condition})`}
                        {item.inspectionNote && ` - Catatan: "${item.inspectionNote}"`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {!parsed.reason && !parsed.status && !parsed.items && (
              <pre style={{ margin: 0, fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', overflowX: 'auto', color: 'var(--text-muted)' }}>
                {JSON.stringify(parsed, null, 2)}
              </pre>
            )}
          </div>
        );
      }
    } catch {
      // Treat as standard string
    }

    // Standard styling for string log
    const meta = getActionMeta(aksiStr);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          background: meta.bg, 
          fontSize: '1.1rem',
          flexShrink: 0
        }}>
          {meta.icon}
        </span>
        <span style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.95rem' }}>
          {aksiStr}
        </span>
      </div>
    );
  };

  return (
    <Layout title="Log Aktivitas" allowedRoles={['admin']}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Log Aktivitas</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pantau riwayat aktivitas penggunaan sistem</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Cari pelaku atau kata kunci aktivitas..." 
            className="form-input" 
            style={{ paddingLeft: '2.5rem', width: '100%', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <select 
            className="form-input" 
            style={{ width: '100%', marginBottom: 0 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Semua Peran Pelaku</option>
            <option value="admin">Admin</option>
            <option value="petugas">Petugas</option>
            <option value="peminjam">Peminjam</option>
            <option value="guru">Guru</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container animate-fade-in">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>No</th>
              <th style={{ width: '220px' }}>Pelaku</th>
              <th>Aktivitas / Aksi</th>
              <th style={{ width: '220px' }}>Tanggal & Waktu</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Opsi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Memuat data log...</td></tr>
            ) : displayedLogs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Tidak ada data aktivitas yang sesuai.</td></tr>
            ) : (
              displayedLogs.map((l, index) => {
                const roleStyle = getRoleBadgeStyle(l.role);
                return (
                  <tr key={l.id} style={{ transition: 'var(--transition)' }}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '34px', 
                          height: '34px', 
                          borderRadius: '50%', 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid var(--glass-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          boxShadow: 'var(--glass-shadow)',
                          flexShrink: 0
                        }}>
                          {l.username ? l.username.charAt(0) : '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{l.username}</div>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.65rem', 
                            fontWeight: 700, 
                            display: 'inline-block',
                            marginTop: '2px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            ...roleStyle
                          }}>
                            {l.role || 'PEMINJAM'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '1rem 0.5rem' }}>
                      {renderAksiContent(l.aksi, true)}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {new Date(l.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ⏰ {new Date(l.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn" 
                        style={{ 
                          padding: '6px 14px', 
                          fontSize: '0.8rem', 
                          background: 'rgba(79, 70, 229, 0.1)', 
                          color: 'var(--primary-color)',
                          border: '1px solid rgba(79, 70, 229, 0.2)',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                        onClick={() => setSelectedLog(l)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
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
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem'
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
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem'
            }}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next ▶️
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div 
            className="glass-card animate-fade-in" 
            style={{ 
              maxWidth: '650px', 
              width: '100%', 
              padding: '2rem', 
              background: 'rgba(15, 17, 23, 0.95)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Detail Log Aktivitas</h3>
              <button 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                onClick={() => setSelectedLog(null)}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <span style={{ width: '140px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Log ID</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem' }}>#{selectedLog.id}</span>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <span style={{ width: '140px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Pelaku</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedLog.username}</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.65rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    ...getRoleBadgeStyle(selectedLog.role)
                  }}>
                    {selectedLog.role || 'PEMINJAM'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <span style={{ width: '140px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Waktu Aktivitas</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {new Date(selectedLog.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    ⏰ {new Date(selectedLog.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Rincian Kegiatan</span>
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.25)', 
                  padding: '1.25rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--glass-border)',
                  lineHeight: '1.6'
                }}>
                  {renderAksiContent(selectedLog.aksi, false)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.5rem 1.75rem', fontSize: '0.85rem', fontWeight: 600 }}
                onClick={() => setSelectedLog(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
