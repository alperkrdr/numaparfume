interface ShopierProduct {
  name: string;
  price: number;
  currency: string;
  description?: string;
  image_url?: string;
  category?: string;
  quantity?: number;
}

interface ShopierFormData {
  API_key: string;
  website_index: number;
  platform_order_id: string;
  product_name: string;
  product_type: number;
  total_order_value: string;
  currency: string;
  buyer_name: string;
  buyer_surname: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_account_age: number;
  buyer_id_nr: string;
  billing_address: string;
  billing_city: string;
  billing_country: string;
  billing_postcode: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postcode: string;
  modul_version: string;
  random_nr: string;
  signature: string;
}

import * as CryptoJS from 'crypto-js';

export class ShopierService {
  // Gerçek Shopier API bilgileri
  private static readonly API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI3NmNkNDQ3NTZiYmI5MTFhOTMzOTY0ZWUyYWMyYmUyZiIsImp0aSI6IjlhZjY0ZjhjOWY5NGYzMTRmNjliM2FiOTZjMTFkMDFkNDI0ZGE2ZTY3NTQxMzQ5M2VjYmY4YjAwMjkxMTYzNjI2OGVkNjEzNjM0YzEzODk5MGRmZDY3ZWJiNWNhMTRiZDUzZmQ1NWE1MjJmNjg1MWY0YzU1NzhiZWZhMDIxODIwMzhjZTE1Y2U4M2IzZmZhYmZkNmU2YWRlMGViYmE5MDIiLCJpYXQiOjE3NTEyNDA0MDMsIm5iZiI6MTc1MTI0MDQwMywiZXhwIjoxOTA5MDI1MTYzLCJzdWIiOiIyMDEwNjg2Iiwic2NvcGVzIjpbIm9yZGVyczpyZWFkIiwib3JkZXJzOndyaXRlIiwicHJvZHVjdHM6cmVhZCIsInByb2R1Y3RzOndyaXRlIiwic2hpcHBpbmdzOnJlYWQiLCJzaGlwcGluZ3M6d3JpdGUiLCJkaXNjb3VudHM6cmVhZCIsImRpc2NvdW50czp3cml0ZSIsInBheW91dHM6cmVhZCIsInJlZnVuZHM6cmVhZCIsInJlZnVuZHM6d3JpdGUiLCJzaG9wOnJlYWQiLCJzaG9wOndyaXRlIl19.m6odt8Ov9DJzgcx1wZp5lqoGqAB6Lf-ydOk5DvVR6gkZ8HutyyLZQnhuvmvL-q1B1ZulWqEWBCIwTNf3tnqprX5r-ovP_jFnd3eavah96FmLhLZ9q854iNRGsCsnxFi6Jiv_u7cpkwtpbndrtXIdhlyNGk8iubtn5AWYtX0_SqmjVVKUR1W9wSujUzX0C8IEUjv9EPCfE31gUGmrnBJtzAQIKzcl0_O-6MI3zRH0yup6JtOxz0GUFvAEcsfSZaYqN0F0l9ppQLfiQsnUuKW2FZ9MKHOcTOJ4BCqcOSgpX_U7a4RJMvrb3tRfumDxsrlmiGuRHBioqAftfKllN6VOBg';
  private static readonly API_SECRET = 'secret'; // Geçici olarak, gerçek secret key gerekebilir
  private static readonly SHOPIER_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php';
  
  // Gerçek Shopier entegrasyonu aktif
  private static readonly MOCK_MODE = false;

  // Tek ürün için ödeme formu oluştur
  static async createSingleProductPayment(
    product: ShopierProduct,
    buyerInfo: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<string> {
    try {
      if (this.MOCK_MODE) {
        console.log('💳 Shopier Ödeme İşlemi Başlatılıyor...');
        console.log('📦 Ürün:', product.name, '- Fiyat:', product.price, 'TL');
        console.log('👤 Müşteri:', buyerInfo.name, '/', buyerInfo.email);
        
        // Gerçek API gecikmesi simülasyonu
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo ödeme URL'si
        const mockPaymentUrl = `https://secure-payment-demo.vercel.app/?` + 
          `merchant=numa-parfume&` +
          `product=${encodeURIComponent(product.name)}&` +
          `price=${product.price}&` +
          `currency=TRY&` +
          `buyer=${encodeURIComponent(buyerInfo.name)}&` +
          `email=${encodeURIComponent(buyerInfo.email)}&` +
          `success_url=${encodeURIComponent(window.location.origin + '/payment-success')}&` +
          `fail_url=${encodeURIComponent(window.location.origin + '/payment-failed')}&` +
          `demo=1`;
        
        console.log('✅ Demo ödeme URL\'si hazırlandı');
        return mockPaymentUrl;
      }

      // Gerçek Shopier form verileri
      const randomNr = Math.floor(Math.random() * 1000000).toString();
      const orderId = `ORDER_${Date.now()}`;
      
      // Shopier form verilerini hazırla
      const formData: ShopierFormData = {
        API_key: this.API_KEY,
        website_index: 1,
        platform_order_id: orderId,
        product_name: product.name,
        product_type: 1, // 1: Fiziksel ürün
        total_order_value: product.price.toString(),
        currency: 'TRY',
        buyer_name: buyerInfo.name.split(' ')[0] || buyerInfo.name,
        buyer_surname: buyerInfo.name.split(' ')[1] || '',
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone || '5000000000',
        buyer_account_age: 1,
        buyer_id_nr: '12345678901',
        billing_address: 'Adres bilgisi',
        billing_city: 'Istanbul',
        billing_country: 'Turkey',
        billing_postcode: '34000',
        shipping_address: 'Adres bilgisi',
        shipping_city: 'Istanbul',
        shipping_country: 'Turkey',
        shipping_postcode: '34000',
        modul_version: 'NUMAPERFUME_1.0',
        random_nr: randomNr,
        signature: this.generateSignature(randomNr, orderId, product.price.toString(), 'TRY')
      };

      // HTML form oluştur ve submit et
      const form = this.createPaymentForm(formData);
      document.body.appendChild(form);
      form.submit();

      return this.SHOPIER_URL;
    } catch (error) {
      console.error('Shopier ödeme hatası:', error);
      throw new Error('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    }
  }

  // Sepet için ödeme formu oluştur
  static async createCartPayment(
    cartItems: Array<{
      product: ShopierProduct;
      quantity: number;
    }>,
    buyerInfo: {
      name: string;
      email: string;
      phone?: string;
    },
    discountInfo?: {
      discountAmount: number;
      campaignTitle: string;
    }
  ): Promise<string> {
    try {
      if (this.MOCK_MODE) {
        console.log('🛒 Sepet Ödeme İşlemi Başlatılıyor...');
        console.log('📦 Sepet:', cartItems.length, 'ürün');
        console.log('👤 Müşteri:', buyerInfo.name, '/', buyerInfo.email);
        console.log('💰 İndirim:', discountInfo ? discountInfo.discountAmount + ' TL' : 'Yok');
        
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const finalAmount = totalAmount - (discountInfo?.discountAmount || 0);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockPaymentUrl = `https://secure-payment-demo.vercel.app/?` + 
          `merchant=numa-parfume&` +
          `cart=1&` +
          `items=${cartItems.length}&` +
          `total=${finalAmount}&` +
          `currency=TRY&` +
          `buyer=${encodeURIComponent(buyerInfo.name)}&` +
          `email=${encodeURIComponent(buyerInfo.email)}&` +
          `discount=${discountInfo?.discountAmount || 0}&` +
          `campaign=${encodeURIComponent(discountInfo?.campaignTitle || '')}&` +
          `success_url=${encodeURIComponent(window.location.origin + '/payment-success')}&` +
          `fail_url=${encodeURIComponent(window.location.origin + '/payment-failed')}&` +
          `demo=1`;
        
        console.log('✅ Demo sepet ödeme URL\'si hazırlandı');
        return mockPaymentUrl;
      }

      // Sepet toplamını hesapla
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const finalAmount = totalAmount - (discountInfo?.discountAmount || 0);
      
      // Ürün ismilerini birleştir
      const productNames = cartItems.map(item => `${item.product.name} (${item.quantity}x)`).join(', ');
      
      const randomNr = Math.floor(Math.random() * 1000000).toString();
      const orderId = `CART_${Date.now()}`;
      
      const formData: ShopierFormData = {
        API_key: this.API_KEY,
        website_index: 1,
        platform_order_id: orderId,
        product_name: productNames,
        product_type: 1,
        total_order_value: finalAmount.toString(),
        currency: 'TRY',
        buyer_name: buyerInfo.name.split(' ')[0] || buyerInfo.name,
        buyer_surname: buyerInfo.name.split(' ')[1] || '',
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone || '5000000000',
        buyer_account_age: 1,
        buyer_id_nr: '12345678901',
        billing_address: 'Adres bilgisi',
        billing_city: 'Istanbul',
        billing_country: 'Turkey',
        billing_postcode: '34000',
        shipping_address: 'Adres bilgisi',
        shipping_city: 'Istanbul',
        shipping_country: 'Turkey',
        shipping_postcode: '34000',
        modul_version: 'NUMAPERFUME_1.0',
        random_nr: randomNr,
        signature: this.generateSignature(randomNr, orderId, finalAmount.toString(), 'TRY')
      };

      const form = this.createPaymentForm(formData);
      document.body.appendChild(form);
      form.submit();

      return this.SHOPIER_URL;
    } catch (error) {
      console.error('Shopier sepet ödeme hatası:', error);
      throw new Error('Sepet ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    }
  }

  // HMAC-SHA256 imza oluştur (Shopier formatına uygun)
  private static generateSignature(randomNr: string, orderId: string, totalValue: string, currency: string): string {
    const data = randomNr + orderId + totalValue + currency;
    const signature = CryptoJS.HmacSHA256(data, this.API_SECRET);
    return CryptoJS.enc.Base64.stringify(signature);
  }

  // HTML form oluştur
  private static createPaymentForm(formData: ShopierFormData): HTMLFormElement {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.SHOPIER_URL;

    // Form verilerini ekle
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    });

    return form;
  }

  // Ödeme durumunu kontrol et
  static async checkOrderStatus(orderId: string): Promise<any> {
    console.log('Sipariş durumu kontrol ediliyor:', orderId);
    // Shopier'da sipariş durumu sorgulama API'si olmadığı için callback ile çalışır
    return { status: 'pending', message: 'Callback bekleniyor' };
  }

  // Callback doğrulama (Shopier'dan gelen ödeme sonucunu doğrular)
  static verifyCallback(postData: any): boolean {
    try {
      const { random_nr, platform_order_id, total_order_value, currency, signature } = postData;
      const data = random_nr + platform_order_id + total_order_value + currency;
      
      // Aynı şekilde HMAC-SHA256 ile imza oluştur
      const expectedSignature = CryptoJS.HmacSHA256(data, this.API_SECRET);
      const expectedSignatureBase64 = CryptoJS.enc.Base64.stringify(expectedSignature);
      
      const isValid = signature === expectedSignatureBase64;
      
      if (isValid) {
        console.log('✅ Shopier callback doğrulandı - Ödeme geçerli');
      } else {
        console.error('❌ Shopier callback doğrulanamadı - Güvenlik sorunu!');
      }
      
      return isValid;
    } catch (error) {
      console.error('Callback doğrulama hatası:', error);
      return false;
    }
  }
}