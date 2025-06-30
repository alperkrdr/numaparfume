# Numa Parfüm Deployment Rehberi

## Hosting Seçenekleri

### 1. Vercel (Frontend Odaklı)

#### ✅ Avantajlar:
- Ücretsiz plan (100GB bandwidth)
- Otomatik SSL ve CDN
- Git entegrasyonu
- Firebase entegrasyonu mükemmel
- Lightning fast deployment

#### ⚠️ Sınırlamalar:
- Serverless function limiti (10 saniye)
- Built-in cron job yok
- Otomatik makale sistemi için external service gerekir

#### Deployment:
```bash
npm i -g vercel
vercel --prod
```

#### Otomatik Makale Sistemi İçin Ek:
- Upstash Cron (ücretsiz) veya
- GitHub Actions cron kullan
- Vercel Edge Functions ile trigger

### 2. Railway (Tam Çözüm) - ÖNERİLEN

#### ✅ Avantajlar:
- Full-stack hosting
- Built-in cron jobs
- Database hosting
- 500GB ücretsiz bandwidth
- Environment variables
- Otomatik backups

#### Deployment:
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

#### Otomatik Makale Sistemi:
- Native cron job support
- Background tasks mümkün
- Queue system kullanılabilir

### 3. Render

#### ✅ Avantajlar:
- Ücretsiz plan (750 saat/ay)
- Cron jobs destekli
- Database hosting
- SSL otomatik

#### ⚠️ Sınırlamalar:
- Ücretsiz planda sleep modu
- 15 dakika inaktivite sonrası uyku

### 4. Netlify + Firebase Functions

#### ✅ Avantajlar:
- Frontend: Netlify (ücretsiz)
- Backend: Firebase Functions
- Scheduled functions mevcut
- Güçlü entegrasyon

## Önerilen Deployment Stratejisi

### Seçenek A: Railway (Basit ve Güçlü)
```bash
# 1. Railway CLI yükle
npm i -g @railway/cli

# 2. Login ol
railway login

# 3. Proje oluştur
railway init

# 4. Environment variables ekle
railway variables set VITE_GEMINI_API_KEY=your_key
railway variables set VITE_PEXELS_API_KEY=your_key

# 5. Deploy et
railway up
```

### Seçenek B: Vercel + Upstash Cron
```bash
# 1. Vercel deploy
vercel --prod

# 2. Upstash'e kaydol (ücretsiz)
# 3. Cron job oluştur: 
# URL: https://your-site.vercel.app/api/generate-article
# Schedule: 0 9 * * * (her gün 09:00)
```

## Tavsiye

**Başlangıç için Railway kullanın:**
- Tek tıkla deploy
- Tüm özellikler çalışır
- Cron job native desteklenir
- Ücretsiz plan yeterli
- Scaling kolay

**Production için:**
- Railway Pro ($5/ay)
- Veya Vercel Pro + Upstash
- Database backup aktif
- Monitoring setup

## Environment Variables

Her platformda bu değişkenleri ekleyin:
```
VITE_GEMINI_API_KEY=your_gemini_key
VITE_PEXELS_API_KEY=your_pexels_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Database Setup

Firebase Firestore kullanıldığı için:
- Ayrı database setup gerekmez
- Rules dosyasını deploy et
- Indexes oluştur
- Security rules aktif et

## Monitoring

Deployment sonrası kontrol edin:
- Otomatik makale sistemi çalışıyor mu?
- Firebase bağlantısı OK mi?
- API keys doğru mu?
- SSL sertifikası aktif mi? 