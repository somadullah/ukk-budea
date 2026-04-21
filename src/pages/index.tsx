import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Redirecting...</div>;
}
