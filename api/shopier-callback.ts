import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const {
    platform_order_id,
    status,
    installment,
    payment_id,
    random_nr,
    signature: receivedSignature
  } = req.body;

  const apiSecret = process.env.SHOPIER_SECRET_KEY;

  if (!apiSecret) {
    console.error('Shopier API Secret is not defined in environment variables.');
    return res.status(500).send('Internal Server Error');
  }

  try {
    const dataToVerify = random_nr + platform_order_id;
    const expectedSignature = crypto.createHmac('sha256', apiSecret)
                                    .update(dataToVerify)
                                    .digest('hex');

    if (receivedSignature !== expectedSignature) {
      console.error('Shopier Callback: Invalid signature.');
      return res.status(400).send('Invalid signature');
    }

    console.log('Shopier Callback Verification Success:', req.body);

    // TODO: Add logic here to update the order status in your database
    // based on the payment status from Shopier.
    // Example:
    // const orderId = platform_order_id;
    // const paymentId = payment_id;
    // const paymentStatus = status; // 'success' or 'failure'
    // await updateOrderStatusInDB(orderId, paymentStatus, paymentId);

    console.log(`Payment status for Order ID ${platform_order_id}: ${status}`);

    // Respond to Shopier to acknowledge receipt
    res.status(200).send('OK');

  } catch (error) {
    console.error('Shopier Callback Verification Failed:', error);
    res.status(500).send('An unexpected error occurred during callback verification.');
  }
}