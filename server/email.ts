import { Resend } from 'resend';

// Resend API Key - Get yours free at https://resend.com
// Free tier: 100 emails/day, 3000 emails/month
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// From email - use Resend's default or your verified domain
const FROM_EMAIL = process.env.FROM_EMAIL || 'Rai Aura <onboarding@resend.dev>';

// Initialize Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Send OTP email
export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #d4af37 0%, #f5d77e 50%, #d4af37 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">RAI AURA</h1>
          <p style="color: #333; margin: 5px 0 0; font-size: 12px; letter-spacing: 3px;">FINE JEWELLERY</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px; font-weight: 400; font-size: 22px;">Verification Code</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 25px;">
            Enter the following code to verify your email and access your Rai Aura account:
          </p>
          
          <div style="background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%); border: 2px solid #d4af37; border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 25px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          
          <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          
          <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">
            If you didn't request this code, please ignore this email. Someone may have entered your email address by mistake.
          </p>
        </div>
        
        <div style="text-align: center; padding: 30px 20px;">
          <p style="color: #999; font-size: 12px; margin: 0 0 10px;">
            © ${new Date().getFullYear()} Rai Aura. All rights reserved.
          </p>
          <p style="color: #bbb; font-size: 11px; margin: 0;">
            Fine Jewellery crafted with love ✨
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // If Resend not configured, log OTP to console
  if (!resend) {
    console.log('⚠️ RESEND_API_KEY not configured. Get a free API key at https://resend.com');
    console.log(`\n📧 OTP for ${to}: ${otp}\n`);
    return true; // Return true so the flow continues
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: '🔐 Your Rai Aura Verification Code',
      html: htmlContent,
      text: `Your Rai Aura verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    });

    if (error) {
      console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
      console.log(`\n📧 OTP for ${to}: ${otp}\n`);
      return false;
    }

    console.log(`✅ OTP email sent to ${to} (ID: ${data?.id})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
    console.log(`\n📧 OTP for ${to}: ${otp}\n`);
    return false;
  }
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(
  to: string, 
  orderDetails: { 
    orderId: string; 
    customerName: string; 
    items: { name: string; quantity: number; price: string }[]; 
    total: string;
    address: string;
  }
): Promise<boolean> {
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #d4af37 0%, #f5d77e 50%, #d4af37 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">RAI AURA</h1>
          <p style="color: #333; margin: 5px 0 0; font-size: 12px; letter-spacing: 3px;">FINE JEWELLERY</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 48px;">✨</span>
            <h2 style="color: #333; margin: 10px 0 5px; font-weight: 400; font-size: 24px;">Order Confirmed!</h2>
            <p style="color: #666; margin: 0;">Thank you for shopping with us, ${orderDetails.customerName}!</p>
          </div>
          
          <div style="background: #f9f9f9; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #666; font-size: 14px;">Order ID</p>
            <p style="margin: 5px 0 0; color: #d4af37; font-weight: bold; font-size: 18px;">${orderDetails.orderId}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; color: #666; font-weight: 500;">Item</th>
                <th style="padding: 12px; text-align: center; color: #666; font-weight: 500;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #666; font-weight: 500;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px 12px; text-align: right; font-weight: bold; color: #333;">Total</td>
                <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #d4af37; font-size: 18px;">₹${orderDetails.total}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="background: #f9f9f9; border-radius: 8px; padding: 15px;">
            <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Shipping Address</p>
            <p style="margin: 0; color: #333; line-height: 1.5;">${orderDetails.address}</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 30px 20px;">
          <p style="color: #999; font-size: 12px; margin: 0 0 10px;">
            © ${new Date().getFullYear()} Rai Aura. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`📧 Order confirmation would be sent to ${to} for order ${orderDetails.orderId}`);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `✨ Order Confirmed - ${orderDetails.orderId}`,
      html: htmlContent,
    });

    if (error) {
      console.error(`❌ Failed to send order confirmation to ${to}:`, error.message);
      return false;
    }

    console.log(`✅ Order confirmation email sent to ${to} (ID: ${data?.id})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send order confirmation to ${to}:`, error.message);
    return false;
  }
}
