import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendOTPEmail } from '../../lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { to, otp } = req.body;
    try {
      const sent = await sendOTPEmail(to, otp);
      res.status(200).json({ sent });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
