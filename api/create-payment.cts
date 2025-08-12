const { VercelRequest, VercelResponse } = require('@vercel/node');
const { Shopier } = require('shopier-api');

module.exports = (req, res) => {
  console.log(`Received request with method: ${req.method}`);
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Only POST requests are allowed',
      received_method: req.method
    });
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

    // NOTE: My previous attempt to fix this by changing the call signature was also wrong.
    // The library was crashing due to the module issue before this code was even reached.
    // I am reverting to the most logical implementation based on the d.ts file, which is
    // to use setBuyer, setOrderBilling, etc. The root cause was the module system,
    // not the logic of the calls.
    shopier.setBuyer({
      platform_order_id: platformOrderId,
      product_name: cartItems.map(item => item.product.name).join(', '),
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
    res.status(500).json({
        message: 'Failed to create payment form.',
        error: error instanceof Error ? error.message : String(error)
    });
  }
};
