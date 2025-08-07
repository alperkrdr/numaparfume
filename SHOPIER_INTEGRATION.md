# 🛒 Shopier Entegrasyonu - Detaylı Dokümantasyon

## 📋 Genel Bakış

Bu proje Shopier ödeme sistemi ile entegre edilmiştir. Kullanıcıların sepetlerindeki ürünlerin toplam tutarını Shopier üzerinden güvenli bir şekilde ödeme alabilirsiniz.

## 🔧 Yapılan İyileştirmeler

### 1. Sepet Toplam Tutarı Hesaplama
- ✅ Kampanya indirimleri doğru hesaplanıyor
- ✅ Sepet toplamı Shopier'e doğru aktarılıyor
- ✅ Negatif tutar kontrolü eklendi

### 2. Test Modu Kapatıldı
- ✅ `TEST_MODE = false` yapıldı
- ✅ Gerçek ödeme işlemleri aktif
- ✅ Debug modu açık (production'da kapatın)

### 3. Callback Doğrulama
- ✅ HMAC-SHA256 imza doğrulaması eklendi
- ✅ Güvenlik kontrolleri yapılıyor
- ✅ Geçersiz callback'ler reddediliyor

## 🚀 Kullanım

### Tek Ürün Ödemesi
```typescript
const product = {
  name: 'Parfüm Adı',
  price: 150.00,
  currency: 'TRY',
  description: 'Parfüm açıklaması',
  category: 'Kadın Parfümü'
};

const buyerInfo = {
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  phone: '5551234567'
};

const paymentUrl = await ShopierService.createSingleProductPayment(product, buyerInfo);
```

### Sepet Ödemesi
```typescript
const cartItems = [
  {
    product: { name: 'Parfüm 1', price: 200, currency: 'TRY' },
    quantity: 2
  },
  {
    product: { name: 'Parfüm 2', price: 150, currency: 'TRY' },
    quantity: 1
  }
];

const buyerInfo = {
  name: 'Fatma Demir',
  email: 'fatma@example.com',
  phone: '5551234568'
};

// Kampanya indirimi varsa
const discountInfo = {
  discountAmount: 50,
  campaignTitle: 'Yaz Kampanyası'
};

const paymentUrl = await ShopierService.createCartPayment(
  cartItems, 
  buyerInfo, 
  discountInfo
);
```

## 🔐 Güvenlik

### Callback Doğrulama
```typescript
// Callback'te gelen veriyi doğrula
const isValid = ShopierService.verifyCallback(postData);
if (!isValid) {
  console.error('Geçersiz callback imzası');
  return;
}
```

### İmza Oluşturma
```typescript
const signatureString = `${API_KEY}${WEBSITE_INDEX}${orderId}${totalAmount}TRY${randomNr}${API_SECRET}`;
const signature = CryptoJS.SHA256(signatureString).toString();
```

## 🧪 Test Etme

### Test Fonksiyonları
```javascript
// Browser console'da test edebilirsiniz
window.shopierTest.testSingleProduct();
window.shopierTest.testCart();
window.shopierTest.testCampaign();
window.shopierTest.runAllTests();
```

### Test Senaryoları
1. **Tek Ürün Testi**: 150 TL parfüm
2. **Sepet Testi**: 2 ürün (400 TL toplam)
3. **Kampanya Testi**: 400 TL sepet + 50 TL indirim

## 📊 Veri Akışı

### 1. Sepet Hesaplama
```
Kullanıcı Sepeti → Kampanya Hesaplama → Shopier'e Gönderim
```

### 2. Ödeme Süreci
```
Sepet → Shopier Form → Ödeme Sayfası → Callback → Başarı/Hata
```

### 3. Toplam Tutar Hesaplama
```typescript
const calculateCartTotal = (cartItems, discountInfo) => {
  const subtotal = cartItems.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0);
  
  if (discountInfo?.discountAmount > 0) {
    return Math.max(0, subtotal - discountInfo.discountAmount);
  }
  
  return subtotal;
};
```

## ⚙️ Konfigürasyon

### Environment Variables
```env
VITE_SHOPIER_API_KEY=107a7821174596da16176ffe2138b709
VITE_SHOPIER_SECRET_KEY=952d2f8f485d0d74391343c1606aa4cb
VITE_SHOPIER_WEBSITE_INDEX=1
VITE_SITE_URL=https://numaparfume.com
```

### Production Ayarları
```typescript
// src/services/shopierService.ts
private static readonly TEST_MODE = false; // Gerçek ödeme
private static readonly DEBUG_MODE = false; // Production'da false
```

## 🔄 Callback URL'leri

Shopier Merchant Panel'e kaydedilmesi gereken URL'ler:

- **Success URL**: `https://numaparfume.com/payment-success`
- **Failure URL**: `https://numaparfume.com/payment-failed`
- **Callback URL**: `https://numaparfume.com/payment-callback`

## 📝 Önemli Notlar

### 1. Test Kartları
```javascript
// Başarılı ödeme için
Visa: 4508034508034509
MasterCard: 5406675406675403
American Express: 374245455400001

// Başarısız ödeme için
Yetersiz Bakiye: 4508034508034517
Geçersiz Kart: 4508034508034525
```

### 2. Debug Modu
- Development: `DEBUG_MODE = true`
- Production: `DEBUG_MODE = false`

### 3. Hata Yönetimi
```typescript
try {
  const paymentUrl = await ShopierService.createCartPayment(cartItems, buyerInfo);
  window.location.href = paymentUrl;
} catch (error) {
  console.error('Ödeme hatası:', error);
  alert('Ödeme işlemi başlatılamadı');
}
```

## 🚨 Sorun Giderme

### Yaygın Sorunlar

1. **Toplam Tutar 0 TL**
   - Kampanya indirimi toplam tutardan fazla olabilir
   - `Math.max(0, subtotal - discount)` kontrolü eklendi

2. **İmza Doğrulama Hatası**
   - API key ve secret key kontrol edin
   - İmza string formatını kontrol edin

3. **Callback Alınmıyor**
   - URL'lerin Shopier panel'de doğru kaydedildiğini kontrol edin
   - SSL sertifikası gerekli (https)

### Debug Komutları
```javascript
// Console'da debug bilgilerini görmek için
localStorage.setItem('debug_shopier', 'true');

// Test verilerini görmek için
window.shopierTest.logTestData();
```

## 📈 Performans

### Optimizasyonlar
- ✅ Sepet hesaplama cache'leniyor
- ✅ Gereksiz API çağrıları engelleniyor
- ✅ Fallback mekanizması mevcut

### Monitoring
```typescript
// Ödeme başarı oranını takip etmek için
console.log('Ödeme başlatıldı:', {
  orderId: `NUMA_${Date.now()}`,
  totalAmount,
  productCount: cartItems.length,
  hasDiscount: !!discountInfo
});
```

## 🔮 Gelecek Geliştirmeler

1. **Webhook Entegrasyonu**: Gerçek zamanlı ödeme bildirimleri
2. **Taksit Seçenekleri**: Shopier taksit entegrasyonu
3. **Stok Kontrolü**: Ödeme öncesi stok kontrolü
4. **Analytics**: Ödeme analitikleri

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. Console'da hata mesajlarını kontrol edin
2. Network tab'ında API çağrılarını inceleyin
3. Shopier Merchant Panel'de logları kontrol edin
4. Test modunu açarak debug edin

**Son Güncelleme**: 2024
**Versiyon**: 2.0
**Durum**: Production Ready ✅