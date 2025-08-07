import { Request, Response } from 'express';
import * as CryptoJS from 'crypto-js';

// Shopier API bilgileri
const SHOPIER_API_KEY = '107a7821174596da16176ffe2138b709';
const SHOPIER_API_SECRET = '952d2f8f485d0d74391343c1606aa4cb';
const SHOPIER_WEBSITE_INDEX = 1;

interface ShopierCallbackData {
  platform_order_id: string;
  payment_status: string;
  total_order_value: string;
  currency: string;
  installment?: string;
  test_mode?: string;
  merchant_id?: string;
  random_nr: string;
  signature: string;
}

/**
 * Shopier callback doğrulama fonksiyonu
 */
function verifyShopierCallback(data: ShopierCallbackData): boolean {
  try {
    const {
      platform_order_id,
      payment_status,
      total_order_value,
      currency,
      random_nr,
      signature
    } = data;

    // Beklenen imzayı hesapla
    const signatureString = `${SHOPIER_API_KEY}${SHOPIER_WEBSITE_INDEX}${platform_order_id}${total_order_value}${currency}${random_nr}${SHOPIER_API_SECRET}`;
    const expectedSignature = CryptoJS.SHA256(signatureString).toString();

    console.log('🔐 Callback doğrulama:');
    console.log('Received Signature:', signature);
    console.log('Expected Signature:', expectedSignature);
    console.log('Signature String:', signatureString);

    return signature === expectedSignature;
  } catch (error) {
    console.error('❌ Callback doğrulama hatası:', error);
    return false;
  }
}

/**
 * Shopier callback handler
 */
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Shopier callback alındı:', req.body);

    const callbackData: ShopierCallbackData = {
      platform_order_id: req.body.platform_order_id,
      payment_status: req.body.payment_status,
      total_order_value: req.body.total_order_value,
      currency: req.body.currency,
      installment: req.body.installment,
      test_mode: req.body.test_mode,
      merchant_id: req.body.merchant_id,
      random_nr: req.body.random_nr,
      signature: req.body.signature
    };

    // İmza doğrulaması
    const isValid = verifyShopierCallback(callbackData);
    
    if (!isValid) {
      console.error('❌ Callback imza doğrulaması başarısız!');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('✅ Callback doğrulaması başarılı');

    // Ödeme durumunu kontrol et
    const paymentStatus = callbackData.payment_status;
    const orderId = callbackData.platform_order_id;
    const amount = callbackData.total_order_value;
    const currency = callbackData.currency;

    switch (paymentStatus) {
      case '1': // Ödeme başarılı
        console.log('✅ Başarılı ödeme:', orderId, amount, currency);
        
        // Burada sipariş bilgilerini veritabanına kaydedebilirsiniz
        // Örnek: await saveOrderToDatabase(orderId, amount, currency);
        
        // Başarılı yanıt
        res.status(200).json({ 
          success: true, 
          message: 'Payment processed successfully',
          orderId,
          amount,
          currency
        });
        break;

      case '0': // Ödeme başarısız
        console.log('❌ Başarısız ödeme:', orderId);
        res.status(200).json({ 
          success: false, 
          message: 'Payment failed',
          orderId
        });
        break;

      case '2': // Ödeme beklemede
        console.log('⏳ Bekleyen ödeme:', orderId);
        res.status(200).json({ 
          success: true, 
          message: 'Payment pending',
          orderId
        });
        break;

      default:
        console.log('❓ Bilinmeyen ödeme durumu:', paymentStatus, orderId);
        res.status(400).json({ 
          error: 'Unknown payment status',
          orderId,
          status: paymentStatus
        });
    }

  } catch (error) {
    console.error('❌ Callback işleme hatası:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}