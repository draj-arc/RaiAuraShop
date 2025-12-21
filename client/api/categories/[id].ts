import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateCategory, deleteCategory } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (req.method === 'PUT') {
    try {
      const category = await updateCategory(id as string, req.body);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteCategory(id as string);
      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
