import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Save, X, Eye, EyeOff, Upload, 
  Settings, Bot, RefreshCw, LogOut, Users
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { ProductService } from '../services/productService';
import { SettingsService } from '../services/settingsService';
import { GeminiService } from '../services/geminiService';
import { useSettings } from '../hooks/useSettings';
import { useForum } from '../hooks/useForum';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { Product, SiteSettings, User, ForumPost } from '../types';
import { ImageUtils } from '../utils/imageUtils';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forum');
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // Custom hooks to manage state
  const { settings, loading: settingsLoading, error: settingsError, updateSettings } = useSettings();
  const { posts, loading: postsLoading, error: postsError, addPost, updatePost, deletePost } = useForum();

  // Gemini specific states
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [autoGenerationEnabled, setAutoGenerationEnabled] = useState(false);
  const [dailyPostTime, setDailyPostTime] = useState('09:00');
  
  // Post editing state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostData, setEditPostData] = useState<Partial<ForumPost>>({});
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  
  // Connection status
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // Temporary settings state for editing, with a robust fallback structure
  const [tempSettings, setTempSettings] = useState<SiteSettings>(() => {
    const defaultSettings = SettingsService.getDefaultSettings();
    return settings || defaultSettings;
  });

  // Product management states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    originalName: '',
    price: 0,
    image: '',
    description: '',
    category: 'kadın',
    brand: 'Numa Parfume',
    originalBrand: '',
    size: '50ml',
    inStock: true,
    featured: false,
    collection: false,
    shopierLink: '',
    seoKeywords: []
  });

  // Products data
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Admin email kontrolü
      let isValidAdmin = false;
      if (user && user.email) {
        try {
          isValidAdmin = await AuthService.isAdmin(user);
        } catch (error) {
          console.error('Error checking admin status:', error);
          isValidAdmin = false;
        }
      }
      
      setIsAuthenticated(isValidAdmin);
      setIsLoading(false);
      
      if (!isValidAdmin && user) {
        // Admin olmayan kullanıcıyı çıkart
        signOut(auth);
        alert('Bu panele sadece yetkili admin kullanıcısı erişebilir.');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (settings) {
      // Ensure all nested objects are present
      setTempSettings({
        ...SettingsService.getDefaultSettings(),
        ...settings,
        contactInfo: {
          ...SettingsService.getDefaultSettings().contactInfo,
          ...settings.contactInfo,
        },
        socialMedia: {
          ...SettingsService.getDefaultSettings().socialMedia,
          ...settings.socialMedia,
        },
        seo: {
          ...SettingsService.getDefaultSettings().seo,
          ...settings.seo,
        },
        geminiSettings: {
          ...SettingsService.getDefaultSettings().geminiSettings,
          ...settings.geminiSettings,
        },
        campaignSettings: {
          ...SettingsService.getDefaultSettings().campaignSettings,
          ...settings.campaignSettings,
          // Tarih validasyonu ile güvenli başlatma
          startDate: (() => {
            try {
              if (!settings.campaignSettings?.startDate) return undefined;
              const date = new Date(settings.campaignSettings.startDate);
              return isNaN(date.getTime()) ? undefined : settings.campaignSettings.startDate;
            } catch {
              return undefined;
            }
          })(),
          endDate: (() => {
            try {
              if (!settings.campaignSettings?.endDate) return undefined;
              const date = new Date(settings.campaignSettings.endDate);
              return isNaN(date.getTime()) ? undefined : settings.campaignSettings.endDate;
            } catch {
              return undefined;
            }
          })(),
        },
      });
    }
  }, [settings]);

  const loadInitialData = async () => {
    setIsLoading(true);
    await fetchSettingsAndSetConnectionStatus();
    await loadGeminiSettings();
    await fetchProducts();
    setIsLoading(false);
  };

  const fetchSettingsAndSetConnectionStatus = async () => {
    try {
      console.log("Fetching settings from Firebase...");
      const { settings: fetchedSettings, fromCache } = await SettingsService.getSiteSettings();
      
      console.log("Settings fetch result:", { fromCache, settings: fetchedSettings });
      
      if (fetchedSettings) {
        // Güvenli kampanya ayarları ile tempSettings güncellemesi
        const safeCampaignSettings = {
          ...SettingsService.getDefaultSettings().campaignSettings,
          ...fetchedSettings.campaignSettings,
          startDate: (() => {
            try {
              if (!fetchedSettings.campaignSettings?.startDate) return undefined;
              const date = new Date(fetchedSettings.campaignSettings.startDate);
              return isNaN(date.getTime()) ? undefined : fetchedSettings.campaignSettings.startDate;
            } catch {
              return undefined;
            }
          })(),
          endDate: (() => {
            try {
              if (!fetchedSettings.campaignSettings?.endDate) return undefined;
              const date = new Date(fetchedSettings.campaignSettings.endDate);
              return isNaN(date.getTime()) ? undefined : fetchedSettings.campaignSettings.endDate;
            } catch {
              return undefined;
            }
          })(),
        };
        
        setTempSettings({
          ...SettingsService.getDefaultSettings(),
          ...fetchedSettings,
          campaignSettings: safeCampaignSettings,
        });
      }
      
      setIsFirebaseConnected(!fromCache);
      
      if (fromCache) {
        console.warn("Firebase connection failed, using cached data");
        alert('DİKKAT: Firebase yetki hatası veya bağlantı sorunu. Ayarlar sadece görüntülenebilir, kaydedilemez. Lütfen Firebase Rules kurallarını güncelleyin.');
      } else {
        console.log("Firebase connection successful");
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setIsFirebaseConnected(false);
      alert('Firebase bağlantı hatası: ' + (error as Error).message);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const fetchedProducts = await ProductService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadGeminiSettings = async () => {
    try {
      const isActive = settings?.geminiSettings?.isActive || false;
      const dailyTime = settings?.geminiSettings?.dailyPostTime || '09:00';
      
      setAutoGenerationEnabled(isActive);
      setDailyPostTime(dailyTime);
      
      // Eğer otomatik sistem aktifse, sayfa yüklendiğinde başlat
      if (isActive && dailyTime) {
        console.log('🔄 Sayfa yüklendiğinde otomatik makale sistemi yeniden başlatılıyor...');
        GeminiService.initializeAutoGeneration(dailyTime, false); // immediate=false
        console.log(`✅ Otomatik sistem aktif - Günlük yayın saati: ${dailyTime}`);
      } else {
        console.log('ℹ️ Otomatik makale sistemi pasif durumda');
      }
    } catch (error) {
      console.error('Error loading Gemini settings:', error);
    }
  };

  const testFirebaseConnection = async () => {
    try {
      console.log("Testing Firebase connection...");
      console.log("Current user:", currentUser);
      console.log("User email:", currentUser?.email);
      console.log("Auth state:", auth.currentUser);
      
      // Test Firestore read access
      const testResult = await SettingsService.getSiteSettings();
      console.log("Firestore read test:", testResult);
      
      // Test admin status
      if (currentUser) {
        const isAdmin = await AuthService.isAdmin(currentUser);
        console.log("Is admin:", isAdmin);
      }
      
      alert("Firebase bağlantı testi tamamlandı. Konsol'u kontrol edin.");
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      alert("Firebase bağlantı testi başarısız: " + (error as Error).message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await AuthService.signInAdmin(loginForm.email, loginForm.password);
      // Auth state listener will handle the rest
    } catch (error) {
      console.error('Login error:', error);
      alert('Giriş başarısız. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleAutoGeneration = () => {
    const newIsEnabled = !autoGenerationEnabled;
    setAutoGenerationEnabled(newIsEnabled);
    // Immediately save this state change
    handleSaveAutoSettings(newIsEnabled);
  };

  const handleSaveAutoSettings = async (isNowEnabled?: boolean) => {
    const isEnabled = isNowEnabled ?? autoGenerationEnabled;
    try {
      await updateSettings({
        geminiSettings: { 
          ...settings.geminiSettings, 
          isActive: isEnabled,
          dailyPostTime: dailyPostTime 
        }
      });
      
      if (isEnabled) {
        GeminiService.initializeAutoGeneration(dailyPostTime, true);
        alert('Otomatik oluşturma sistemi başlatıldı!');
      } else {
        GeminiService.stopAutoGeneration();
        alert('Otomatik oluşturma sistemi durduruldu!');
      }
    } catch (error) {
      console.error('Error saving auto settings:', error);
      alert('Otomatik oluşturma ayarları kaydedilirken hata oluştu.');
    }
  };

  const generateRandomArticle = async () => {
    setIsGenerating(true);
    setGenerationStatus('Rastgele makale oluşturuluyor...');
    
    try {
      const article = await GeminiService.generateDailyArticle();
      if (!article || !article.title || !article.content || !article.excerpt || !article.metaDescription) {
        throw new Error('AI servisinden eksik veri geldi.');
      }
      
      const postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'imageUrl'> = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        slug: article.title.toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        tags: article.tags || [],
        seoKeywords: article.seoKeywords || [],
        metaDescription: article.metaDescription,
        isPublished: true,
        isGenerated: true,
      };

      await addPost(postData);
      setGenerationStatus('');
      alert('Rastgele makale başarıyla oluşturuldu ve yayınlandı!');
    } catch (error) {
      console.error('Error generating random article:', error);
      setGenerationStatus('');
      alert('Makale oluşturulurken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomArticle = async () => {
    if (!customTopic.trim()) {
      alert('Lütfen bir konu girin.');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus(`"${customTopic}" konulu makale oluşturuluyor...`);
    
    try {
      const article = await GeminiService.generateCustomArticle(customTopic);
      if (!article || !article.title || !article.content || !article.excerpt || !article.metaDescription) {
        throw new Error('AI servisinden eksik veri geldi.');
      }
      
      const postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'imageUrl'> = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        slug: article.title.toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        tags: article.tags || [],
        seoKeywords: article.seoKeywords || [],
        metaDescription: article.metaDescription,
        isPublished: true,
        isGenerated: true,
      };

      await addPost(postData);
      setGenerationStatus('');
      setCustomTopic('');
      alert(`"${customTopic}" konulu makale başarıyla oluşturuldu ve yayınlandı!`);
    } catch (error) {
      console.error('Error generating custom article:', error);
      setGenerationStatus('');
      alert('Makale oluşturulurken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPost = (post: ForumPost) => {
    setSelectedPost(post);
    setEditPostData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags,
      isPublished: post.isPublished
    });
    setIsEditingPost(true);
  };

  const handleUpdatePost = async () => {
    if (!selectedPost) return;

    try {
      await updatePost(selectedPost.id, editPostData);
      alert('Makale başarıyla güncellendi!');
      setIsEditingPost(false);
      setSelectedPost(null);
      setEditPostData({});
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Makale güncellenirken hata oluştu.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Bu makaleyi silmek istediğinizden emin misiniz?')) {
      try {
        await deletePost(postId);
        alert('Makale başarıyla silindi!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Makale silinirken hata oluştu.');
      }
    }
  };

  // Product management functions
  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, editingProduct);
        setEditingProduct(null);
      } else if (isAddingProduct) {
        await ProductService.addProduct(newProduct);
        setNewProduct({
          name: '',
          originalName: '',
          price: 0,
          image: '',
          description: '',
          category: 'kadın',
          brand: 'Numa Parfume',
          originalBrand: '',
          size: '50ml',
          inStock: true,
          featured: false,
          shopierLink: '',
          seoKeywords: []
        });
        setIsAddingProduct(false);
      }
      await fetchProducts();
      alert('Ürün başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken hata oluştu.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await ProductService.deleteProduct(id);
        await fetchProducts();
        alert('Ürün başarıyla silindi!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Ürün silinirken hata oluştu.');
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(tempSettings);
      alert('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken hata oluştu.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isProduct = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // File validasyonu
      const validation = ImageUtils.validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      console.log(`📁 Orijinal dosya: ${file.name} (${ImageUtils.getBase64SizeKB(await ImageUtils.fileToBase64(file))}KB)`);

      // Image'i compress et
      const compressedBase64 = await ImageUtils.fileToCompressedBase64(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        maxSizeKB: 900 // Firestore limitinin altında
      });

      const finalSizeKB = ImageUtils.getBase64SizeKB(compressedBase64);
      console.log(`🗜️ Compress edilmiş: ${finalSizeKB}KB`);

      if (finalSizeKB > 1000) {
        alert('Dosya çok büyük. Lütfen daha küçük bir görsel seçin.');
        return;
      }

        if (isProduct) {
          if (editingProduct) {
          setEditingProduct({ ...editingProduct, image: compressedBase64 });
          } else {
          setNewProduct({ ...newProduct, image: compressedBase64 });
          }
        }

      console.log('✅ Görsel başarıyla yüklendi ve compress edildi');
    } catch (error) {
      console.error('❌ Image upload hatası:', error);
      alert('Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Önerilen parfüm konuları
  const perfumeTopics = [
    'Parfüm Tarihi ve Gelişimi',
    'Koku Notaları Rehberi',
    'Mevsimlik Parfüm Seçimi',
    'Parfüm Saklama İpuçları',
    'Doğal vs Sentetik Kokular',
    'Parfüm Uygulama Teknikleri',
    'Ünlü Parfümörler',
    'Parfüm ve Moda İlişkisi',
    'Cilt Tipine Göre Parfüm',
    'Vintage Parfümler',
    'Nişe vs Ticari Parfümler',
    'Parfüm Koleksiyonculuğu',
    'Koku Hafızası',
    'Parfüm İnceleme Rehberi',
    'Evde Parfüm Yapımı'
  ];

  if (isLoading || settingsLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Paneli</h1>
            <p className="text-gray-600">Yetkili admin kullanıcısı ile giriş yapın</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@email.com"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Şifrenizi girin"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'forum', label: 'Forum Yönetimi', icon: Users },
              { id: 'products', label: 'Ürün Yönetimi', icon: Plus },
              { id: 'settings', label: 'Site Ayarları', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {/* Forum Tab */}
            {activeTab === 'forum' && (
              <div className="space-y-6">
                {/* AI Makale Oluşturma */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-purple-600" />
                    🤖 AI Makale Oluşturma
                  </h3>
                  
                  {!isFirebaseConnected && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">⚠️ Firebase bağlantı sorunu. Makale oluşturma şu anda mümkün değil.</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={generateRandomArticle}
                      disabled={!isFirebaseConnected || isGenerating}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Bot className="w-5 h-5" />
                          Rastgele Makale Oluştur
                        </>
                      )}
                    </button>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="Özel konu girin (örn: Kış parfümleri)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={!isFirebaseConnected}
                      />
                      <button
                        onClick={generateCustomArticle}
                        disabled={!isFirebaseConnected || !customTopic.trim() || isGenerating}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Bot className="w-4 h-4" />
                            Oluştur
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Önerilen Konular */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💡 Önerilen Parfüm Konuları
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {perfumeTopics.map((topic, index) => (
                        <button
                          key={index}
                          onClick={() => setCustomTopic(topic)}
                          disabled={isGenerating}
                          className="text-left px-3 py-2 text-sm bg-white hover:bg-gray-50 rounded-md border border-gray-200 transition-colors disabled:opacity-50"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {generationStatus && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-800 text-sm flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {generationStatus}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 text-sm">
                      💡 AI sistemi aktiftir. Otomatik makale paylaşımını durdurmak veya yayın saatini değiştirmek için <strong>Ayarlar</strong> sekmesine gidin.
                    </p>
                  </div>
                </div>

                {/* Mevcut Makaleler */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">📝 Mevcut Makaleler</h3>
                  {postsError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800 text-sm">{postsError}</p>
                    </div>
                  )}
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Henüz makale bulunmuyor.</p>
                      <p className="text-sm">Yukarıdaki butonları kullanarak ilk makalenizi oluşturun!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                              <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
                                <span>📅 {new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                                <span>👁️ {post.viewCount} görüntüleme</span>
                                <span className={post.isPublished ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                  {post.isPublished ? '✅ Yayında' : '❌ Taslak'}
                                </span>
                                {post.isGenerated && <span className="text-purple-600 font-medium">🤖 AI Üretimi</span>}
                              </div>
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {post.tags.map((tag, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditPost(post)}
                                disabled={!isFirebaseConnected}
                                className="bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                disabled={!isFirebaseConnected}
                                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={testFirebaseConnection}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      🔧 Firebase Test
                    </button>
                    <button
                      onClick={() => setIsAddingProduct(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ürün Ekle
                    </button>
                  </div>
                </div>

                {isAddingProduct && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Yeni Ürün Ekle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı (Görünen)</label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Örn: Chanel No. 5 Benzeri"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Orijinal Adı (SEO için, gizli)</label>
                        <input
                          type="text"
                          value={newProduct.originalName}
                          onChange={(e) => setNewProduct({ ...newProduct, originalName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Örn: Chanel No. 5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="kadın">Kadın</option>
                          <option value="erkek">Erkek</option>
                          <option value="unisex">Unisex</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marka (Görünen)</label>
                        <input
                          type="text"
                          value={newProduct.brand}
                          onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Orijinal Marka (SEO için, gizli)</label>
                        <input
                          type="text"
                          value={newProduct.originalBrand}
                          onChange={(e) => setNewProduct({ ...newProduct, originalBrand: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Örn: Chanel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Boyut</label>
                        <input
                          type="text"
                          value={newProduct.size}
                          onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shopier Link</label>
                        <input
                          type="url"
                          value={newProduct.shopierLink}
                          onChange={(e) => setNewProduct({ ...newProduct, shopierLink: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://shopier.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Görsel</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newProduct.image}
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                            placeholder="Görsel URL'si"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <label className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md cursor-pointer flex items-center">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Anahtar Kelimeleri</label>
                        <input
                          type="text"
                          value={newProduct.seoKeywords?.join(', ') || ''}
                          onChange={(e) => setNewProduct({ 
                            ...newProduct, 
                            seoKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="parfüm, kadın parfümü, chanel"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                        <textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newProduct.inStock}
                            onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                            className="mr-2"
                          />
                          Stokta Var
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newProduct.featured}
                            onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                            className="mr-2"
                          />
                          Öne Çıkan
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newProduct.collection || false}
                            onChange={(e) => setNewProduct({ ...newProduct, collection: e.target.checked })}
                            className="mr-2"
                          />
                          Koleksiyonu Keşfet
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSaveProduct}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Kaydet
                      </button>
                      <button
                        onClick={() => setIsAddingProduct(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Products List */}
                <div className="grid gap-4">
                  {productsLoading ? (
                    <div className="text-center py-8">Ürünler yükleniyor...</div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Ürün bulunamadı</div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {product.image && (
                              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                            )}
                            <div>
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-sm text-gray-500">Orijinal: {product.originalName}</p>
                              <p className="text-gray-600">₺{product.price}</p>
                              <p className="text-sm text-gray-500">{product.category} - {product.brand}</p>
                              <div className="flex gap-2 mt-1">
                                {product.inStock && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Stokta</span>}
                                {product.featured && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Öne Çıkan</span>}
                                {product.collection && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Koleksiyon</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Site Ayarları</h2>
                
                {/* Genel Ayarlar */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Genel Ayarlar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Adı</label>
                      <input
                        type="text"
                        value={tempSettings.siteName}
                        onChange={(e) => setTempSettings({ ...tempSettings, siteName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Sloganı</label>
                      <input
                        type="text"
                        value={tempSettings.siteSlogan}
                        onChange={(e) => setTempSettings({ ...tempSettings, siteSlogan: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Açıklaması</label>
                      <textarea
                        value={tempSettings.siteDescription}
                        onChange={(e) => setTempSettings({ ...tempSettings, siteDescription: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Görseli URL</label>
                      <input
                        type="url"
                        value={tempSettings.heroImage}
                        onChange={(e) => setTempSettings({ ...tempSettings, heroImage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logo Görseli URL</label>
                      <input
                        type="url"
                        value={tempSettings.logoImage}
                        onChange={(e) => setTempSettings({ ...tempSettings, logoImage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">İletişim Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                      <input
                        type="email"
                        value={tempSettings.contactInfo.email}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          contactInfo: { ...tempSettings.contactInfo, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={tempSettings.contactInfo.phone}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          contactInfo: { ...tempSettings.contactInfo, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                      <textarea
                        value={tempSettings.contactInfo.address}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          contactInfo: { ...tempSettings.contactInfo, address: e.target.value }
                        })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sosyal Medya */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Sosyal Medya</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input
                        type="url"
                        value={tempSettings.socialMedia.instagram}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          socialMedia: { ...tempSettings.socialMedia, instagram: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={tempSettings.socialMedia.facebook}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          socialMedia: { ...tempSettings.socialMedia, facebook: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                      <input
                        type="url"
                        value={tempSettings.socialMedia.twitter}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          socialMedia: { ...tempSettings.socialMedia, twitter: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Ayarları */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">SEO Ayarları</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Başlık</label>
                      <input
                        type="text"
                        value={tempSettings.seo.metaTitle}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          seo: { ...tempSettings.seo, metaTitle: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Açıklama</label>
                      <textarea
                        value={tempSettings.seo.metaDescription}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          seo: { ...tempSettings.seo, metaDescription: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Anahtar Kelimeler (virgülle ayırın)</label>
                      <input
                        type="text"
                        value={tempSettings.seo.keywords.join(', ')}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          seo: { 
                            ...tempSettings.seo, 
                            keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="parfüm, koku, esans, güzellik"
                      />
                    </div>
                  </div>
                </div>

                {/* Kampanya Ayarları */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-green-600">🎯</span>
                    Kampanya Ayarları
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Kampanya Durumu */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={tempSettings.campaignSettings?.isActive || false}
                          onChange={(e) => setTempSettings({ 
                            ...tempSettings, 
                            campaignSettings: { 
                              ...tempSettings.campaignSettings, 
                              isActive: e.target.checked 
                            }
                          })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Kampanya Aktif</span>
                      </label>
                      {tempSettings.campaignSettings?.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✅ Aktif
                        </span>
                      )}
                    </div>

                    {/* Kampanya Başlık ve Açıklama */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Başlığı</label>
                        <input
                          type="text"
                          value={tempSettings.campaignSettings?.title || ''}
                          onChange={(e) => setTempSettings({ 
                            ...tempSettings, 
                            campaignSettings: { 
                              ...tempSettings.campaignSettings, 
                              title: e.target.value 
                            }
                          })}
                          placeholder="Özel İndirim Kampanyası"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Alım Tutarı (₺)</label>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={tempSettings.campaignSettings?.minAmount || 0}
                          onChange={(e) => setTempSettings({ 
                            ...tempSettings, 
                            campaignSettings: { 
                              ...tempSettings.campaignSettings, 
                              minAmount: Number(e.target.value) 
                            }
                          })}
                          placeholder="500"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Açıklaması</label>
                      <textarea
                        value={tempSettings.campaignSettings?.description || ''}
                        onChange={(e) => setTempSettings({ 
                          ...tempSettings, 
                          campaignSettings: { 
                            ...tempSettings.campaignSettings, 
                            description: e.target.value 
                          }
                        })}
                        rows={2}
                        placeholder="Belirli bir tutarın üzerindeki alışverişlerde indirim fırsatı!"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* İndirim Tipi ve Değeri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Tipi</label>
                        <select
                          value={tempSettings.campaignSettings?.discountType || 'percentage'}
                          onChange={(e) => setTempSettings({ 
                            ...tempSettings, 
                            campaignSettings: { 
                              ...tempSettings.campaignSettings, 
                              discountType: e.target.value as 'percentage' | 'fixed'
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="percentage">Yüzde İndirim (%)</option>
                          <option value="fixed">Sabit Tutar İndirim (₺)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          İndirim Değeri 
                          {tempSettings.campaignSettings?.discountType === 'percentage' ? ' (%)' : ' (₺)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={tempSettings.campaignSettings?.discountType === 'percentage' ? 100 : undefined}
                          step={tempSettings.campaignSettings?.discountType === 'percentage' ? 1 : 10}
                          value={tempSettings.campaignSettings?.discountValue || 0}
                          onChange={(e) => setTempSettings({ 
                            ...tempSettings, 
                            campaignSettings: { 
                              ...tempSettings.campaignSettings, 
                              discountValue: Number(e.target.value) 
                            }
                          })}
                          placeholder={tempSettings.campaignSettings?.discountType === 'percentage' ? '10' : '50'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {/* Kampanya Tarihleri (Opsiyonel) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi (opsiyonel)</label>
                        <input
                          type="datetime-local"
                          value={(() => {
                            try {
                              if (!tempSettings.campaignSettings?.startDate) return '';
                              const date = new Date(tempSettings.campaignSettings.startDate);
                              if (isNaN(date.getTime())) return '';
                              return date.toISOString().slice(0, 16);
                            } catch (error) {
                              console.warn('Kampanya başlangıç tarihi hatası:', error);
                              return '';
                            }
                          })()}
                          onChange={(e) => {
                            try {
                              setTempSettings({ 
                                ...tempSettings, 
                                campaignSettings: { 
                                  ...tempSettings.campaignSettings, 
                                  startDate: e.target.value ? (() => {
                                    const date = new Date(e.target.value);
                                    return isNaN(date.getTime()) ? undefined : date;
                                  })() : undefined 
                                }
                              });
                            } catch (error) {
                              console.warn('Kampanya başlangıç tarihi ayarlanırken hata:', error);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi (opsiyonel)</label>
                        <input
                          type="datetime-local"
                          value={(() => {
                            try {
                              if (!tempSettings.campaignSettings?.endDate) return '';
                              const date = new Date(tempSettings.campaignSettings.endDate);
                              if (isNaN(date.getTime())) return '';
                              return date.toISOString().slice(0, 16);
                            } catch (error) {
                              console.warn('Kampanya bitiş tarihi hatası:', error);
                              return '';
                            }
                          })()}
                          onChange={(e) => {
                            try {
                              setTempSettings({ 
                                ...tempSettings, 
                                campaignSettings: { 
                                  ...tempSettings.campaignSettings, 
                                  endDate: e.target.value ? (() => {
                                    const date = new Date(e.target.value);
                                    return isNaN(date.getTime()) ? undefined : date;
                                  })() : undefined 
                                }
                              });
                            } catch (error) {
                              console.warn('Kampanya bitiş tarihi ayarlanırken hata:', error);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {/* Kampanya Önizleme */}
                    {tempSettings.campaignSettings?.isActive && tempSettings.campaignSettings?.minAmount > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">📋 Kampanya Önizleme</h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <p><strong>Başlık:</strong> {tempSettings.campaignSettings.title}</p>
                          <p><strong>Açıklama:</strong> {tempSettings.campaignSettings.description}</p>
                          <p><strong>Minimum Tutar:</strong> ₺{tempSettings.campaignSettings.minAmount.toLocaleString()}</p>
                          <p><strong>İndirim:</strong> 
                            {tempSettings.campaignSettings.discountType === 'percentage' 
                              ? `%${tempSettings.campaignSettings.discountValue} indirim`
                              : `₺${tempSettings.campaignSettings.discountValue} indirim`
                            }
                          </p>
                          {(() => {
                            try {
                              if (!tempSettings.campaignSettings.startDate) return null;
                              const date = new Date(tempSettings.campaignSettings.startDate);
                              if (isNaN(date.getTime())) return null;
                              return <p><strong>Başlangıç:</strong> {date.toLocaleString('tr-TR')}</p>;
                            } catch (error) {
                              console.warn('Kampanya başlangıç tarihi önizleme hatası:', error);
                              return null;
                            }
                          })()}
                          {(() => {
                            try {
                              if (!tempSettings.campaignSettings.endDate) return null;
                              const date = new Date(tempSettings.campaignSettings.endDate);
                              if (isNaN(date.getTime())) return null;
                              return <p><strong>Bitiş:</strong> {date.toLocaleString('tr-TR')}</p>;
                            } catch (error) {
                              console.warn('Kampanya bitiş tarihi önizleme hatası:', error);
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gemini API Ayarları */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-purple-600" />
                    🤖 Gemini AI Ayarları
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Otomatik Makale Paylaşımı
                          </label>
                           <p className="text-xs text-gray-500 mb-2">
                            Sistem her gün belirtilen saatte otomatik olarak yeni bir makale yayınlar.
                          </p>
                          {autoGenerationEnabled && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-xs text-green-700 font-medium">
                                ✅ Sistem Aktif - Günlük yayın saati: {dailyPostTime}
                              </p>
                              <p className="text-xs text-green-600">
                                Bir sonraki makale otomatik olarak yarın {dailyPostTime}'te yayınlanacak.
                              </p>
                            </div>
                          )}
                          {!autoGenerationEnabled && (
                            <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
                              <p className="text-xs text-orange-700 font-medium">
                                ⏸️ Sistem Pasif - Otomatik makale paylaşımı durduruldu
                              </p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleToggleAutoGeneration}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ml-4 ${
                            autoGenerationEnabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              autoGenerationEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {autoGenerationEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Günlük Yayın Saati
                            </label>
                            <input
                              type="time"
                              value={dailyPostTime}
                              onChange={(e) => setDailyPostTime(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => handleSaveAutoSettings()}
                              disabled={!isFirebaseConnected}
                              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Saati Kaydet
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kaydet Butonu */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={!isFirebaseConnected}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Tüm Site Ayarlarını Kaydet
                  </button>
                </div>

                {settingsError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{settingsError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Ürün Düzenle</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı (Görünen)</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Chanel No. 5 Benzeri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orijinal Adı (SEO için, gizli)</label>
                  <input
                    type="text"
                    value={editingProduct.originalName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Chanel No. 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kadın">Kadın</option>
                    <option value="erkek">Erkek</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marka (Görünen)</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orijinal Marka (SEO için, gizli)</label>
                  <input
                    type="text"
                    value={editingProduct.originalBrand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalBrand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Chanel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Boyut</label>
                  <input
                    type="text"
                    value={editingProduct.size}
                    onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shopier Link</label>
                  <input
                    type="url"
                    value={editingProduct.shopierLink}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shopierLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://shopier.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Görsel</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="Görsel URL'si"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md cursor-pointer flex items-center">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Anahtar Kelimeleri</label>
                  <input
                    type="text"
                    value={editingProduct.seoKeywords?.join(', ') || ''}
                    onChange={(e) => setEditingProduct({ 
                      ...editingProduct, 
                      seoKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="parfüm, kadın parfümü, chanel"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.inStock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                      className="mr-2"
                    />
                    Stokta Var
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="mr-2"
                    />
                    Öne Çıkan
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.collection || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, collection: e.target.checked })}
                      className="mr-2"
                    />
                    Koleksiyonu Keşfet
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Edit Modal */}
      {isEditingPost && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Makale Düzenle</h3>
                <button
                  onClick={() => setIsEditingPost(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={editPostData.title || ''}
                    onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Özet</label>
                  <textarea
                    value={editPostData.excerpt || ''}
                    onChange={(e) => setEditPostData({ ...editPostData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
                  <textarea
                    value={editPostData.content || ''}
                    onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editPostData.isPublished || false}
                      onChange={(e) => setEditPostData({ ...editPostData, isPublished: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Yayınla</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditingPost(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdatePost}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};