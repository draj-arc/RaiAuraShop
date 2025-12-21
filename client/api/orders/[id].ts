import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrderById } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (req.method === 'GET') {
    try {
      const order = await getOrderById(id as string);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
