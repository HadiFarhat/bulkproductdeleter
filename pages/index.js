import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [storeHash, setStoreHash] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [status, setStatus] = useState('');
  const [productsDeleted, setProductsDeleted] = useState(0);
  const [productsLeft, setProductsLeft] = useState(0);

  const handleDelete = async () => {
    setStatus('Deleting...');
    const response = await axios.post('/api/deleteProducts', { store_hash: storeHash, auth_token: authToken });
    setProductsDeleted(response.data.productsDeleted);
    setProductsLeft(response.data.productsLeft);
    setStatus('Deletion complete.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <input
          className={styles.input}
          type="text"
          value={storeHash}
          onChange={(e) => setStoreHash(e.target.value)}
          placeholder="Store Hash"
        />
        <input
          className={styles.input}
          type="text"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          placeholder="Auth Token"
        />
        <button className={styles.button} onClick={handleDelete}>Delete Products</button>
        <p className={styles.status}>{status}</p>
        <p>Products Deleted: {productsDeleted}</p>
        <p>Products Left: {productsLeft}</p>
      </div>
    </div>
  );
}
