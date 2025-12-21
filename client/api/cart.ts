import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCartItems, addToCart, updateCartItem, removeFromCart, clearCart } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId, sessionId, id, quantity } = req.body || req.query;
  if (req.method === 'GET') {
    try {
      const items = await getCartItems(userId, sessionId);
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const item = await addToCart(req.body);
      res.status(200).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const item = await updateCartItem(id, quantity);
      res.status(200).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (id) {
        await removeFromCart(id);
      } else {
        await clearCart(userId, sessionId);
      }
      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
