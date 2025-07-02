# 🧪 NUMA PARFUME - GERÇEK KULLANICI TEST REHBERİ

Bu rehber, Numa Parfume e-ticaret sitesinin **gerçek kullanıcı deneyimi** testleri için hazırlanmıştır. 
Demo mode kapatılmış, gerçek Shopier test ortamı aktif hale getirilmiştir.

## 🚀 TEST BAŞLAMADAN ÖNCE

### ✅ Ön Koşullar
- [ ] Site localhost:5173 üzerinde çalışıyor
- [ ] Internet bağlantısı aktif
- [ ] Tarayıcıda JavaScript aktif
- [ ] Pop-up blocker kapatılmış (Shopier sayfası için)

### ⚠️ ÖNEMLİ UYARILAR
- **ASLA gerçek kart bilgisi kullanmayın!**
- Sadece aşağıdaki test kartlarını kullanın
- Bu test ortamında gerçek para transferi yapılmaz
- Test işlemleri Shopier panelinde görüntülenebilir

---

## 💳 TEST KART BİLGİLERİ

### ✅ Başarılı Ödeme Test Kartları

#### Visa Test Kartı (EN ÇOKL KULLANILAN)
```
Kart Numarası: 4508034508034509
Son Kullanma: 12/26
CVV: 000
Kart Sahibi: TEST USER
```

#### MasterCard Test Kartı
```
Kart Numarası: 5406675406675403
Son Kullanma: 12/26
CVV: 000
Kart Sahibi: TEST USER
```

#### American Express Test Kartı
```
Kart Numarası: 374245455400001
Son Kullanma: 12/26
CVV: 0000
Kart Sahibi: TEST USER
```

### ❌ Başarısız Ödeme Test Kartları

#### Yetersiz Bakiye Test Kartı
```
Kart Numarası: 4508034508034517
Son Kullanma: 12/26
CVV: 000
Kart Sahibi: TEST USER
```

#### Geçersiz Kart Test Kartı
```
Kart Numarası: 4508034508034525
Son Kullanma: 12/26
CVV: 000
Kart Sahibi: TEST USER
```

---

## 👤 TEST KULLANICI BİLGİLERİ

### Test Kullanıcısı 1 (Varsayılan)
```
İsim: Ahmet Yılmaz
Email: test@numaparfume.com
Telefon: 5321234567
```

### Test Kullanıcısı 2 (Kadın Parfümü)
```
İsim: Fatma Demir
Email: fatma.test@numaparfume.com
Telefon: 5431234567
```

### Test Kullanıcısı 3 (Erkek Parfümü)
```
İsim: Mehmet Kaya
Email: mehmet.test@numaparfume.com
Telefon: 5541234567
```

---

## 🎯 TEST SENARYOLARI

### 1️⃣ Tek Ürün Başarılı Ödeme Testi

**Adımlar:**
1. Ana sayfaya gidin: `http://localhost:5173`
2. Herhangi bir ürünü seçin
3. **"Hemen Satın Al"** butonuna tıklayın
4. Eğer giriş yapmadıysanız, login modal açılacak - giriş yapın
5. Shopier ödeme sayfasına yönlendirileceksiniz
6. **Visa test kartı bilgilerini** girin (yukarıdaki bilgileri kullanın)
7. **"Ödeme Yap"** butonuna tıklayın
8. Başarılı ödeme sonrası sitemize geri dönmeli

**Kontrol Edilecekler:**
- ✅ Ürün bilgileri doğru görünüyor mu?
- ✅ Fiyat bilgisi doğru mu?
- ✅ Ödeme sonrası başarı sayfasına yönlendirildi mi?

### 2️⃣ Sepet ile Çoklu Ürün Ödemesi

**Adımlar:**
1. 2-3 farklı ürünü sepete ekleyin
2. Sağ üst köşedeki sepet ikonuna tıklayın
3. Sepet modal'ında **"Ödeme Yap"** butonuna tıklayın
4. Shopier sayfasında **MasterCard test kartını** kullanın
5. Ödeme işlemini tamamlayın

**Kontrol Edilecekler:**
- ✅ Toplam fiyat doğru hesaplandı mı?
- ✅ Tüm ürünler listede görünüyor mu?
- ✅ Ödeme sonrası sepet temizlendi mi?

### 3️⃣ Kampanya İndirimi ile Ödeme

**Adımlar:**
1. Sayfayı yenileyin, kampanya pop-up'ını bekleyin
2. Pop-up açıldığında **"Alışverişe Başla"** tıklayın
3. İndirimli ürün seçin
4. Fiyatta indirim uygulandığını kontrol edin
5. **Visa test kartıyla** ödemeyi tamamlayın

**Kontrol Edilecekler:**
- ✅ İndirim miktarı doğru hesaplandı mı?
- ✅ Shopier'da final fiyat doğru gösteriliyor mu?

### 4️⃣ Başarısız Ödeme Testi

**Adımlar:**
1. Herhangi bir ürünü seçin
2. Shopier sayfasında **"Yetersiz Bakiye Test Kartını"** kullanın
3. Ödeme işlemini deneyin
4. Hata mesajını gözlemleyin
5. Tekrar deneme linkine tıklayın

**Kontrol Edilecekler:**
- ✅ Hata mesajı görüntülendi mi?
- ✅ Tekrar deneme linki çalışıyor mu?
- ✅ Hata sayfasına doğru yönlendirildi mi?

### 5️⃣ Giriş Yapmadan Ödeme Testi

**Adımlar:**
1. Eğer giriş yaptıysanız çıkış yapın
2. Ürün seçin ve **"Hemen Satın Al"** tıklayın
3. Login modal'ının açıldığını kontrol edin
4. Test kullanıcısı bilgileriyle giriş yapın
5. Giriş sonrası ödeme akışının devam ettiğini kontrol edin

**Kontrol Edilecekler:**
- ✅ Login modal açıldı mı?
- ✅ Giriş sonrası ödeme akışı devam etti mi?
- ✅ Kullanıcı session'ı korundu mu?

---

## 📋 GENEL KONTROL LİSTESİ

### Teknik Kontroller
- [ ] Site yükleme hızı uygun mu?
- [ ] Mobil uyumluluk sorunsuz mu?
- [ ] Tüm butonlar çalışıyor mu?
- [ ] Görseller yükleniyor mu?

### Ödeme Akışı Kontrolleri
- [ ] Login akışı sorunsuz mu?
- [ ] Shopier entegrasyonu çalışıyor mu?
- [ ] Return URL'ler doğru çalışıyor mu?
- [ ] Hata durumları düzgün handle ediliyor mu?

### Kullanıcı Deneyimi Kontrolleri
- [ ] Arayüz kullanıcı dostu mu?
- [ ] Loading durumları gösteriliyor mu?
- [ ] Hata mesajları anlaşılır mı?
- [ ] Başarı mesajları görünüyor mu?

---

## 🐛 SORUN GİDERME

### Shopier Sayfası Açılmıyorsa
1. Pop-up blocker'ını kapatın
2. Tarayıcı cache'ini temizleyin
3. Farklı tarayıcıda deneyin
4. Console'da hata mesajlarını kontrol edin

### Ödeme Sonrası Geri Dönmüyorsa
1. Manuel olarak `localhost:5173/payment-callback` adresine gidin
2. URL parametrelerini kontrol edin
3. Network sekmesinde request'leri inceleyin

### Login Modal Açılmıyorsa
1. Sayfayı yenileyin
2. F12 açıp console hatalarını kontrol edin
3. Hard refresh yapın (Ctrl+F5)

---

## 📞 TEST SONUÇLARI RAPORU

Her test sonrası aşağıdaki bilgileri kaydedin:

### Test Bilgileri
- **Test Tarihi:** ________________
- **Test Edilen Senaryolar:** ________________
- **Kullanılan Tarayıcı:** ________________
- **İşletim Sistemi:** ________________

### Başarılı Testler
- [ ] Tek ürün ödemesi
- [ ] Sepet ödemesi  
- [ ] Kampanya indirimi
- [ ] Başarısız ödeme testi
- [ ] Login akışı

### Tespit Edilen Sorunlar
1. _________________________________
2. _________________________________
3. _________________________________

### Genel Değerlendirme
- **Kullanıcı Deneyimi Puanı:** ___/10
- **Teknik Performans Puanı:** ___/10
- **Ödeme Akışı Puanı:** ___/10

---

## 🎉 TEST TAMAMLANDI!

Tüm testleri başarıyla tamamladıysanız, site gerçek kullanıcılar için hazırdır!

**Bir sonraki adımlar:**
1. Test sonuçlarını raporlayın
2. Tespit edilen sorunları düzeltin
3. Canlı ortama deploy için hazırlık yapın
4. SSL sertifikası ve domain yönlendirmelerini kontrol edin

---

**⚡ Hızlı Test Başlatma:**
```bash
npm run dev
# Tarayıcıda localhost:5173 adresine gidin
# Yukarıdaki test kartlarından birini kullanın
# Test kullanıcısı: test@numaparfume.com
``` 