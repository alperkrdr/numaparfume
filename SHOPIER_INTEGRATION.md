# 🛒 Shopier Entegrasyonu - PHP Formatına Uygun

## 📋 Genel Bakış

Shopier ödeme entegrasyonu PHP örneğine uygun şekilde güncellenmiştir. Sistem artık PHP'deki `hash_hmac('SHA256', implode('', $payment_data), $api_secret)` formatını kullanmaktadır.

## 🔧 Teknik Detaylar

### PHP Örneği Formatı
```php
<?php
$api_key = 'SHOPIER_API_KEY';
$api_secret = 'SHOPIER_API_SECRET';

$buyer_name = 'Ahmet Yılmaz';
$buyer_email = 'ahmet@example.com';
$buyer_phone = '05001234567';
$buyer_address = 'İstanbul, Türkiye';

$order_id = uniqid();
$product_name = 'Sepetinizdeki Ürünler';
$price = 500.00;
$currency = 'TRY';

$payment_data = [
    'API_key' => $api_key,
    'website_index' => '1',
    'platform_order_id' => $order_id,
    'product_name' => $product_name,
    'buyer_name' => $buyer_name,
    'buyer_surname' => '',
    'buyer_email' => $buyer_email,
    'buyer_phone' => $buyer_phone,
    'billing_address' => $buyer_address,
    'billing_city' => 'İstanbul',
    'billing_country' => 'Türkiye',
    'billing_postcode' => '34000',
    'total_order_value' => $price,
    'currency' => $currency,
    'callback_url' => 'https://seninsite.com/shopier-callback.php',
    'payment_channel' => 'web',
    'is_installment' => 0
];

$signature = hash_hmac('SHA256', implode('', $payment_data), $api_secret);

$payment_data['signature'] = $signature;
?>

<form method="post" action="https://www.shopier.com/ShowProduct/api_pay4.php" id="shopier_form">
<?php foreach ($payment_data as $key => $value): ?>
    <input type="hidden" name="<?= htmlspecialchars($key) ?>" value="<?= htmlspecialchars($value) ?>">
<?php endforeach; ?>
</form>

<script>
    document.getElementById('shopier_form').submit();
</script>
```

### JavaScript Uyarlaması

```typescript
// Shopier ödeme verilerini hazırla - PHP örneğine göre
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

// İmza oluştur - PHP hash_hmac('SHA256', implode('', $payment_data), $api_secret) formatına göre
const signatureString = Object.values(paymentData).join('');
const signature = CryptoJS.HmacSHA256(signatureString, this.API_SECRET).toString();
paymentData.signature = signature;
```

## 🚀 Kullanım

### 1. Sepet Ödeme İşlemi

```typescript
import { ShopierService } from '../services/shopierService';

// Sepet verilerini hazırla
const cartItems = [
  {
    product: {
      name: 'Chanel No. 5 Benzeri',
      price: 299.99,
      currency: 'TRY',
      description: 'Klasik parfüm',
      image_url: 'https://example.com/image.jpg',
      category: 'kadın'
    },
    quantity: 2
  }
];

// Müşteri bilgileri
const buyerInfo = {
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  phone: '05001234567'
};

// Kampanya indirimi (opsiyonel)
const discountInfo = {
  discountAmount: 50,
  campaignTitle: 'Yaz Kampanyası'
};

// Ödeme işlemini başlat
await ShopierService.createCartPayment(
  cartItems,
  buyerInfo,
  discountInfo
);
```

### 2. Tek Ürün Ödeme İşlemi

```typescript
const product = {
  name: 'Test Parfüm',
  price: 299.99,
  currency: 'TRY',
  description: 'Test ürün',
  image_url: 'https://example.com/image.jpg',
  category: 'kadın'
};

await ShopierService.createSingleProductPayment(
  product,
  buyerInfo
);
```

## 🧪 Test

### Test Sayfası
- URL: `http://localhost:3000/shopier-test`
- Özellikler:
  - Test sepet verisi
  - Kampanya indirimi simülasyonu
  - Gerçek Shopier formu oluşturma
  - Console'da debug bilgileri

### Test Senaryoları

#### 1. Basit Test
```bash
# Test sayfasına git
curl http://localhost:3000/shopier-test

# Test verilerini gir ve "Test Ödeme" butonuna tıkla
# Console'da debug bilgilerini kontrol et
```

#### 2. Sepet Testi
```bash
# Ana sayfaya git
curl http://localhost:3000/

# Ürün ekle → Sepete git → Ödemeye geç
# Müşteri bilgilerini gir ve ödeme yap
```

## 🔐 Güvenlik

### İmza Doğrulama
```typescript
// Callback doğrulama - PHP formatına göre
static verifyCallback(postData: any): boolean {
  const {
    platform_order_id,
    payment_status,
    total_order_value,
    currency,
    signature,
    random_nr
  } = postData;

  // Beklenen imzayı hesapla - PHP formatına göre
  const signatureString = `${this.API_KEY}${this.WEBSITE_INDEX}${platform_order_id}${total_order_value}${currency}${random_nr}${this.API_SECRET}`;
  const expectedSignature = CryptoJS.SHA256(signatureString).toString();

  return receivedSignature === expectedSignature;
}
```

### API Anahtarları
```typescript
private static readonly API_KEY = '107a7821174596da16176ffe2138b709';
private static readonly API_SECRET = '952d2f8f485d0d74391343c1606aa4cb';
private static readonly WEBSITE_INDEX = 1;
```

## 📊 Form Verileri

### Gerekli Alanlar
- `API_key`: Shopier API anahtarı
- `website_index`: Website indeksi
- `platform_order_id`: Benzersiz sipariş ID'si
- `product_name`: Ürün adı
- `buyer_name`: Müşteri adı
- `buyer_surname`: Müşteri soyadı
- `buyer_email`: Müşteri e-postası
- `buyer_phone`: Müşteri telefonu
- `billing_address`: Fatura adresi
- `billing_city`: Şehir
- `billing_country`: Ülke
- `billing_postcode`: Posta kodu
- `total_order_value`: Toplam tutar
- `currency`: Para birimi
- `callback_url`: Callback URL'i
- `payment_channel`: Ödeme kanalı
- `is_installment`: Taksit durumu
- `signature`: HMAC-SHA256 imzası

## 🔄 Callback İşlemi

### Callback URL
```
https://numaparfume.com/payment-callback
```

### Callback Verileri
```typescript
interface CallbackData {
  platform_order_id: string;
  payment_status: string;
  total_order_value: string;
  currency: string;
  signature: string;
  random_nr: string;
}
```

## 🐛 Hata Yönetimi

### Yaygın Hatalar
1. **İmza Hatası**: API anahtarları yanlış
2. **Form Hatası**: Eksik veya yanlış form verisi
3. **Network Hatası**: Shopier sunucusuna bağlantı sorunu

### Debug Modu
```typescript
private static readonly DEBUG_MODE = true;
```

Debug modunda console'da şu bilgiler görünür:
- Signature String
- Generated Signature
- Payment Data
- API Response

## 📝 Notlar

### Önemli Noktalar
1. **İmza Hesaplama**: PHP `hash_hmac('SHA256', implode('', $payment_data), $api_secret)` formatına uygun
2. **Form Submit**: JavaScript ile otomatik form submit
3. **Callback**: Güvenli callback doğrulama
4. **Test Mode**: Test modunda gerçek ödeme yapılmaz

### Geliştirme İpuçları
1. Test modunda çalışırken gerçek ödeme yapılmaz
2. Debug modu aktifken console'da tüm bilgiler görünür
3. Callback URL'i production'da doğru ayarlanmalı
4. API anahtarları güvenli şekilde saklanmalı

---

**Son Güncelleme**: 2024-12-19  
**Versiyon**: 2.1.0  
**PHP Uyumluluğu**: ✅ Tamamlandı