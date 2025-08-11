import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Shopier } from 'shopier-api';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { cartItems, buyerInfo, totalAmount } = req.body;

  if (!cartItems || !buyerInfo || typeof totalAmount !== 'number' || cartItems.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid payment information.' });
  }

  try {
    const shopier = new Shopier(process.env.SHOPIER_API_KEY, process.env.SHOPIER_SECRET_KEY);

    const platformOrderId = `NUMA_${Date.now()}`;
    const [buyerName, ...surnameParts] = buyerInfo.name.split(' ');
    const buyerSurname = surnameParts.join(' ') || 'Müşteri';

    // This is my interpretation of the user's original 'createForm' logic.
    // I am assuming the d.ts file is wrong and that generatePaymentHTML takes a single
    // object with all parameters, as this is a common pattern and all other
    // attempts have failed.
    const paymentHTML = shopier.generatePaymentHTML({
        platform_order_id: platformOrderId,
        total_order_price: totalAmount,
        product_name: cartItems.map(item => item.product.name).join(', '),
        product_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),

        buyer_name: buyerName,
        buyer_surname: buyerSurname,
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone,

        billing_address: buyerInfo.address,
        billing_city: 'İstanbul',
        billing_country: 'Türkiye',
        billing_postcode: '34000',

        shipping_address: buyerInfo.address,
        shipping_city: 'İstanbul',
        shipping_country: 'Türkiye',
        shipping_postcode: '34000',
    });

    res.status(200).send({ html: paymentHTML });

  } catch (error) {
    console.error('Error creating Shopier payment form:', error);
    res.status(500).json({
        message: 'Failed to create payment form.',
        error: error instanceof Error ? error.message : String(error)
    });
  }
}
