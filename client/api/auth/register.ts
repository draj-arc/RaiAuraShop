import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createUser } from '../../lib/storage';
import { insertUserSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await createUser(data);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
