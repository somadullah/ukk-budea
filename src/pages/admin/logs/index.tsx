import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface LogAktifitas {
  id: number;
  username: string;
  aksi: string;
  tanggal: string;
}

export default function LogAktifitasAdmin() {
  const [logs, setLogs] = useState<LogAktifitas[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/logs');
    if (res.ok) {
      setLogs(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    void (async () => {
      await fetchLogs();
    })();
  }, []);

  return (
    <Layout title="Log Aktifitas" allowedRoles={['admin']}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Log Aktifitas</h2>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Aksi</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{textAlign: 'center'}}>Loading...</td></tr> : 
              logs.map(l => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td style={{ fontWeight: 500 }}>{l.username}</td>
                  <td>{l.aksi}</td>
                  <td>{new Date(l.tanggal).toLocaleString()}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
