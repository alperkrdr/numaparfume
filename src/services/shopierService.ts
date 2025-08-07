import * as CryptoJS from 'crypto-js';
import { getShopierConfig } from '../config/shopierConfig';

// Arayüzler
interface ShopierProduct {
  name: string;
  price: number;
  currency: 'TRY';
  description?: string;
  image_url?: string;
  category?: string;
}

interface ShopierCartItem {
  product: ShopierProduct;
  quantity: number;
}

interface BuyerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface DiscountInfo {
  discountAmount: number;
  campaignTitle: string;
}

// Shopier'a gönderilecek form verisi
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
  callback_url: string;
  return_url: string;
}

export class ShopierService {
  /**
   * Sepet için ödeme işlemi başlatır.
   * Bu fonksiyon, tüm ürünleri tek bir "Sepet" ürünü olarak birleştirir
   * ve Shopier'a form gönderimi ile ödeme işlemini başlatır.
   */
  static async createCartPayment(
    cartItems: ShopierCartItem[],
    buyerInfo: BuyerInfo,
    discountInfo?: DiscountInfo
  ): Promise<void> {
    const config = getShopierConfig();

    if (config.DEBUG_MODE) {
      console.log('🛒 Shopier Ödeme Başlatılıyor...');
      console.log('📦 Sepet:', cartItems);
      console.log('👤 Alıcı:', buyerInfo);
      console.log('💰 İndirim:', discountInfo);
    }

    // 1. Toplam tutarı ve indirimli tutarı hesapla
    const totalOriginal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const finalTotal = totalOriginal - (discountInfo?.discountAmount || 0);

    // 2. Shopier için tek bir ürün adı oluştur
    const productName = cartItems.length > 1
      ? `Numa Parfüm - ${cartItems.length} Adet Ürün`
      : cartItems[0].product.name;

    // 3. Form verisini oluştur
    const orderId = `NUMA_${Date.now()}`;
    const randomNr = Math.floor(Math.random() * 1000000).toString();
    const [buyerName, ...surnameArray] = buyerInfo.name.split(' ');
    const buyerSurname = surnameArray.join(' ') || 'Müşteri';

    const signature = this.generateSignature(
      randomNr,
      orderId,
      finalTotal.toFixed(2),
      config.CURRENCY,
      config.API_KEY,
      config.SECRET_KEY,
      config.WEBSITE_INDEX
    );

    const siteUrl = window.location.hostname === 'localhost'
      ? config.SITE_URL.development
      : config.SITE_URL.production;

    const formData: ShopierFormData = {
      API_key: config.API_KEY,
      website_index: config.WEBSITE_INDEX,
      platform_order_id: orderId,
      product_name: productName,
      product_type: config.PRODUCT_TYPE,
      total_order_value: finalTotal.toFixed(2),
      currency: config.CURRENCY,
      buyer_name: buyerName,
      buyer_surname: buyerSurname,
      buyer_email: buyerInfo.email,
      buyer_phone: buyerInfo.phone || config.DEFAULT_BUYER.phone,
      buyer_account_age: config.DEFAULT_BUYER.account_age,
      buyer_id_nr: config.DEFAULT_BUYER.id_nr,
      billing_address: buyerInfo.address || config.DEFAULT_BUYER.billing_address,
      billing_city: config.DEFAULT_BUYER.billing_city,
      billing_country: config.DEFAULT_BUYER.billing_country,
      billing_postcode: config.DEFAULT_BUYER.billing_postcode,
      shipping_address: buyerInfo.address || config.DEFAULT_BUYER.shipping_address,
      shipping_city: config.DEFAULT_BUYER.shipping_city,
      shipping_country: config.DEFAULT_BUYER.shipping_country,
      shipping_postcode: config.DEFAULT_BUYER.shipping_postcode,
      modul_version: config.MODULE_VERSION,
      random_nr: randomNr,
      signature: signature,
      callback_url: `${siteUrl}${config.CALLBACK_URLS.callback}`,
      return_url: `${siteUrl}${config.CALLBACK_URLS.success}`
    };

    if (config.DEBUG_MODE) {
      console.log('📋 Gönderilecek Form Verisi:', formData);
    }

    // 4. Formu oluştur ve submit et
    this.submitPaymentForm(formData, config.API_URL);
  }

  /**
   * Shopier için HMAC-SHA256 imzası oluşturur.
   */
  private static generateSignature(
    randomNr: string,
    orderId: string,
    totalValue: string,
    currency: string,
    apiKey: string,
    apiSecret: string,
    websiteIndex: number
  ): string {
    const signatureString = `${apiKey}${websiteIndex}${orderId}${totalValue}${currency}${randomNr}${apiSecret}`;
    const signature = CryptoJS.SHA256(signatureString).toString();

    const config = getShopierConfig();
    if (config.DEBUG_MODE) {
      console.log('🔐 İmza Oluşturma:');
      console.log('   - String:', signatureString);
      console.log('   - Sonuç:', signature);
    }
    return signature;
  }

  /**
   * Görünmez bir form oluşturur ve ödeme için Shopier'a yönlendirir.
   */
  private static submitPaymentForm(formData: ShopierFormData, apiUrl: string): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = apiUrl;
    form.style.display = 'none';

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  /**
   * Shopier'dan gelen callback'i doğrular.
   * Not: Bu fonksiyonun backend'de çalışması daha güvenlidir.
   */
  static verifyCallback(postData: { signature: string; platform_order_id: string; status: string; random_nr: string }): boolean {
    const config = getShopierConfig();
    const { signature, platform_order_id, status, random_nr } = postData;

    const expectedSignatureData = random_nr + platform_order_id + status + config.SECRET_KEY;
    const expectedSignature = CryptoJS.SHA256(expectedSignatureData).toString(CryptoJS.enc.Hex);

    if (config.DEBUG_MODE) {
      console.log('🔐 Callback Doğrulama:');
      console.log('   - Gelen İmza:', signature);
      console.log('   - Beklenen İmza:', expectedSignature);
      console.log('   - İmza Verisi:', expectedSignatureData);
    }

    return signature === expectedSignature;
  }
}