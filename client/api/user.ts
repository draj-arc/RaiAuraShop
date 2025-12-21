import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUser, updateUser } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.body || req.query;
  if (req.method === 'GET') {
    try {
      const user = await getUser(id);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const user = await updateUser(id, req.body);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
