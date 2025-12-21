import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCategories, createCategory } from '../lib/storage';
import { insertCategorySchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const categories = await getCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await createCategory(data);
      res.status(200).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
