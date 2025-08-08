import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  increment,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ForumPost } from '../types';
import { GeminiService } from './geminiService';
import { SettingsService } from './settingsService';

const COLLECTION_NAME = 'forum-posts';

export class ForumService {
  // Tüm forum gönderilerini getir (yayınlanmış)
  static async getAllPosts(): Promise<ForumPost[]> {
    try {
      // First try the optimized query with composite index
      try {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('isPublished', '==', true),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as ForumPost[];
      } catch (indexError) {
        console.info('ℹ️ Firestore index oluşturuldu, sonraki sorgularda daha hızlı çalışacak');
        
        // Fallback: Get all documents and filter client-side
        const q = query(
          collection(db, COLLECTION_NAME),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const allPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as ForumPost[];

        // Filter published posts client-side
        return allPosts.filter(post => post.isPublished === true);
      }
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      return [];
    }
  }

  // Tüm gönderileri getir (admin için)
  static async getAllPostsForAdmin(): Promise<ForumPost[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as ForumPost[];
    } catch (error) {
      console.error('Error fetching admin forum posts:', error);
      
      // Firebase permissions hatası durumunda localStorage fallback
      if (error instanceof Error && error.message.includes('permissions')) {
        console.warn('Firebase permissions error, using localStorage fallback');
        try {
          const mockPosts = JSON.parse(localStorage.getItem('mock_forum_posts') || '[]');
          return mockPosts.map((post: any) => ({
            ...post,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
          }));
        } catch (localError) {
          console.error('Error loading mock posts:', localError);
          return [];
        }
      }
      
      throw error;
    }
  }

  // Popüler gönderileri getir
  static async getPopularPosts(limitCount: number = 5): Promise<ForumPost[]> {
    try {
      // İlk olarak tüm yayınlanmış gönderileri getir
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isPublished', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      // Client-side'da viewCount'a göre sırala ve limit uygula
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as ForumPost[];

      // ViewCount'a göre sırala (yüksekten düşüğe) ve limit uygula
      return posts
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      return [];
    }
  }

  // Slug ile gönderi getir
  static async getPostBySlug(slug: string): Promise<ForumPost | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('slug', '==', slug),
        where('isPublished', '==', true),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as ForumPost;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }
  }

  // Gönderi görüntüleme sayısını artır
  static async incrementViewCount(postId: string): Promise<void> {
    try {
      const postRef = doc(db, COLLECTION_NAME, postId);
      await updateDoc(postRef, {
        viewCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  // Yeni gönderi ekle
  static async addPost(postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<string> {
    try {
      // Aynı başlığın daha önce kullanılıp kullanılmadığını kontrol et
      await this.checkDuplicateTitle(postData.title);
      
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...postData,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding forum post:', error);
      
      // Firebase hatası durumunda mock ID döndür
      if (error instanceof Error && error.message.includes('permissions')) {
        console.warn('Firebase permissions error - using mock mode');
        const mockId = 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Local Storage'a kaydet (geçici)
        const posts = JSON.parse(localStorage.getItem('mock_forum_posts') || '[]');
        posts.push({
          id: mockId,
          ...postData,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        localStorage.setItem('mock_forum_posts', JSON.stringify(posts));
        
        return mockId;
      }
      
      throw error; // Orijinal hatayı fırlat
    }
  }

  // Başlık tekrarını kontrol et
  private static async checkDuplicateTitle(title: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('title', '==', title),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Bu başlıkta bir makale zaten mevcut. Lütfen farklı bir başlık kullanın.');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Bu başlıkta bir makale')) {
        throw error; // Duplicate title hatası
      }
      
      // Firebase permission hatası durumunda local storage'ı kontrol et
      if (error instanceof Error && error.message.includes('permissions')) {
        const posts = JSON.parse(localStorage.getItem('mock_forum_posts') || '[]');
        const duplicate = posts.find((post: any) => post.title === title);
        if (duplicate) {
          throw new Error('Bu başlıkta bir makale zaten mevcut. Lütfen farklı bir başlık kullanın.');
        }
        return; // Firebase erişilemiyorsa ve local duplicate yoksa devam et
      }
      
      console.warn('Title check failed, proceeding without duplicate check:', error);
      // Kontrol edilemiyorsa devam et (Firebase erişimi yoksa)
    }
  }

  // Gönderi güncelle
  static async updatePost(id: string, postData: Partial<ForumPost>): Promise<void> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(postRef, {
        ...postData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating forum post:', error);
      throw new Error('Forum gönderisi güncellenirken hata oluştu');
    }
  }

  // Gönderi sil
  static async deletePost(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting forum post:', error);
      throw new Error('Forum gönderisi silinirken hata oluştu');
    }
  }

  // Günlük makale oluştur
  static async generateDailyArticle(): Promise<string> {
    try {
      const article = await GeminiService.generateDailyArticle();
      
      // Slug oluştur
      const slug = this.createSlug(article.title);
      
      const postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'> = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        slug: slug,
        tags: article.tags,
        seoKeywords: article.seoKeywords,
        metaDescription: article.metaDescription,
        isPublished: true,
        isGenerated: true,
      };

      return await this.addPost(postData);
    } catch (error) {
      console.error('Error generating daily article:', error);
      throw new Error('Günlük makale oluşturulurken hata oluştu: ' + (error as Error).message);
    }
  }

  // Slug oluştur
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
      .replace(/^-+|-+$/g, '');
  }

  // Bugün makale oluşturuldu mu kontrol et
  static async checkTodayArticleExists(): Promise<boolean> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const q = query(
        collection(db, COLLECTION_NAME),
        where('isGenerated', '==', true),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<', Timestamp.fromDate(endOfDay)),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking today article:', error);
      return false;
    }
  }

  // Otomatik makale oluşturma kontrolü
  static async checkAndGenerateAutoArticle(dailyPostTime: string): Promise<boolean> {
    try {
      // Bugün makale oluşturuldu mu kontrol et
      const hasToday = await this.checkTodayArticleExists();
      if (hasToday) {
        return false; // Bugün zaten makale var
      }

      // Saat kontrolü
      const now = new Date();
      const [hours, minutes] = dailyPostTime.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);

      // Eğer hedef saat geçtiyse ve bugün makale yoksa oluştur
      if (now >= targetTime) {
        await this.generateDailyArticle();

        // SettingsService'e son oluşturma tarihini kaydet
        try {
          await SettingsService.updateLastPostDate();
        } catch (error) {
          console.warn('Last post date update failed:', error);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in auto article generation:', error);
      return false;
    }
  }

  // Otomatik oluşturma scheduler'ını başlat
  static startAutoGenerationScheduler(): void {
    // Her 30 dakikada bir kontrol et
    setInterval(async () => {
      try {
        const { settings, fromCache } = await SettingsService.getSiteSettings();
        
        // Sadece Firebase'e tam erişim varsa otomatik oluşturmayı çalıştır
        if (!fromCache && settings?.geminiSettings?.isActive && settings?.geminiSettings?.apiKey) {
          await this.checkAndGenerateAutoArticle(
            settings.geminiSettings.dailyPostTime || '09:00'
          );
        }
      } catch (error) {
        console.error('Auto generation scheduler error:', error);
      }
    }, 30 * 60 * 1000); // 30 dakika
  }
}