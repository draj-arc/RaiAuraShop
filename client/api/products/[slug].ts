import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProductBySlug } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { slug } = req.query;
    try {
      const product = await getProductBySlug(slug as string);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
