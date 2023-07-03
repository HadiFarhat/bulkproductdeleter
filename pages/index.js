// pages/index.js

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [storeHash, setStoreHash] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [status, setStatus] = useState('');

  const handleDelete = async () => {
    setStatus('Deleting...');
    await axios.post('/api/deleteProducts', { store_hash: storeHash, auth_token: authToken });
    setStatus('Deletion complete.');
  };

  return (
    <div>
      <input
        type="text"
        value={storeHash}
        onChange={(e) => setStoreHash(e.target.value)}
        placeholder="Store Hash"
      />
      <input
        type="text"
        value={authToken}
        onChange={(e) => setAuthToken(e.target.value)}
        placeholder="Auth Token"
      />
      <button onClick={handleDelete}>Delete Products</button>
      <p>{status}</p>
    </div>
  );
}
