import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId, productId } = req.body || req.query;
  if (req.method === 'GET') {
    try {
      const items = await getWishlist(userId);
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const item = await addToWishlist(userId, productId);
      res.status(200).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await removeFromWishlist(userId, productId);
      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
