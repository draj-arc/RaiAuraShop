import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFeaturedProducts } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const products = await getFeaturedProducts();
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
