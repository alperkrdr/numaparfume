# Shopier Entegrasyonu

Bu dokümantasyon, Shopier ödeme sistemi entegrasyonunu açıklar.

## 🚀 Özellikler

- ✅ Sepet toplam tutarını Shopier üzerinden ödeme alma
- ✅ Kampanya indirimlerini destekleme
- ✅ Güvenli imza doğrulaması
- ✅ Callback işleme
- ✅ Test modu desteği

## 📋 Gereksinimler

### API Bilgileri
```typescript
const API_KEY = '107a7821174596da16176ffe2138b709';
const API_SECRET = '952d2f8f485d0d74391343c1606aa4cb';
const WEBSITE_INDEX = 1;
```

### Endpoint
```
https://www.shopier.com/ShowProduct/api_pay4.php
```

## 🔧 Kurulum

### 1. ShopierService Kullanımı

```typescript
import { ShopierService } from '../services/shopierService';

// Sepet ödeme işlemi
const paymentUrl = await ShopierService.createCartPayment(
  cartItems, // Sepet ürünleri
  {
    name: user.name,
    email: user.email,
    phone: user.phone
  },
  discountInfo // Opsiyonel kampanya bilgisi
);
```

### 2. Callback İşleme

```typescript
// PaymentCallback.tsx içinde
const isValid = ShopierService.verifyCallback(callbackData);
```

## 📝 Ödeme Akışı

### 1. Sepet Hesaplama
```typescript
// Toplam tutarı hesapla
let totalAmount = cartItems.reduce((sum, item) => 
  sum + (item.product.price * item.quantity), 0
);

// İndirim varsa uygula
if (discountInfo && discountInfo.discountAmount > 0) {
  totalAmount -= discountInfo.discountAmount;
}
```

### 2. Shopier Form Hazırlama
```typescript
const paymentData = {
  API_key: API_KEY,
  website_index: WEBSITE_INDEX,
  platform_order_id: orderId,
  product_name: productName,
  buyer_name: buyerName,
  buyer_surname: buyerSurname,
  buyer_email: buyerInfo.email,
  buyer_phone: buyerInfo.phone,
  billing_address: 'Müşteri Adresi',
  billing_city: 'İstanbul',
  billing_country: 'Türkiye',
  billing_postcode: '34000',
  total_order_value: totalAmount.toFixed(2),
  currency: 'TRY',
  callback_url: `${SITE_URL}/payment-callback`,
  payment_channel: 'web',
  is_installment: 0,
  signature: '' // Aşağıda hesaplanacak
};
```

### 3. İmza Oluşturma
```typescript
// İmza oluştur - Verilen örnek koda göre
const signatureString = Object.values(paymentData).join('');
const signature = CryptoJS.HmacSHA256(signatureString, API_SECRET).toString();
paymentData.signature = signature;
```

### 4. Form Submit
```typescript
// Form oluştur ve submit et
const form = this.createPaymentForm(paymentData);
document.body.appendChild(form);
form.submit();
```

## 🔐 Güvenlik

### Callback Doğrulama
```typescript
function verifyShopierCallback(data: ShopierCallbackData): boolean {
  const signatureString = `${API_KEY}${WEBSITE_INDEX}${platform_order_id}${total_order_value}${currency}${random_nr}${API_SECRET}`;
  const expectedSignature = CryptoJS.SHA256(signatureString).toString();
  return signature === expectedSignature;
}
```

## 📊 Ödeme Durumları

| Status | Açıklama |
|--------|----------|
| `1` | Ödeme başarılı |
| `0` | Ödeme başarısız |
| `2` | Ödeme beklemede |

## 🧪 Test

### Test Dosyası
`test-shopier-integration.html` dosyasını kullanarak entegrasyonu test edebilirsiniz.

### Test Adımları
1. Test dosyasını tarayıcıda açın
2. Form bilgilerini doldurun
3. "Shopier ile Ödeme Yap" butonuna tıklayın
4. Debug bilgilerini kontrol edin
5. Shopier ödeme sayfasına yönlendirildiğinizi doğrulayın

## 🔧 Konfigürasyon

### Test Modu
```typescript
private static readonly TEST_MODE = true;
private static readonly DEBUG_MODE = true;
```

### Site URL
```typescript
private static readonly SITE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? `${window.location.protocol}//${window.location.host}`
  : 'https://numaparfume.com';
```

## 📁 Dosya Yapısı

```
src/
├── services/
│   └── shopierService.ts          # Ana Shopier servisi
├── components/
│   ├── CartModal.tsx              # Sepet modalı
│   ├── PaymentCallback.tsx        # Ödeme callback'i
│   ├── PaymentSuccess.tsx         # Başarılı ödeme
│   └── PaymentFailed.tsx          # Başarısız ödeme
└── api/
    └── shopier-callback.ts        # Backend callback handler
```

## 🚨 Hata Yönetimi

### Yaygın Hatalar

1. **İmza Doğrulama Hatası**
   - API_SECRET'in doğru olduğunu kontrol edin
   - Signature string'in doğru oluşturulduğunu kontrol edin

2. **Form Submit Hatası**
   - Tüm gerekli alanların doldurulduğunu kontrol edin
   - API_KEY'in doğru olduğunu kontrol edin

3. **Callback Hatası**
   - Callback URL'in doğru olduğunu kontrol edin
   - Backend handler'ın çalıştığını kontrol edin

## 📞 Destek

Entegrasyon ile ilgili sorunlar için:

1. Console loglarını kontrol edin
2. Test dosyasını kullanın
3. Shopier dokümantasyonunu inceleyin
4. API bilgilerini doğrulayın

## 🔄 Güncellemeler

### v2.0 (Güncel)
- ✅ Verilen örnek koda göre güncellendi
- ✅ Direkt form yöntemi öncelikli hale getirildi
- ✅ İmza doğrulaması iyileştirildi
- ✅ Callback güvenliği artırıldı
- ✅ Test dosyası eklendi

### v1.0 (Önceki)
- Modern API kullanımı
- Fallback form yöntemi
- Temel callback işleme