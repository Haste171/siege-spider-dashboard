import { useState } from 'react';

type PlayerData = Record<string, any>;

export default function Dashboard() {
  const [input, setInput] = useState('');
  const [type, setType] = useState<'uplay' | 'profile_id'>('uplay');
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPlayer = async () => {
    if (!input) return;
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/lookup/${type}/${input}`
      );      
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch player data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#1e1e1e',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          padding: 24,
          backgroundColor: '#2d2d2d',
          borderRadius: 12,
          boxShadow: '0 0 20px rgba(0,0,0,0.4)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Siege Player Lookup</h2>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'uplay' | 'profile_id')}
            style={{ padding: 8, fontSize: 16 }}
          >
            <option value="uplay">Uplay</option>
            <option value="profile_id">Profile ID</option>
          </select>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={type === 'uplay' ? 'Enter Uplay Name' : 'Enter Profile ID'}
            style={{
              padding: 8,
              fontSize: 16,
              width: 300,
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: 4,
            }}
          />

          <button
            onClick={fetchPlayer}
            style={{
              padding: '8px 16px',
              fontSize: 16,
              backgroundColor: '#0078D4',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Lookup
          </button>
        </div>

        {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

        {data && (
          <pre
            style={{
              backgroundColor: '#111',
              padding: 24,
              borderRadius: 8,
              overflowX: 'auto',
              maxHeight: '60vh',
              whiteSpace: 'pre-wrap',
              fontSize: 14,
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
