interface ShopierProduct {
  name: string;
  price: number;
  currency: string;
  description?: string;
  image_url?: string;
  category?: string;
  quantity?: number;
}

interface ShopierPaymentRequest {
  api_key: string;
  api_secret: string;
  website_index: number;
  order_id: string;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  buyer: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postcode: string;
  };
  callback_url: string;
  return_url: string;
  currency: string;
  language: string;
}

// Legacy form interface for direct payment
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
  private static readonly WEBSITE_INDEX = 1;
  
  // Modern API endpoints
  private static readonly API_BASE_URL = 'https://api.shopier.com/v1';
  private static readonly PAYMENT_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php';
  
  private static readonly SITE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://numaparfume.com';
  
  // Production modu - gerçek ödeme için true yapın
  private static readonly TEST_MODE = false;
  private static readonly DEBUG_MODE = true;

  /**
   * Sepet toplam tutarını hesapla (kampanya indirimleri dahil)
   */
  private static calculateCartTotal(
    cartItems: Array<{ product: ShopierProduct; quantity: number; }>,
    discountInfo?: { discountAmount: number; campaignTitle: string; }
  ): number {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    if (discountInfo && discountInfo.discountAmount > 0) {
      return Math.max(0, subtotal - discountInfo.discountAmount);
    }
    
    return subtotal;
  }

  /**
   * Modern Shopier API kullanarak ödeme işlemi başlatır
   */
  static async createModernPayment(
    products: Array<{ product: ShopierProduct; quantity: number; }>,
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
      if (this.DEBUG_MODE) {
        console.log('🚀 Modern Shopier API çağrısı başlatılıyor...');
        console.log('Products:', products);
        console.log('Buyer:', buyerInfo);
        console.log('Discount:', discountInfo);
      }

      const orderId = `NUMA_${Date.now()}`;
      const [name, ...surnameParts] = buyerInfo.name.split(' ');
      const surname = surnameParts.join(' ') || 'Müşteri';
      
      // Toplam tutarı hesapla
      const totalAmount = this.calculateCartTotal(products, discountInfo);
      
      if (this.DEBUG_MODE) {
        console.log('💰 Hesaplanan toplam tutar:', totalAmount);
      }

      const paymentRequest: ShopierPaymentRequest = {
        api_key: this.API_KEY,
        api_secret: this.API_SECRET,
        website_index: this.WEBSITE_INDEX,
        order_id: orderId,
        products: products.map(item => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category || 'Parfüm'
        })),
        buyer: {
          name: name,
          surname: surname,
          email: buyerInfo.email,
          phone: buyerInfo.phone || '5555555555',
          address: 'Test Adres',
          city: 'İstanbul',
          country: 'Turkey',
          postcode: '34000'
        },
        callback_url: `${this.SITE_URL}/payment-callback`,
        return_url: `${this.SITE_URL}/payment-success`,
        currency: 'TRY',
        language: 'TR'
      };

      if (this.TEST_MODE) {
        // Test modunda direkt ödeme formunu kullan
        return this.createDirectPaymentForm(products[0].product, buyerInfo, totalAmount, discountInfo);
      }

      // Gerçek API çağrısı
      const response = await fetch(`${this.API_BASE_URL}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      if (this.DEBUG_MODE) {
        console.log('✅ Shopier API response:', result);
      }

      if (result.success && result.payment_url) {
        return result.payment_url;
      } else {
        throw new Error(result.message || 'Ödeme URL\'si alınamadı');
      }

    } catch (error) {
      console.error('❌ Modern Shopier API hatası:', error);
      
      // Fallback: Direkt form yöntemi
      console.log('🔄 Fallback: Direkt form yöntemine geçiliyor...');
      const totalAmount = this.calculateCartTotal(products, discountInfo);
      return this.createDirectPaymentForm(products[0].product, buyerInfo, totalAmount, discountInfo);
    }
  }

  /**
   * Tek ürün için ödeme işlemi
   */
  static async createSingleProductPayment(
    product: ShopierProduct,
    buyerInfo: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<string> {
    const productArray = [{ product, quantity: 1 }];
    return this.createModernPayment(productArray, buyerInfo);
  }

  /**
   * Sepet için ödeme işlemi - İYİLEŞTİRİLMİŞ VERSİYON
   */
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
      console.log('🛒 Sepet ödeme işlemi başlatılıyor...');
      console.log('📦 Sepet:', cartItems.length, 'ürün');
      console.log('💰 İndirim:', discountInfo ? discountInfo.discountAmount + ' TL' : 'Yok');
      
      // Toplam tutarı hesapla
      const totalAmount = this.calculateCartTotal(cartItems, discountInfo);
      console.log('💳 Shopier\'e gönderilecek toplam tutar:', totalAmount, 'TL');
      
      // Eğer toplam tutar 0 veya negatifse hata ver
      if (totalAmount <= 0) {
        throw new Error('Geçersiz toplam tutar. Lütfen sepetinizi kontrol edin.');
      }

      return this.createModernPayment(cartItems, buyerInfo, discountInfo);
    } catch (error) {
      console.error('❌ Sepet ödeme hatası:', error);
      throw new Error('Sepet ödeme işlemi başlatılamadı: ' + error.message);
    }
  }

  /**
   * Direkt ödeme formu oluştur (fallback method) - İYİLEŞTİRİLMİŞ
   */
  private static createDirectPaymentForm(
    product: ShopierProduct,
    buyerInfo: { name: string; email: string; phone?: string; },
    totalAmount: number,
    discountInfo?: { discountAmount: number; campaignTitle: string; }
  ): string {
    try {
      console.log('📋 Direkt ödeme formu oluşturuluyor...');
      console.log('💳 Toplam tutar:', totalAmount, 'TL');
      
      const randomNr = Math.floor(Math.random() * 1000000).toString();
      const orderId = `NUMA_${Date.now()}`;
      const [buyerName, ...surnameArray] = buyerInfo.name.split(' ');
      const buyerSurname = surnameArray.join(' ') || '';
      
      // Ürün adını oluştur (kampanya varsa dahil et)
      let productName = product.name;
      if (discountInfo && discountInfo.campaignTitle) {
        productName = `${product.name} - ${discountInfo.campaignTitle}`;
      }
      
      // İmza oluştur
      const signatureString = `${this.API_KEY}${this.WEBSITE_INDEX}${orderId}${totalAmount.toFixed(2)}TRY${randomNr}${this.API_SECRET}`;
      const signature = CryptoJS.SHA256(signatureString).toString();
      
      if (this.DEBUG_MODE) {
        console.log('🔐 İmza bilgileri:');
        console.log('Signature String:', signatureString);
        console.log('Generated Signature:', signature);
        console.log('📦 Ürün adı:', productName);
      }

      const formData: ShopierFormData = {
        API_key: this.API_KEY,
        website_index: this.WEBSITE_INDEX,
        platform_order_id: orderId,
        product_name: productName,
        product_type: 1,
        total_order_value: totalAmount.toFixed(2),
        currency: 'TRY',
        buyer_name: buyerName,
        buyer_surname: buyerSurname,
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone || '5555555555',
        buyer_account_age: 1,
        buyer_id_nr: '11111111111',
        billing_address: 'Test Adres',
        billing_city: 'İstanbul',
        billing_country: 'Turkey',
        billing_postcode: '34000',
        shipping_address: 'Test Adres',
        shipping_city: 'İstanbul',
        shipping_country: 'Turkey',
        shipping_postcode: '34000',
        modul_version: 'NUMA_PARFUME_2.0',
        random_nr: randomNr,
        signature: signature,
        callback_url: `${this.SITE_URL}/payment-callback`,
        return_url: `${this.SITE_URL}/payment-success`
      };

      // Form oluştur ve submit et
      const form = this.createPaymentForm(formData);
      document.body.appendChild(form);
      form.submit();

      return this.PAYMENT_URL;
    } catch (error) {
      console.error('❌ Direkt form oluşturma hatası:', error);
      throw error;
    }
  }

  private static generateSignature(randomNr: string, orderId: string, totalValue: string, currency: string): string {
    const signatureString = `${this.API_KEY}${this.WEBSITE_INDEX}${orderId}${totalValue}${currency}${randomNr}${this.API_SECRET}`;
    return CryptoJS.SHA256(signatureString).toString();
  }

  private static createPaymentForm(formData: ShopierFormData): HTMLFormElement {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.PAYMENT_URL;
    form.style.display = 'none';

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    return form;
  }

  static async checkOrderStatus(orderId: string): Promise<any> {
    // Sipariş durumu kontrol API'si
    // Bu fonksiyon webhook'lar için kullanılabilir
    return null;
  }

  /**
   * Callback doğrulama - GÜVENLİK İÇİN EKLENDİ
   */
  static verifyCallback(postData: any): boolean {
    try {
      // Gerekli alanları kontrol et
      if (!postData.signature || !postData.platform_order_id || !postData.total_order_value) {
        console.error('❌ Callback doğrulama: Eksik alanlar');
        return false;
      }

      // İmzayı yeniden oluştur
      const signatureString = `${this.API_KEY}${this.WEBSITE_INDEX}${postData.platform_order_id}${postData.total_order_value}TRY${postData.random_nr || ''}${this.API_SECRET}`;
      const expectedSignature = CryptoJS.SHA256(signatureString).toString();

      // İmzaları karşılaştır
      const isValid = postData.signature === expectedSignature;

      if (this.DEBUG_MODE) {
        console.log('🔐 Callback doğrulama:');
        console.log('Received signature:', postData.signature);
        console.log('Expected signature:', expectedSignature);
        console.log('Is valid:', isValid);
      }

      return isValid;
    } catch (error) {
      console.error('❌ Callback doğrulama hatası:', error);
      return false;
    }
  }
}