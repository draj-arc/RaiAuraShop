import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateProduct, deleteProduct } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (req.method === 'PUT') {
    try {
      const product = await updateProduct(id as string, req.body);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteProduct(id as string);
      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
