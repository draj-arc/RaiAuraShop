import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserByEmail } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;
    try {
      const user = await getUserByEmail(email);
      res.status(200).json({ exists: !!user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
