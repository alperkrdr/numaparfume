/**
 * 🔧 Shopier Entegrasyon Konfigürasyonu
 * 
 * Bu dosya Shopier API entegrasyonu için gerekli tüm konfigürasyon bilgilerini içerir.
 * Production ortamında bu bilgiler environment variables'dan okunmalıdır.
 */

export const SHOPIER_CONFIG = {
  // 🔑 API Bilgileri (Shopier Merchant Panel'den alınan gerçek bilgiler)
  API_KEY: '107a7821174596da16176ffe2138b709',
  SECRET_KEY: '952d2f8f485d0d74391343c1606aa4cb',
  
  // 🌐 Entegrasyon Ayarları
  WEBSITE_INDEX: 1, // Shopier'da tanımlı website sırası
  API_URL: 'https://www.shopier.com/ShowProduct/api_pay4.php',
  
  // 🔄 Geri Dönüş URL'leri
  SITE_URL: {
    production: 'https://numaparfume.com',
    development: 'http://localhost:5173'
  },
  CALLBACK_URLS: {
    success: '/payment-success',
    failure: '/payment-failed',
    callback: '/payment-callback'
  },
  
  // ⚙️ Diğer Ayarlar
  CURRENCY: 'TRY',
  MODULE_VERSION: 'NUMAPERFUME_1.0',
  PRODUCT_TYPE: 1, // 1: Fiziksel ürün
  
  // 🔧 Development/Production Modu
  MOCK_MODE: false, // true: Test modu, false: Gerçek ödeme
  DEBUG_MODE: true, // Debug modu aktif (production'da false yapın)
  
  // 📧 Default Buyer Bilgileri (Eksik bilgiler için)
  DEFAULT_BUYER: {
    phone: '5000000000',
    account_age: 1,
    id_nr: '12345678901',
    billing_address: 'Adres bilgisi',
    billing_city: 'Istanbul',
    billing_country: 'Turkey',
    billing_postcode: '34000',
    shipping_address: 'Adres bilgisi',
    shipping_city: 'Istanbul',
    shipping_country: 'Turkey',
    shipping_postcode: '34000'
  }
} as const;

/**
 * 📋 Shopier Entegrasyon Talimatları
 * 
 * 1. SHOPIER MERCHANT PANEL AYARLARI:
 *    - API Key: 107a7821174596da16176ffe2138b709
 *    - Secret Key: 952d2f8f485d0d74391343c1606aa4cb
 *    - Website Index: 1
 * 
 * 2. GERİ DÖNÜŞ URL'LERİ (Shopier Panel'e kaydedilmesi gereken):
 *    - https://numaparfume.com/payment-callback
 *    - https://numaparfume.com/payment-success
 *    - https://numaparfume.com/payment-failed
 *    - https://www.numaparfume.com/payment-callback (www ile)
 *    - https://www.numaparfume.com/payment-success (www ile)
 * 
 * 3. MODÜL KURULUMU:
 *    - Shopier PHP SDK gerekmez (Custom entegrasyon)
 *    - Tüm işlemler frontend'de form submission ile yapılır
 *    - Callback'ler React Router ile handle edilir
 * 
 * 4. CALLBACK DOĞRULAMA:
 *    - HMAC-SHA256 imza ile güvenlik sağlanır
 *    - Her callback otomatik doğrulanır
 *    - Geçersiz callback'ler loglanır
 * 
 * 5. TEST ETME:
 *    - MOCK_MODE: true yaparak test edilebilir
 *    - Gerçek Shopier entegrasyonu için MOCK_MODE: false
 *    - Debug için DEBUG_MODE: true yapılabilir
 */

// Environment variables için helper function
export const getShopierConfig = () => {
  // Production'da environment variables kullan
  if (typeof window !== 'undefined' && window.location.hostname === 'numaparfume.com') {
    return {
      ...SHOPIER_CONFIG,
      API_KEY: process.env.VITE_SHOPIER_API_KEY || SHOPIER_CONFIG.API_KEY,
      SECRET_KEY: process.env.VITE_SHOPIER_SECRET_KEY || SHOPIER_CONFIG.SECRET_KEY,
      WEBSITE_INDEX: parseInt(process.env.VITE_SHOPIER_WEBSITE_INDEX || '1'),
      SITE_URL: process.env.VITE_SITE_URL || SHOPIER_CONFIG.SITE_URL.production,
      MOCK_MODE: process.env.VITE_ENVIRONMENT === 'development'
    };
  }
  
  return SHOPIER_CONFIG;
};

// ===== TEST REHBERİ - GERÇEK KULLANICI DENEYİMİ =====
export const TEST_GUIDE = {
  // TEST ADIMLARI
  steps: [
    "1. Ürün seçin ve 'Hemen Satın Al' butonuna tıklayın",
    "2. Eğer giriş yapmadıysanız, açılan login modal'dan giriş yapın",
    "3. Shopier ödeme sayfasına yönlendirileceksiniz",
    "4. Test kartı bilgilerini girin (aşağıdaki test kartlarından birini kullanın)",
    "5. Ödeme işlemini tamamlayın",
    "6. Otomatik olarak sitemize geri döneceksiniz"
  ],

  // TEST KART BİLGİLERİ (Shopier Test Ortamı)
  testCards: {
    // Başarılı ödeme için test kartları
    successful: [
      {
        name: "Visa Test Kartı",
        number: "4508034508034509",
        expiry: "12/26",
        cvv: "000",
        holderName: "TEST USER",
        description: "Başarılı ödeme testi için"
      },
      {
        name: "MasterCard Test Kartı", 
        number: "5406675406675403",
        expiry: "12/26",
        cvv: "000",
        holderName: "TEST USER",
        description: "Başarılı ödeme testi için"
      },
      {
        name: "American Express Test Kartı",
        number: "374245455400001",
        expiry: "12/26", 
        cvv: "0000",
        holderName: "TEST USER",
        description: "Başarılı ödeme testi için"
      }
    ],

    // Başarısız ödeme için test kartları
    failed: [
      {
        name: "Yetersiz Bakiye Test Kartı",
        number: "4508034508034517",
        expiry: "12/26",
        cvv: "000",
        holderName: "TEST USER",
        description: "Yetersiz bakiye hatası testi için"
      },
      {
        name: "Geçersiz Kart Test Kartı",
        number: "4508034508034525",
        expiry: "12/26",
        cvv: "000", 
        holderName: "TEST USER",
        description: "Geçersiz kart hatası testi için"
      }
    ]
  },

  // TEST KULLANICI BİLGİLERİ
  testUsers: [
    {
      name: "Ahmet Yılmaz",
      email: "test@numaparfume.com",
      phone: "5321234567",
      description: "Genel test kullanıcısı"
    },
    {
      name: "Fatma Demir", 
      email: "fatma.test@numaparfume.com",
      phone: "5431234567",
      description: "Kadın parfümü test kullanıcısı"
    },
    {
      name: "Mehmet Kaya",
      email: "mehmet.test@numaparfume.com", 
      phone: "5541234567",
      description: "Erkek parfümü test kullanıcısı"
    }
  ],

  // TEST SENARYOLARI
  scenarios: [
    {
      title: "Tek Ürün Başarılı Ödeme",
      steps: [
        "Herhangi bir ürünü seçin",
        "Hemen Satın Al'a tıklayın",
        "Başarılı test kartını kullanın",
        "Ödeme başarı sayfasını kontrol edin"
      ]
    },
    {
      title: "Sepet ile Çoklu Ürün Ödemesi",
      steps: [
        "Birden fazla ürünü sepete ekleyin",
        "Sepeti açın ve Ödeme'ye geçin",
        "Başarılı test kartını kullanın",
        "Sepet temizliğini kontrol edin"
      ]
    },
    {
      title: "Kampanya İndirimi ile Ödeme",
      steps: [
        "Kampanya pop-up'ını bekleyin veya tetikleyin",
        "İndirimli alışverişe başlayın",
        "İndirim miktarının doğru yansıdığını kontrol edin",
        "Ödemeyi tamamlayın"
      ]
    },
    {
      title: "Başarısız Ödeme Testi",
      steps: [
        "Herhangi bir ürünü seçin",
        "Başarısız test kartını kullanın",
        "Hata mesajını kontrol edin",
        "Tekrar deneme akışını test edin"
      ]
    },
    {
      title: "Giriş Yapmadan Ödeme",
      steps: [
        "Çıkış yapın (eğer giriş yaptıysanız)",
        "Ürün seçin ve satın almaya çalışın",
        "Login modal'ının açıldığını kontrol edin",
        "Giriş yaptıktan sonra ödeme akışının devam ettiğini kontrol edin"
      ]
    }
  ],

  // KONTROL LİSTESİ
  checkpoints: [
    "✓ Ürün bilgileri Shopier'da doğru görünüyor mu?",
    "✓ Fiyat bilgisi doğru aktarılıyor mu?", 
    "✓ Kullanıcı bilgileri doğru doldurulmuş mu?",
    "✓ Ödeme sonrası doğru sayfaya yönlendiriliyor mu?",
    "✓ Başarılı ödeme sonrası sepet temizleniyor mu?",
    "✓ Başarısız ödeme sonrası hata mesajı gösteriliyor mu?",
    "✓ Kampanya indirimleri doğru hesaplanıyor mu?",
    "✓ Login akışı sorunsuz çalışıyor mu?"
  ],

  // ÖNEMLİ NOTLAR
  notes: [
    "⚠️ Bu test kartları sadece Shopier test ortamında çalışır",
    "⚠️ Gerçek para transferi yapılmaz, sadece test işlemidir",
    "⚠️ Test sırasında gerçek kart bilgisi ASLA kullanmayın",
    "⚠️ Test işlemleri Shopier panelinde görüntülenebilir",
    "⚠️ Her test sonrası tarayıcı cache'ini temizlemek önerilir"
  ]
};

// Quick access to test data
export const QUICK_TEST = {
  // En çok kullanılacak test kartı
  defaultCard: TEST_GUIDE.testCards.successful[0],
  
  // En çok kullanılacak test kullanıcısı
  defaultUser: TEST_GUIDE.testUsers[0],
  
  // Hızlı test URL'leri
  testUrls: {
    local: 'http://localhost:5173',
    production: 'https://numaparfume.com'
  }
}; 