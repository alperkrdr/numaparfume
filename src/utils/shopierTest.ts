/**
 * 🧪 Shopier Entegrasyon Test Yardımcıları
 * 
 * Bu dosya Shopier entegrasyonunu test etmek için kullanılır.
 * Production'da bu dosyayı kaldırabilirsiniz.
 */

import { ShopierService } from '../services/shopierService';

export interface TestProduct {
  name: string;
  price: number;
  currency: string;
  description?: string;
  image_url?: string;
  category?: string;
}

export interface TestCartItem {
  product: TestProduct;
  quantity: number;
}

export interface TestBuyer {
  name: string;
  email: string;
  phone?: string;
}

export interface TestDiscount {
  discountAmount: number;
  campaignTitle: string;
}

/**
 * Test senaryoları
 */
export const TEST_SCENARIOS = {
  // Tek ürün testi
  singleProduct: {
    products: [
      {
        product: {
          name: 'Test Parfüm 1',
          price: 150.00,
          currency: 'TRY',
          description: 'Test parfüm açıklaması',
          category: 'Kadın Parfümü'
        },
        quantity: 1
      }
    ],
    buyer: {
      name: 'Test Kullanıcı',
      email: 'test@example.com',
      phone: '5551234567'
    }
  },

  // Çoklu ürün testi
  multipleProducts: {
    products: [
      {
        product: {
          name: 'Kadın Parfümü',
          price: 200.00,
          currency: 'TRY',
          description: 'Kadın parfümü',
          category: 'Kadın Parfümü'
        },
        quantity: 2
      },
      {
        product: {
          name: 'Erkek Parfümü',
          price: 180.00,
          currency: 'TRY',
          description: 'Erkek parfümü',
          category: 'Erkek Parfümü'
        },
        quantity: 1
      }
    ],
    buyer: {
      name: 'Test Kullanıcı 2',
      email: 'test2@example.com',
      phone: '5551234568'
    }
  },

  // Kampanya indirimli test
  campaignDiscount: {
    products: [
      {
        product: {
          name: 'Premium Parfüm',
          price: 300.00,
          currency: 'TRY',
          description: 'Premium parfüm',
          category: 'Premium'
        },
        quantity: 1
      },
      {
        product: {
          name: 'Mini Parfüm',
          price: 50.00,
          currency: 'TRY',
          description: 'Mini parfüm',
          category: 'Mini'
        },
        quantity: 2
      }
    ],
    buyer: {
      name: 'Kampanya Test Kullanıcı',
      email: 'campaign@example.com',
      phone: '5551234569'
    },
    discount: {
      discountAmount: 50.00,
      campaignTitle: 'Yaz Kampanyası'
    }
  }
};

/**
 * Shopier entegrasyonunu test et
 */
export class ShopierTestHelper {
  /**
   * Tek ürün ödeme testi
   */
  static async testSingleProductPayment() {
    console.log('🧪 Tek ürün ödeme testi başlatılıyor...');
    
    try {
      const { products, buyer } = TEST_SCENARIOS.singleProduct;
      
      const paymentUrl = await ShopierService.createSingleProductPayment(
        products[0].product,
        buyer
      );
      
      console.log('✅ Tek ürün ödeme testi başarılı');
      console.log('🔗 Ödeme URL:', paymentUrl);
      
      return paymentUrl;
    } catch (error) {
      console.error('❌ Tek ürün ödeme testi başarısız:', error);
      throw error;
    }
  }

  /**
   * Sepet ödeme testi
   */
  static async testCartPayment() {
    console.log('🧪 Sepet ödeme testi başlatılıyor...');
    
    try {
      const { products, buyer } = TEST_SCENARIOS.multipleProducts;
      
      const paymentUrl = await ShopierService.createCartPayment(
        products,
        buyer
      );
      
      console.log('✅ Sepet ödeme testi başarılı');
      console.log('🔗 Ödeme URL:', paymentUrl);
      
      return paymentUrl;
    } catch (error) {
      console.error('❌ Sepet ödeme testi başarısız:', error);
      throw error;
    }
  }

  /**
   * Kampanya indirimli ödeme testi
   */
  static async testCampaignPayment() {
    console.log('🧪 Kampanya indirimli ödeme testi başlatılıyor...');
    
    try {
      const { products, buyer, discount } = TEST_SCENARIOS.campaignDiscount;
      
      const paymentUrl = await ShopierService.createCartPayment(
        products,
        buyer,
        discount
      );
      
      console.log('✅ Kampanya indirimli ödeme testi başarılı');
      console.log('🔗 Ödeme URL:', paymentUrl);
      
      return paymentUrl;
    } catch (error) {
      console.error('❌ Kampanya indirimli ödeme testi başarısız:', error);
      throw error;
    }
  }

  /**
   * Tüm testleri çalıştır
   */
  static async runAllTests() {
    console.log('🚀 Tüm Shopier testleri başlatılıyor...');
    
    const results = {
      singleProduct: false,
      cartPayment: false,
      campaignPayment: false
    };

    try {
      // Test 1: Tek ürün
      await this.testSingleProductPayment();
      results.singleProduct = true;
      console.log('✅ Test 1 başarılı');
    } catch (error) {
      console.error('❌ Test 1 başarısız:', error);
    }

    try {
      // Test 2: Sepet
      await this.testCartPayment();
      results.cartPayment = true;
      console.log('✅ Test 2 başarılı');
    } catch (error) {
      console.error('❌ Test 2 başarısız:', error);
    }

    try {
      // Test 3: Kampanya
      await this.testCampaignPayment();
      results.campaignPayment = true;
      console.log('✅ Test 3 başarılı');
    } catch (error) {
      console.error('❌ Test 3 başarısız:', error);
    }

    console.log('📊 Test Sonuçları:', results);
    return results;
  }

  /**
   * Test verilerini konsola yazdır
   */
  static logTestData() {
    console.log('📋 Test Verileri:');
    console.log('TEST_SCENARIOS:', TEST_SCENARIOS);
  }
}

/**
 * Global test fonksiyonları (development için)
 */
if (typeof window !== 'undefined') {
  (window as any).shopierTest = {
    testSingleProduct: () => ShopierTestHelper.testSingleProductPayment(),
    testCart: () => ShopierTestHelper.testCartPayment(),
    testCampaign: () => ShopierTestHelper.testCampaignPayment(),
    runAllTests: () => ShopierTestHelper.runAllTests(),
    logTestData: () => ShopierTestHelper.logTestData()
  };
}