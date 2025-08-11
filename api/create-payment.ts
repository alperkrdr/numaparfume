import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Shopier } from 'shopier-api';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { cartItems, buyerInfo, totalAmount } = req.body;

  if (!cartItems || !buyerInfo || !totalAmount) {
    return res.status(400).json({ message: 'Missing required payment information.' });
  }

  try {
    const shopier = new Shopier(process.env.VITE_SHOPIER_API_KEY, process.env.VITE_SHOPIER_SECRET_KEY);

    const [buyerName, ...surnameParts] = buyerInfo.name.split(' ');
    const buyerSurname = surnameParts.join(' ') || 'Müşteri';
    const platformOrderId = `NUMA_${Date.now()}`;
    const productName = cartItems.length === 1
      ? cartItems[0].product.name
      : `${cartItems.length} Ürün - Sepetinizdeki Ürünler`;

    shopier.setBuyer({
      platform_order_id: platformOrderId,
      product_name: productName,
      buyer_id_nr: `USER_${Date.now()}`,
      buyer_name: buyerName,
      buyer_surname: buyerSurname,
      buyer_email: buyerInfo.email,
      buyer_phone: buyerInfo.phone,
    });

    shopier.setOrderBilling({
      billing_address: buyerInfo.address,
      billing_city: 'İstanbul',
      billing_country: 'Türkiye',
      billing_postcode: '34000',
    });

    shopier.setOrderShipping({
      shipping_address: buyerInfo.address,
      shipping_city: 'İstanbul',
      shipping_country: 'Türkiye',
      shipping_postcode: '34000',
    });

    const paymentHTML = shopier.generatePaymentHTML(totalAmount);

    res.status(200).send({ html: paymentHTML });

  } catch (error) {
    console.error('Error creating Shopier payment form:', error);
    res.status(500).json({ message: 'Failed to create payment form.', error: (error as Error).message });
  }
}
