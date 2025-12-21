import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCategoryBySlug, updateCategory, deleteCategory } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { param } = req.query;
  if (req.method === 'GET') {
    // Try to get by slug first, fallback to ID if needed
    try {
      let category = await getCategoryBySlug(param as string);
      if (!category) {
        // Optionally, try getCategoryById(param) if you have that function
        // category = await getCategoryById(param as string);
      }
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const category = await updateCategory(param as string, req.body);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteCategory(param as string);
      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
