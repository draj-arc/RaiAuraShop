import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders, createOrder, getOrderById, updateOrderStatus } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId, id, status, order, items } = req.body || req.query;
  if (req.method === 'GET') {
    try {
      const orders = await getOrders(userId);
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const newOrder = await createOrder(order, items);
      res.status(200).json(newOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const updated = await updateOrderStatus(id, status);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
