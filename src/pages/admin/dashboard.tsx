import Layout from '@/components/Layout';
import React, { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    users: 0, 
    alat: 0, 
    pinjam: 0, 
    requests: 0,
    totalDenda: 0,
    chartData: [] as {name: string, value: number}[],
    satisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    void (async () => {
      await fetchStats();
    })();
  }, []);

  const topCards = [
    { title: 'Total Users', value: stats.users, trend: '+12.5%', color: 'var(--primary-color)', icon: '👥' },
    { title: 'Koleksi Alat', value: stats.alat, trend: '+5.2%', color: '#a855f7', icon: '🔧' },
    { title: 'Sedang Dipinjam', value: stats.pinjam, trend: '-2.1%', color: '#f59e0b', icon: '📦' },
    { title: 'Permintaan Baru', value: stats.requests, trend: 'Total', color: '#ef4444', icon: '🔔' },
  ];



  return (
    <Layout title="Admin Dashboard" allowedRoles={['admin']}>
      <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Selamat datang kembali, Administrator.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'var(--card-dark)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
               📅 {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Top Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {topCards.map((card, i) => (
            <div key={i} className="glass-card card-premium" style={{ 
              padding: '1.25rem', 
              position: 'relative', 
              overflow: 'hidden',
              background: 'var(--card-dark)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{card.title}</p>
                <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>{card.icon}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 800, 
                  margin: 0,
                  color: 'white'
                }}>
                  {loading ? '...' : (typeof card.value === 'number' ? card.value.toLocaleString() : card.value)}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: card.trend.startsWith('+') ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {card.trend}
                  </span>
                </div>
              </div>
              
              <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.03)', marginTop: '1.5rem', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '70%', height: '100%', background: card.color, boxShadow: `0 0 10px ${card.color}` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid: Charts & Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Main Chart Area */}
          <div className="glass-card card-premium" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0 }}>Tren Peminjaman Alat</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>7 Hari Terakhir</div>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121418', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--primary-color)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--primary-color)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2000}
                  />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right Column: Satisfaction & Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Satisfaction Radial */}
            <div className="glass-card card-premium" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Stok Unit Ready</h3>
              <div style={{ width: '100%', height: '180px', position: 'relative' }}>
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                    <Pie
                      data={[
                        { name: 'Ready', value: stats.satisfaction },
                        { name: 'Borrowed', value: 100 - stats.satisfaction }
                      ]}
                      cx="51%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill="var(--primary-color)" stroke="none" />
                      <Cell fill="rgba(255,255,255,0.05)" stroke="none" />
                    </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.satisfaction}%</h2>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Berdasarkan rasio ketersediaan alat saat ini.</p>
            </div>

            {/* Quick Actions */}
            <div className="glass-card card-premium" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Tindakan Cepat</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', fontSize: '0.9rem', justifyContent: 'flex-start', gap: '0.75rem' }}
                  onClick={() => window.location.href='/admin/alat'}
                >
                  <span>🔧</span> Tambah Alat Baru
                </button>
                <button 
                  className="btn" 
                  style={{ width: '100%', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', justifyContent: 'flex-start', gap: '0.75rem' }}
                  onClick={() => window.location.href='/admin/peminjaman'}
                >
                  <span>📋</span> Cek Permintaan
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}
