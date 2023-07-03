// pages/api/initiateDeleteProducts.js

import axios from 'axios';

export default async (req, res) => {
  const store_hash = req.body.store_hash;
  const auth_token = req.body.auth_token;

  const baseURL = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/products`;
  const headers = {
    'X-Auth-Token': auth_token,
    'Accept': 'application/json'
  };

  try {
    const response = await axios.get(baseURL, { headers, params: { limit: 250 } });

    if (response.data.data.length === 0) {
      res.status(200).json({ status: 'ok', productsDeleted: 0, productsLeft: 0 });
    } else {
      const productIds = response.data.data.map(product => product.id);

      // Instead of deleting products here, send the product IDs to be deleted to the client
      res.status(200).json({ status: 'ok', productIds });
    }
  } catch (err) {
    console.error(`Error fetching products: ${err}`);
    res.status(500).json({ status: 'error', message: 'Error fetching products' });
  }
};
