# Firebase Admin Panel Kurulum Rehberi

## 1. Firebase Console'da Admin Kullanıcı Oluşturma

1. Firebase Console'a gidin: https://console.firebase.google.com/
2. Projenizi (`numaparfume-6e1b6`) seçin
3. Sol menüden **Authentication** → **Users** seçin
4. **Add user** butonuna tıklayın
5. Admin e-posta adresinizi ve güçlü bir şifre girin
6. **Add user** butonuna tıklayarak kullanıcıyı oluşturun

## 2. Admin E-posta Adresini Sisteme Ekleme

Yeni oluşturduğunuz admin e-posta adresini sisteme eklemek için:

1. `src/config/adminConfig.ts` dosyasını açın
2. `adminEmails` arrayine yeni admin e-postanızı ekleyin:

```typescript
adminEmails: [
  'admin@numaparfume.com',      // Varsayılan admin
  'numa@admin.com',             // Alternatif admin
  'youradmin@domain.com',       // BURAYA YENİ ADMİN E-POSTANIZI EKLEYİN
],
```

## 3. Admin Panel'e Giriş

1. Web sitenizde `/admin` sayfasına gidin
2. Firebase'de oluşturduğunuz admin e-posta ve şifrenizi girin
3. **Giriş Yap** butonuna tıklayın

## 4. Güvenlik Önerileri

### 4.1 Güçlü Şifre Kullanın
- En az 12 karakter
- Büyük/küçük harf, rakam ve özel karakter karışımı
- Tahmin edilmesi zor olsun

### 4.2 Firebase Security Rules
Firebase Console'da **Firestore Database** → **Rules** kısmına gidin ve aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin kontrolü için yardımcı fonksiyon
    function isAdmin() {
      return request.auth != null && 
             (request.auth.token.email == 'admin@numaparfume.com' ||
              request.auth.token.email == 'numa@admin.com' ||
              request.auth.token.email == 'YOUR_ADMIN_EMAIL@domain.com'); // Kendi admin e-postanızı ekleyin
    }
    
    // Ürünler - herkese okuma, sadece admin'e yazma
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Site ayarları - sadece admin
    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }
    
    // Forum gönderileri - herkese okuma, sadece admin'e yönetim
    match /forumPosts/{postId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Koleksiyonlar - sadece admin
    match /collections/{collectionId} {
      allow read, write: if isAdmin();
    }
  }
}
```

### 4.3 İki Faktörlü Kimlik Doğrulama (2FA)
Firebase Console'da Authentication → Settings → Multi-factor authentication'ı etkinleştirin.

## 5. Sorun Giderme

### "Bu hesap admin yetkisine sahip değil" Hatası
- `src/config/adminConfig.ts` dosyasında e-posta adresinizin doğru yazıldığından emin olun
- Büyük/küçük harf duyarlılığına dikkat edin
- Firebase'de kullanıcının başarıyla oluşturulduğunu kontrol edin

### Giriş Yaparken "Kullanıcı Bulunamadı" Hatası
- Firebase Console'da kullanıcının mevcut olduğunu kontrol edin
- E-posta adresini doğru yazdığınızdan emin olun

### Token Geçersiz Hatası
- Tarayıcı cache'ini temizleyin
- Çıkış yapıp tekrar giriş deneyin

## 6. Destek

Herhangi bir sorun yaşarsanız:
1. Browser console'u kontrol edin (F12 → Console)
2. Firebase Console'da Authentication → Users kısmını kontrol edin
3. Network sekmesinde hata loglarını inceleyin 