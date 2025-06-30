# Numa Parfume - E-Ticaret Web Sitesi

Modern ve şık bir parfüm e-ticaret web sitesi. React, TypeScript, Tailwind CSS ve Firebase ile geliştirilmiştir.

## Özellikler

- 🎨 Modern ve responsive tasarım
- 🔍 Gelişmiş ürün arama ve filtreleme
- 📱 Mobil uyumlu arayüz
- 🛡️ Firebase Authentication ile admin paneli
- 🔥 Firebase entegrasyonu
- 🛒 Shopier entegrasyonu ile ödeme
- 🤖 AI destekli makale üretimi (Gemini API)
- ⚡ Hızlı ve optimize edilmiş performans

## Teknolojiler

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Ödeme**: Shopier entegrasyonu
- **AI**: Google Gemini API
- **Build Tool**: Vite
- **Icons**: Lucide React

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd numa-parfume
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Firebase yapılandırması:
   - Firebase Console'da yeni bir proje oluşturun
   - `src/lib/firebase.ts` dosyasındaki config bilgilerini güncelleyin
   - Firestore Database'i etkinleştirin
   - Authentication'ı etkinleştirin (Email/Password)

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Firebase Yapılandırması

### 1. Firebase Console Ayarları

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. Yeni proje oluşturun
3. Web uygulaması ekleyin
4. Config bilgilerini kopyalayın

### 2. Firestore Database

1. Firestore Database'i oluşturun
2. Güvenlik kurallarını ayarlayın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ürünler herkese okunabilir, sadece admin yazabilir
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Site ayarları herkese okunabilir, sadece admin yazabilir
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Forum gönderileri - herkese yayınlanan gönderiler okunabilir, admin tüm gönderileri okuyabilir ve yazabilir
    match /forum-posts/{document} {
      allow read: if resource.data.isPublished == true || request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Authentication

1. Authentication'ı etkinleştirin
2. Email/Password provider'ını aktif edin
3. Admin kullanıcısı oluşturun:
   - Email: admin@numaparfume.com
   - Şifre: hasanalper98

### 4. Firestore Indexes

Forum işlevselliği için gerekli composite index'leri oluşturun:

1. Firebase Console > Firestore Database > Indexes
2. Aşağıdaki composite index'i ekleyin:
   - Collection: `forum-posts`
   - Fields: `isPublished` (Ascending), `createdAt` (Descending)

### 5. Storage (Opsiyonel)

Ürün görselleri için Firebase Storage kullanabilirsiniz.

## Admin Paneli

Admin paneline `/admin` URL'sinden erişebilirsiniz.

**Firebase Auth Giriş Bilgileri:**
- Email: admin@numaparfume.com
- Şifre: hasanalper98

### Admin Panel Özellikleri

- ✅ Firebase Authentication ile güvenli giriş
- ✅ Ürün ekleme/düzenleme/silme
- ✅ Kategori yönetimi
- ✅ Koleksiyon yönetimi (Öne çıkanlar, Koleksiyonu keşfet)
- ✅ Stok durumu yönetimi
- ✅ Shopier link yönetimi
- ✅ AI makale üretimi (Gemini API)
- ✅ Forum yönetimi
- ✅ Site ayarları

## AI Makale Üretimi

### Gemini API Kurulumu

1. [Google AI Studio](https://makersuite.google.com/app/apikey)'ya gidin
2. API anahtarı oluşturun
3. Admin paneli > Ayarlar > AI Makale Ayarları'ndan API anahtarını girin
4. Otomatik günlük makale oluşturmayı aktif edin

### Özellikler

- ✅ Manuel makale oluşturma
- ✅ Otomatik günlük makale oluşturma
- ✅ SEO dostu içerik
- ✅ Türkçe makale üretimi
- ✅ Parfüm konularında uzmanlaşmış içerik

## Ürün Yapısı

```typescript
interface Product {
  id: string;
  name: string;
  originalName: string; // SEO için orijinal parfüm adı
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: 'kadın' | 'erkek' | 'unisex';
  brand: string;
  originalBrand: string; // SEO için orijinal marka adı
  size: string;
  inStock: boolean;
  featured: boolean;
  shopierLink: string;
  notes?: {
    top?: string[];
    middle?: string[];
    base?: string[];
  };
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Shopier Entegrasyonu

Her ürün için ayrı Shopier linki tanımlanabilir. Ürün kartlarındaki "Satın Al" butonu ilgili Shopier sayfasına yönlendirir.

### API Token

Shopier API token'ı `src/services/shopierService.ts` dosyasında tanımlıdır.

## Deployment

### Vercel (Önerilen)

1. Vercel hesabı oluşturun
2. GitHub repository'sini bağlayın
3. Environment variables'ları ekleyin
4. Deploy edin

### Netlify

1. `npm run build` komutu ile build alın
2. `dist` klasörünü Netlify'a yükleyin

## Geliştirme

### Klasör Yapısı

```
src/
├── components/          # React bileşenleri
├── hooks/              # Custom hooks
├── lib/                # Firebase config
├── services/           # API servisleri
├── types/              # TypeScript tipleri
└── styles/             # CSS dosyları
```

### Yeni Özellik Ekleme

1. Feature branch oluşturun
2. Geliştirmeyi yapın
3. Test edin
4. Pull request açın

## Güvenlik

- Firebase Authentication ile güvenli admin erişimi
- Firestore güvenlik kuralları
- API anahtarlarının güvenli saklanması
- XSS ve CSRF koruması

## Performans

- Lazy loading
- Image optimization
- Code splitting
- Firebase caching

## Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

## İletişim

Sorularınız için: info@numaparfume.com