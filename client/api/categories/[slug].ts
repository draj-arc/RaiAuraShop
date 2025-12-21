import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCategoryBySlug } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { slug } = req.query;
    try {
      const category = await getCategoryBySlug(slug as string);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
