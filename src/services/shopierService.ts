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
  callback_url?: string;
  return_url?: string;
}

import * as CryptoJS from 'crypto-js';

export class ShopierService {
  // Gerçek Shopier API bilgileri
  private static readonly API_KEY = '107a7821174596da16176ffe2138b709';
  private static readonly API_SECRET = '952d2f8f485d0d74391343c1606aa4cb';
  private static readonly SHOPIER_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php';
  private static readonly WEBSITE_INDEX = 1;
  private static readonly SITE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://numaparfume.com';
  
  // Gerçek test ortamı için MOCK_MODE kapalı
  private static readonly MOCK_MODE = false;
  private static readonly DEBUG_MODE = true;

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
      console.log('🔍 MOCK_MODE kontrol:', this.MOCK_MODE);
      console.log('🔍 Gerçek Shopier entegrasyonu aktif!');
      
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
      console.log('🚀 GERÇEK SHOPIER ENTEGRASYONU BAŞLIYOR!');
      const randomNr = Math.floor(Math.random() * 1000000).toString();
      const orderId = `ORDER_${Date.now()}`;
      
      if (this.DEBUG_MODE) {
        console.log('🔧 Shopier Debug - API Bilgileri:');
        console.log('API_KEY:', this.API_KEY);
        console.log('API_SECRET:', this.API_SECRET.substring(0, 8) + '...');
        console.log('WEBSITE_INDEX:', this.WEBSITE_INDEX);
        console.log('Order ID:', orderId);
        console.log('Random Nr:', randomNr);
      }

      // Shopier form verilerini hazırla
      const formData: ShopierFormData = {
        API_key: this.API_KEY,
        website_index: this.WEBSITE_INDEX,
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
        signature: this.generateSignature(randomNr, orderId, product.price.toString(), 'TRY'),
        // Return URL'leri
        callback_url: `${this.SITE_URL}/payment-callback`,
        return_url: `${this.SITE_URL}/payment-callback`
      };

      if (this.DEBUG_MODE) {
        console.log('📋 Shopier Form Data:');
        console.log('Product Name:', formData.product_name);
        console.log('Total Order Value:', formData.total_order_value);
        console.log('Buyer Name:', formData.buyer_name, formData.buyer_surname);
        console.log('Buyer Email:', formData.buyer_email);
        console.log('Signature:', formData.signature);
        console.log('Callback URL:', formData.callback_url);
      }

      // HTML form oluştur ve submit et
      const form = this.createPaymentForm(formData);
      document.body.appendChild(form);
      
      if (this.DEBUG_MODE) {
        console.log('🚀 Form oluşturuldu ve submit ediliyor...');
        console.log('Form action:', form.action);
        console.log('Form method:', form.method);
        console.log('Form elements count:', form.elements.length);
        
        // Form elementlerini listele
        for (let i = 0; i < form.elements.length; i++) {
          const element = form.elements[i] as HTMLInputElement;
          console.log(`Form field [${element.name}]:`, element.value);
        }
      }
      
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
      console.log('🔍 Cart MOCK_MODE kontrol:', this.MOCK_MODE);
      console.log('🔍 Gerçek Shopier sepet entegrasyonu aktif!');
      
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
        website_index: this.WEBSITE_INDEX,
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
        signature: this.generateSignature(randomNr, orderId, finalAmount.toString(), 'TRY'),
        // Return URL'leri
        callback_url: `${this.SITE_URL}/payment-callback`,
        return_url: `${this.SITE_URL}/payment-callback`
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
    
    if (this.DEBUG_MODE) {
      console.log('🔐 Signature Generation Debug:');
      console.log('Random Nr:', randomNr);
      console.log('Order ID:', orderId);
      console.log('Total Value:', totalValue);
      console.log('Currency:', currency);
      console.log('Concatenated Data:', data);
      console.log('API Secret (first 8 chars):', this.API_SECRET.substring(0, 8) + '...');
    }
    
    const signature = CryptoJS.HmacSHA256(data, this.API_SECRET);
    const base64Signature = CryptoJS.enc.Base64.stringify(signature);
    
    if (this.DEBUG_MODE) {
      console.log('Generated Signature:', base64Signature);
    }
    
    return base64Signature;
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