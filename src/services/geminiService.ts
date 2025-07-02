import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ForumPost } from '../types';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

let autoGenerationIntervalId: NodeJS.Timeout | null = null;

// Dummy image selector (Unsplash) — avoids Node-only Pexels SDK
const searchImageOnPexels = async (query: string): Promise<string> => {
  // Parfüm ile ilgili varsayılan görseller (Unsplash'den CORS dostu)
  const perfumeImages = [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', // Perfume bottles
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&q=80', // Essential oils
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', // Fragrance
    'https://images.unsplash.com/photo-1585830243347-1f5df5b96c6c?w=800&q=80', // Perfume collection
    'https://images.unsplash.com/photo-1592173705862-2ac2e60c2a2c?w=800&q=80', // Vintage perfume
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80', // Beauty products
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', // Cosmetic bottles
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', // Luxury perfume
    'https://images.unsplash.com/photo-1571945166097-5f777c4cd9e6?w=800&q=80', // Scent bottles
    'https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=800&q=80', // Perfume and flowers
  ];
  
  // Her seferinde farklı bir görsel seç (truly random)
  const randomIndex = Math.floor(Math.random() * perfumeImages.length);
  const selectedImage = perfumeImages[randomIndex];
  
  console.log(`🖼️ Random parfüm görseli seçildi (${randomIndex + 1}/${perfumeImages.length}):`, selectedImage);
  return selectedImage;
};

const getDefaultPerfumeImage = (): string => {
  // Varsayılan parfüm görseli
  return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80';
};

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI;
  private usedTopics: Set<string> = new Set();

  private constructor() {
    if (!geminiApiKey) {
      throw new Error("Gemini API anahtarı .env dosyasında bulunamadı. Lütfen VITE_GEMINI_API_KEY olarak ekleyin.");
    }
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async generateArticle(topic: string, retries = 3): Promise<Partial<ForumPost>> {
    if (!geminiApiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      
      // Her seferinde farklı bir açı yakalaması için ek detaylar ekle
      const uniqueAngle = this.generateUniqueAngle();
      const enhancedTopic = `${topic} - ${uniqueAngle}`;
      
      const prompt = `Aşağıdaki konu hakkında detaylı, SEO dostu ve profesyonel bir blog makalesi yaz:

KONU: ${enhancedTopic}

ÖNEMLİ KURALLAR:
1. Makale tamamen Türkçe olmalı
2. En az 800-1200 kelime uzunluğunda olmalı
3. SEO dostu hashtag'ler (#) kullan (başlık ve alt başlıklarda)
4. Parfüm, koku, esans gibi anahtar kelimeleri doğal şekilde yerleştir
5. Son cümlede "Numa Parfüm olarak..." ile başlayarak markamıza pozitif referans yap
6. İçerik özgün ve bilgilendirici olmalı
7. Alt başlıklar kullan (## format)
8. Paragraflar arası geçişler doğal olmalı
9. BAŞLIK HER SEFERINDE FARKLI OLMALI - yaratıcı ve benzersiz olmalı

YAZIŞ FORMATI:
- Başlık (h1 formatında, # ile)
- Giriş paragrafı (150-200 kelime)
- Ana içerik (alt başlıklar ile)
- Sonuç paragrafı (Numa Parfüm referansı ile)

ÖRNEK SON CÜMLE: "Numa Parfüm olarak, [konu ile uyumlu pozitif cümle] sunmaktan gurur duyuyoruz."

Makalenin sonunda aşağıdaki bilgileri JSON formatında ver:
{
  "title": "makale başlığı",
  "content": "tam makale içeriği",
  "excerpt": "150 kelimelik özet",
  "tags": ["tag1", "tag2", "tag3"],
  "seoKeywords": ["keyword1", "keyword2", "keyword3"],
  "metaDescription": "160 karakterlik meta açıklama"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const generatedData: Partial<ForumPost> = JSON.parse(jsonString);

      const imageUrl = await searchImageOnPexels(generatedData.title || topic);
      if (imageUrl) {
        generatedData.imageUrl = imageUrl;
        console.log('✅ Makale için görsel bulundu:', imageUrl);
      } else {
        console.log('⚠️ Makale için görsel bulunamadı, görsel olmadan devam ediliyor.');
      }

      return {
        ...generatedData,
        isPublished: false,
        isGenerated: true,
        viewCount: 0,
        authorId: 'numa-parfum',
        authorName: 'Numa Parfüm',
      };
    } catch (error) {
      console.error('Error generating article with Gemini:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Bilinmeyen hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  }

  public static async generateDailyArticle(): Promise<Partial<ForumPost>> {
    const instance = GeminiService.getInstance();
    const topic = instance.getRandomTopic();
    console.log('🎯 Seçilen konu:', topic);
    return instance.generateArticle(topic);
  }

  public static async generateCustomArticle(topic: string): Promise<Partial<ForumPost>> {
    const instance = GeminiService.getInstance();
    return instance.generateArticle(topic);
  }

  public static async generateAndSaveArticle(): Promise<string> {
    try {
      console.log('📝 Yeni makale oluşturuluyor...');
      const article = await this.generateDailyArticle();
      
      // ForumService'i dinamik olarak import et (circular dependency'yi önlemek için)
      const { ForumService } = await import('./forumService');
      
      // Slug oluştur
      const slug = this.createSlug(article.title || 'varsayilan-baslik');
      
      const postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'> = {
        title: article.title || 'Başlıksız Makale',
        content: article.content || 'İçerik bulunamadı.',
        excerpt: article.excerpt || 'Özet bulunamadı.',
        slug: slug,
        tags: article.tags || [],
        seoKeywords: article.seoKeywords || [],
        metaDescription: article.metaDescription || '',
        imageUrl: article.imageUrl,
        isPublished: true, // Otomatik makaleler yayınlanmış olarak kaydedilir
        isGenerated: true,
        authorId: 'numa-parfum',
        authorName: 'Numa Parfüm',
      };

      const postId = await ForumService.addPost(postData);
      console.log('✅ Makale başarıyla kaydedildi. ID:', postId);
      console.log('📄 Makale başlığı:', article.title);
      
      return postId;
    } catch (error) {
      console.error('❌ Makale oluşturma ve kaydetme hatası:', error);
      throw error;
    }
  }

  public static initializeAutoGeneration(time: string, immediate = false) {
    if (autoGenerationIntervalId) {
      clearInterval(autoGenerationIntervalId);
      console.log('Mevcut otomatik oluşturma programı temizlendi.');
    }

    if (!geminiApiKey) {
      console.error("Gemini API anahtarı eksik. Otomatik oluşturma başlatılamıyor.");
      return;
    }

    console.log(`🤖 Otomatik makale oluşturma sistemi ayarlandı. Yayın saati: ${time}`);

    const startGeneration = () => {
      const [hour, minute] = time.split(':').map(Number);
      const now = new Date();
      
      let nextPostTime = new Date();
      nextPostTime.setHours(hour, minute, 0, 0);

      if (now > nextPostTime) {
        nextPostTime.setDate(nextPostTime.getDate() + 1);
      }
      
      const delay = nextPostTime.getTime() - now.getTime();

      console.log(`⏰ Sonraki makale oluşturulacak: ${nextPostTime.toLocaleString('tr-TR')}`);

      autoGenerationIntervalId = setTimeout(async () => {
        try {
          console.log('⚡ Zamanlanmış görev tetiklendi: Otomatik makale oluşturuluyor...');
          const postId = await this.generateAndSaveArticle();
          console.log('🎉 Otomatik makale başarıyla oluşturuldu ve yayınlandı. ID:', postId);
        } catch (error) {
          console.error("❌ Otomatik makale oluşturma hatası:", error);
        }
        // Bir sonraki çalıştırma için tekrar ayarla (24 saat sonra)
        startGeneration(); 
      }, delay);
    };
    
    startGeneration();

    if (immediate) {
      console.log("🚀 Hemen makale oluşturma talep edildi.");
      this.generateAndSaveArticle().then(postId => {
        console.log("✅ Hemen oluşturulan makale kaydedildi. ID:", postId);
      }).catch(error => {
        console.error("❌ Hemen makale oluşturma başarısız:", error);
      });
    }
  }

  public static stopAutoGeneration() {
    if (autoGenerationIntervalId) {
      clearInterval(autoGenerationIntervalId);
      autoGenerationIntervalId = null;
      console.log('🛑 Otomatik makale oluşturma durduruldu.');
    } else {
      console.log('ℹ️ Otomatik makale oluşturma zaten pasif.');
    }
  }

  private getRandomTopic(): string {
    const topics = [
      "Parfüm seçerken dikkat edilmesi gereken faktörler",
      "Mevsimlik parfüm kullanımı rehberi",
      "Parfümün tarihi ve gelişimi",
      "Doğal parfümler vs sentetik parfümler",
      "Parfüm katmanlaması sanatı",
      "Parfümün cilde etkileri ve doğru kullanım",
      "Unisex parfümler ve modern koku trendi",
      "Parfüm saklama ve koruma yöntemleri",
      "Ünlü parfüm yapımcıları ve markaları",
      "Gece ve gündüz parfümü nasıl seçilir",
      "Parfüm ve kişilik arasındaki bağ",
      "Parfümde kalıcılık faktörleri",
      "Organik ve vegan parfümler",
      "Parfüm koleksiyonu oluşturma rehberi",
      "Parfümün psikolojik etkileri",
      "İmza koku yaratma sanatı",
      "Parfümde yaş faktörü ve doğru seçim",
      "Lüks parfümler ve niche markalar",
      "Parfüm test etme ve seçim ipuçları",
      "Parfümün moda dünyasındaki yeri"
    ];

    // Kullanılmamış konuları filtrele
    const unusedTopics = topics.filter(topic => !this.usedTopics.has(topic));
    
    // Eğer tüm konular kullanılmışsa, listeyi sıfırla
    if (unusedTopics.length === 0) {
      this.usedTopics.clear();
      console.log('🔄 Tüm konular kullanıldı, liste sıfırlandı.');
    }

    const availableTopics = unusedTopics.length > 0 ? unusedTopics : topics;
    const selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    
    // Seçilen konuyu kullanılmış olarak işaretle
    this.usedTopics.add(selectedTopic);
    
    return selectedTopic;
  }

  private generateUniqueAngle(): string {
    const angles = [
      "Uzman görüşleri ve öneriler",
      "Güncel trendler ve yenilikler",
      "Başlangıç rehberi ve ipuçları",
      "İleri seviye teknikleri",
      "Yaygın hatalar ve çözümler",
      "Profesyonel perspektif",
      "Bilimsel yaklaşım",
      "Kültürel ve sosyal boyut",
      "Ekonomik değerlendirme",
      "Gelecek öngörüleri"
    ];
    
    return angles[Math.floor(Math.random() * angles.length)];
  }

  private static createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }
}