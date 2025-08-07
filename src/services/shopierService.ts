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

// Shopier Form Data Interface - Verilen örnek koda göre güncellendi
interface ShopierFormData {
  API_key: string;
  website_index: number;
  platform_order_id: string;
  product_name: string;
  buyer_name: string;
  buyer_surname: string;
  buyer_email: string;
  buyer_phone: string;
  billing_address: string;
  billing_city: string;
  billing_country: string;
  billing_postcode: string;
  total_order_value: string;
  currency: string;
  callback_url: string;
  payment_channel: string;
  is_installment: number;
  signature: string;
}

import * as CryptoJS from 'crypto-js';

export class ShopierService {
  // Gerçek Shopier API bilgileri
  private static readonly API_KEY = '107a7821174596da16176ffe2138b709';
  private static readonly API_SECRET = '952d2f8f485d0d74391343c1606aa4cb';
  private static readonly WEBSITE_INDEX = 1;
  
  // Shopier ödeme URL'i
  private static readonly PAYMENT_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php';
  
  private static readonly SITE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://numaparfume.com';
  
  // Test modunu aktif etmek için değiştirin
  private static readonly TEST_MODE = true;
  private static readonly DEBUG_MODE = true;

  /**
   * Sepet için ödeme işlemi - Verilen örnek koda göre güncellendi
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
      let totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      // İndirim varsa uygula
      if (discountInfo && discountInfo.discountAmount > 0) {
        totalAmount -= discountInfo.discountAmount;
        console.log('✅ İndirim uygulandı. Yeni toplam:', totalAmount);
      }

      // Benzersiz sipariş kodu oluştur
      const orderId = `NUMA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Müşteri adını parçala
      const [buyerName, ...surnameParts] = buyerInfo.name.split(' ');
      const buyerSurname = surnameParts.join(' ') || 'Müşteri';
      
      // Ürün adını birleştir (sepet içeriği)
      const productName = cartItems.length === 1 
        ? cartItems[0].product.name
        : `${cartItems.length} Ürün - Sepetinizdeki Ürünler`;

      // Shopier ödeme verilerini hazırla
      const paymentData: ShopierFormData = {
        API_key: this.API_KEY,
        website_index: this.WEBSITE_INDEX,
        platform_order_id: orderId,
        product_name: productName,
        buyer_name: buyerName,
        buyer_surname: buyerSurname,
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone || '5555555555',
        billing_address: 'Müşteri Adresi',
        billing_city: 'İstanbul',
        billing_country: 'Türkiye',
        billing_postcode: '34000',
        total_order_value: totalAmount.toFixed(2),
        currency: 'TRY',
        callback_url: `${this.SITE_URL}/payment-callback`,
        payment_channel: 'web',
        is_installment: 0,
        signature: '' // Aşağıda hesaplanacak
      };

      // İmza oluştur - Verilen örnek koda göre
      const signatureString = Object.values(paymentData).join('');
      const signature = CryptoJS.HmacSHA256(signatureString, this.API_SECRET).toString();
      paymentData.signature = signature;

      if (this.DEBUG_MODE) {
        console.log('🔐 İmza bilgileri:');
        console.log('Signature String:', signatureString);
        console.log('Generated Signature:', signature);
        console.log('Payment Data:', paymentData);
      }

      // Form oluştur ve submit et
      const form = this.createPaymentForm(paymentData);
      document.body.appendChild(form);
      form.submit();

      return this.PAYMENT_URL;
    } catch (error) {
      console.error('❌ Sepet ödeme hatası:', error);
      throw new Error('Sepet ödeme işlemi başlatılamadı');
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
    return this.createCartPayment(productArray, buyerInfo);
  }

  /**
   * Modern Shopier API kullanarak ödeme işlemi başlatır (Fallback)
   */
  static async createModernPayment(
    products: Array<{ product: ShopierProduct; quantity: number; }>,
    buyerInfo: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<string> {
    try {
      if (this.DEBUG_MODE) {
        console.log('🚀 Modern Shopier API çağrısı başlatılıyor...');
        console.log('Products:', products);
        console.log('Buyer:', buyerInfo);
      }

      const orderId = `NUMA_${Date.now()}`;
      const [name, ...surnameParts] = buyerInfo.name.split(' ');
      const surname = surnameParts.join(' ') || 'Müşteri';
      
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
      throw error;
    }
  }

  /**
   * Ödeme formu oluştur
   */
  private static createPaymentForm(formData: ShopierFormData): HTMLFormElement {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.PAYMENT_URL;
    form.id = 'shopier_form';
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

  /**
   * Callback doğrulama - Verilen örnek koda göre güncellendi
   */
  static verifyCallback(postData: any): boolean {
    try {
      const {
        platform_order_id,
        payment_status,
        total_order_value,
        currency,
        signature,
        random_nr
      } = postData;

      // Gelen imzayı doğrula
      const receivedSignature = signature;
      
      // Beklenen imzayı hesapla
      const signatureString = `${this.API_KEY}${this.WEBSITE_INDEX}${platform_order_id}${total_order_value}${currency}${random_nr}${this.API_SECRET}`;
      const expectedSignature = CryptoJS.SHA256(signatureString).toString();

      if (this.DEBUG_MODE) {
        console.log('🔐 Callback doğrulama:');
        console.log('Received Signature:', receivedSignature);
        console.log('Expected Signature:', expectedSignature);
        console.log('Signature String:', signatureString);
      }

      return receivedSignature === expectedSignature;
    } catch (error) {
      console.error('❌ Callback doğrulama hatası:', error);
      return false;
    }
  }

  /**
   * Sipariş durumu kontrol
   */
  static async checkOrderStatus(orderId: string): Promise<any> {
    try {
      // Shopier'dan sipariş durumu sorgula
      const response = await fetch(`${this.API_BASE_URL}/order/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: this.API_KEY,
          order_id: orderId
        })
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('❌ Sipariş durumu kontrol hatası:', error);
      return null;
    }
  }
}