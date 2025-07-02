import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteSettings } from '../types';

const SETTINGS_DOC_ID = 'site-settings';

// Default settings fallback
export const DEFAULT_SETTINGS: Omit<SiteSettings, 'id'> = {
  siteName: 'Numa Parfume',
  siteSlogan: 'Benzersiz Benzerlik',
  siteDescription: 'Numa Parfume ile benzersiz benzerlik deneyimi yaşayın. Kadın, erkek ve unisex parfüm koleksiyonlarımızı keşfedin.',
  heroImage: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
  logoImage: '/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg',
  contactInfo: {
    email: 'info@numaparfume.com',
    phone: '+90 (555) 123 45 67',
    address: 'İstanbul, Türkiye\nParfüm Sokağı No: 123'
  },
  socialMedia: {
    instagram: 'https://instagram.com/numaparfume',
    facebook: 'https://facebook.com/numaparfume',
    twitter: 'https://twitter.com/numaparfume'
  },
  seo: {
    metaTitle: 'Numa Parfume - Benzersiz Benzerlik',
    metaDescription: 'Numa Parfume ile benzersiz benzerlik deneyimi yaşayın. Kadın, erkek ve unisex parfüm koleksiyonlarımızı keşfedin.',
    keywords: ['parfüm', 'kadın parfümü', 'erkek parfümü', 'unisex parfüm', 'numa parfume']
  },
  geminiSettings: {
    apiKey: '',
    isActive: false,
    dailyPostTime: '09:00',
    lastPostDate: undefined
  },
  campaignSettings: {
    isActive: false,
    title: 'Özel İndirim Kampanyası',
    description: 'Belirli bir tutarın üzerindeki alışverişlerde indirim fırsatı!',
    minAmount: 500,
    discountType: 'percentage',
    discountValue: 10,
    startDate: undefined,
    endDate: undefined
  },
  updatedAt: new Date()
};

export class SettingsService {
  // Site ayarlarını getir
  static async getSiteSettings(): Promise<{ settings: SiteSettings; fromCache: boolean }> {
    try {
      const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as SiteSettings;
        return { settings: data, fromCache: false };
      }
      
      console.warn('Site settings document not found, using default settings');
      return { settings: { id: SETTINGS_DOC_ID, ...DEFAULT_SETTINGS }, fromCache: true };
      
    } catch (error) {
      // Firebase hatası sessizce handle et (development modunda sadece bir kez log)
      if (process.env.NODE_ENV === 'development' && !(window as any).__firebaseErrorLogged) {
        console.warn('🔥 Firebase bağlantı hatası - default ayarlar kullanılıyor');
        (window as any).__firebaseErrorLogged = true;
      }
      return { settings: { id: SETTINGS_DOC_ID, ...DEFAULT_SETTINGS }, fromCache: true };
    }
  }

  // Site ayarlarını güncelle (sadece admin için)
  static async updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
    try {
      const cleanSettings = this.cleanSettingsData({ ...settings, updatedAt: Timestamp.now() });
      const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
      await setDoc(docRef, cleanSettings, { merge: true });
    } catch (error) {
      console.error('Error updating site settings:', error);
      throw new Error('Site ayarları güncellenirken hata oluştu');
    }
  }

  // Gemini ayarlarını güncelle
  static async updateGeminiSettings(geminiSettings: Partial<SiteSettings['geminiSettings']>): Promise<void> {
    try {
      const cleanData = this.cleanSettingsData({ geminiSettings, updatedAt: Timestamp.now() });
      const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
      await setDoc(docRef, cleanData, { merge: true });
    } catch (error) {
      console.error('Error updating Gemini settings:', error);
      throw new Error('Gemini ayarları güncellenirken hata oluştu');
    }
  }

  // Undefined değerleri temizle
  private static cleanSettingsData(settings: any): any {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Timestamp)) {
          const cleanedNested = this.cleanSettingsData(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    
    return cleaned;
  }

  // Varsayılan ayarları döndür (Firebase bağlantısı olmadığında)
  static getDefaultSettings(): SiteSettings {
    return { id: SETTINGS_DOC_ID, ...DEFAULT_SETTINGS };
  }

  // Otomatik makale oluşturmayı aktif/pasif et
  static async toggleAutoGeneration(isActive: boolean, dailyPostTime?: string): Promise<void> {
    try {
      const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
      const settingsToUpdate: any = {
        geminiSettings: { isActive },
        updatedAt: Timestamp.now()
      };
      if (dailyPostTime) {
        settingsToUpdate.geminiSettings.dailyPostTime = dailyPostTime;
      }
      await setDoc(docRef, settingsToUpdate, { merge: true });
    } catch (error) {
      console.error('Error toggling auto generation:', error);
      throw new Error('Otomatik oluşturma ayarları güncellenirken hata oluştu');
    }
  }

  // Son makale oluşturma tarihini güncelle
  static async updateLastPostDate(): Promise<void> {
    try {
      const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
      await updateDoc(docRef, {
        'geminiSettings.lastPostDate': Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating last post date:', error);
    }
  }
}