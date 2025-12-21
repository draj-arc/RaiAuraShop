import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProducts, createProduct } from '../lib/storage';
import { insertProductSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const products = await getProducts();
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await createProduct(data);
      res.status(200).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
