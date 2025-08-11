import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Shopier } from 'shopier-api';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  // Initialize with environment variables for security
  const shopier = new Shopier(process.env.VITE_SHOPIER_API_KEY, process.env.VITE_SHOPIER_SECRET_KEY);

  try {
    // The shopier-api library's callback function handles signature verification.
    // It will throw an error if the signature is invalid.
    const result = shopier.callback(req.body, process.env.VITE_SHOPIER_SECRET_KEY);
    
    console.log('Shopier Callback Verification Result:', result);

    // If the code reaches here, the signature is valid.

    // TODO: Add logic here to update the order status in your database
    // based on the payment status from Shopier.
    // Example:
    // const orderId = result.platform_order_id;
    // const paymentId = result.payment_id;
    // const status = result.status; // 'success' or 'failure'
    // await updateOrderStatusInDB(orderId, status, paymentId);

    console.log(`Payment status for Order ID ${result.platform_order_id}: ${result.status}`);

    // Respond to Shopier to acknowledge receipt
    res.status(200).send('OK');

  } catch (error) {
    console.error('Shopier Callback Verification Failed:', error);
    res.status(400).send('Invalid signature or callback data');
  }
}