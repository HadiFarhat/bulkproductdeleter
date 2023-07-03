import { useState } from "react";
import axios from "axios";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [storeHash, setStoreHash] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [status, setStatus] = useState("");
  const [productsDeleted, setProductsDeleted] = useState(0);
  const [productsLeft, setProductsLeft] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setStatus("Reading products...");

    try {
      const response = await axios.post("/api/initiateDeleteProducts", {
        store_hash: storeHash,
        auth_token: authToken,
      });
      const productIds = response.data.productIds;

      if (productIds && productIds.length > 0) {
        setStatus("Deleting...");

        const eventSource = new EventSource(
          `/api/deleteProducts?store_hash=${storeHash}&auth_token=${authToken}&productIds=${productIds.join(
            ","
          )}`
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setProductsDeleted(data.productsDeleted);
          setProductsLeft(data.productsLeft);
        };

        eventSource.onerror = (event) => {
          console.error("Error from server", event);
          setStatus("An error occurred during deletion.");
          setIsDeleting(false);
        };
        eventSource.onopen = (event) => {
          console.log("Connection to server opened");
          setIsDeleting(false);
        };
        eventSource.addEventListener("done", (event) => {
          setStatus("Deletion complete.");
          eventSource.close();
          setIsDeleting(false);
        });
      } else {
        setStatus("No products to delete.");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error(error);
      setStatus("An error occurred during initiation.");
      setIsDeleting(false);
    }
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
        <button
          className={styles.button}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          Delete Products
        </button>
        <p className={styles.status}>{status}</p>
        <p>Products Deleted: {productsDeleted}</p>
        <p>Products Left: {productsLeft}</p>
      </div>
    </div>
  );
}
