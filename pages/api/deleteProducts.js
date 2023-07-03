// pages/api/deleteProducts.js

import axios from "axios";
import async from "async";

export default async (req, res) => {
  const store_hash = req.query.store_hash;
  const auth_token = req.query.auth_token;
  let productIds = req.query.productIds.split(",").map(Number);

  const baseURL = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/products`;
  const headers = {
    "X-Auth-Token": auth_token,
    Accept: "application/json",
  };

  let page = 1;
  let productsDeleted = 0;

  const getProductIds = async () => {
    try {
      while (true) {
        console.log(baseURL);
        const response = await axios.get(baseURL, {
          headers,
          params: { page, limit: 250 },
        });
        if (response.data.data.length === 0) {
          break;
        }

        productIds = productIds.concat(
          response.data.data.map((product) => product.id)
        );
        page += 1;
      }
    } catch (err) {
      console.error(`Error fetching products: ${err}`);
    }
  };

  const deleteProducts = async () => {
    try {
      const chunks = [];

      for (let i = 0; i < productIds.length; i += 250) {
        chunks.push(productIds.slice(i, i + 250));
      }

      for (let chunk of chunks) {
        await axios.delete(baseURL, {
          headers,
          params: { "id:in": chunk.join(",") },
        });
        productsDeleted += chunk.length;
        res.write(
          `data: ${JSON.stringify({
            productsDeleted,
            productsLeft: productIds.length - productsDeleted,
          })}\n\n`
        );
      }
    } catch (err) {
      console.error(`Error deleting products: ${err}`);
      res.status(500).json({ error: "Error deleting products." });
      return;
    }
  };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  await getProductIds();
  await deleteProducts();
  res.write(`event: done\ndata: Deletion complete.\n\n`);
  res.end();
};
