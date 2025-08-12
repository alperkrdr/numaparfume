const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { cartItems, buyerInfo, totalAmount } = req.body;

  if (!cartItems || !buyerInfo || typeof totalAmount !== 'number' || cartItems.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid payment information.' });
  }

  try {
    const apiKey = process.env.SHOPIER_API_KEY;
    const apiSecret = process.env.SHOPIER_SECRET_KEY;
    const websiteIndex = process.env.VITE_SHOPIER_WEBSITE_INDEX || '1';

    if (!apiKey || !apiSecret) {
        throw new Error('Shopier API Key or Secret is not defined in environment variables.');
    }

    const platformOrderId = `NUMA_${Date.now()}`;
    const [buyerName, ...surnameParts] = buyerInfo.name.split(' ');
    const buyerSurname = surnameParts.join(' ') || 'Müşteri';
    const productName = cartItems.map(item => item.product.name).join(', ');
    const randomNr = Math.floor(Math.random() * 999999);

    const paymentData = {
        API_key: apiKey,
        website_index: websiteIndex,
        platform_order_id: platformOrderId,
        product_name: productName,
        product_type: '1', // 1: Physical, 2: Digital
        buyer_name: buyerName,
        buyer_surname: buyerSurname,
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone,
        billing_address: buyerInfo.address,
        billing_city: 'İstanbul',
        billing_country: 'TR',
        billing_postcode: '34000',
        shipping_address: buyerInfo.address,
        shipping_city: 'İstanbul',
        shipping_country: 'TR',
        shipping_postcode: '34000',
        total_order_value: totalAmount.toFixed(2),
        currency: 'TRY',
        platform: 0, // 0: Web, 1: Mobile, 2: API
        is_installment: '0', // 0: No, 1: Yes
        "continue_url": `https://www.numaparfume.com/payment-success?orderId=${platformOrderId}`,
        random_nr: randomNr.toString(),
    };

    const signatureData = [
        paymentData.platform_order_id,
        paymentData.total_order_value,
        paymentData.currency,
        paymentData.random_nr
    ].join('');

    const signature = crypto.createHmac('sha256', apiSecret)
                            .update(signatureData)
                            .digest('hex');

    const formFields = { ...paymentData, signature };

    let formHTML = '<form id="shopier_form" method="post" action="https://www.shopier.com/ShowProduct/api_pay4.php">';
    for (const [key, value] of Object.entries(formFields)) {
        formHTML += `<input type="hidden" name="${key}" value="${String(value).replace(/"/g, '&quot;')}">`;
    }
    formHTML += '<input type="submit" style="display: none;"></form>';

    res.status(200).send({ html: formHTML });

  } catch (error) {
    console.error('Error creating Shopier payment form:', error);
    res.status(500).json({
        message: 'Failed to create payment form.',
        error: error instanceof Error ? error.message : String(error)
    });
  }
};
