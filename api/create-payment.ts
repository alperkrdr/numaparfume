import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Shopier } from 'shopier-api';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { cartItems, buyerInfo, discountInfo, totalAmount } = req.body;

  if (!cartItems || !buyerInfo || !totalAmount) {
    return res.status(400).json({ message: 'Missing required payment information.' });
  }

  const shopier = new Shopier(process.env.VITE_SHOPIER_API_KEY, process.env.VITE_SHOPIER_SECRET_KEY);

  const [buyerName, ...surnameParts] = buyerInfo.name.split(' ');
  const buyerSurname = surnameParts.join(' ') || 'Müşteri';

  shopier.setBuyer({
    buyer_id_nr: `USER_${Date.now()}`,
    buyer_name: buyerName,
    buyer_surname: buyerSurname,
    buyer_email: buyerInfo.email,
    buyer_phone: buyerInfo.phone,
  });

  shopier.setOrderBilling({
    billing_address: buyerInfo.address,
    billing_city: 'İstanbul', // Default, as not collected
    billing_country: 'Türkiye', // Default
    billing_postcode: '34000', // Default
  });

  shopier.setOrderShipping({
    shipping_address: buyerInfo.address,
    shipping_city: 'İstanbul', // Default
    shipping_country: 'Türkiye', // Default
    shipping_postcode: '34000', // Default
  });

  const platformOrderId = `NUMA_${Date.now()}`;
  const productName = cartItems.length === 1
    ? cartItems[0].product.name
    : `${cartItems.length} Ürün - Sepetinizdeki Ürünler`;

  shopier.setProductData(productName, 1); // ProductType: 1 for physical goods

  const paymentHTML = shopier.generatePaymentHTML(totalAmount, platformOrderId);

  res.status(200).send({ html: paymentHTML });
}
