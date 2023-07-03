// pages/api/deleteProducts.js

import axios from 'axios';
import async from 'async';

export default async (req, res) => {
  const store_hash = req.body.store_hash;
  const auth_token = req.body.auth_token;

  const baseURL = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/products`;
  const headers = {
    'X-Auth-Token': auth_token,
    'Accept': 'application/json'
  };

  let productIds = [];
  let page = 1;
  let productsDeleted = 0;

  const getProductIds = async () => {
    try {
      while (true) {
        const response = await axios.get(baseURL, { headers, params: { page, limit: 250 } });
        if (response.data.data.length === 0) {
          break;
        }

        productIds = productIds.concat(response.data.data.map(product => product.id));
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

      await async.eachSeries(chunks, async (chunk) => {
        await axios.delete(baseURL, {
          headers,
          params: { 'id:in': chunk.join(',') }
        });
        productsDeleted += chunk.length;
      });
    } catch (err) {
      console.error(`Error deleting products: ${err}`);
    }
  };

  await getProductIds();
  await deleteProducts();
  res.status(200).json({ status: 'ok', productsDeleted, productsLeft: productIds.length - productsDeleted });
};
