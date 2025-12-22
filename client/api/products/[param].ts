import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProductBySlug, updateProduct, deleteProduct } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { param } = req.query;
  if (req.method === 'GET') {
    // Try to get by slug first, fallback to ID if needed
    try {
      let product = await getProductBySlug(param as string);
      if (!product) {
        // Optionally, try getProductById(param) if you have that function
        // product = await getProductById(param as string);
      }
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const product = await updateProduct(param as string, req.body);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteProduct(param as string);
      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
