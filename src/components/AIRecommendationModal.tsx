import React, { useState } from 'react';
import { X, Sparkles, Heart, ShoppingBag, ArrowRight, User, Calendar, Sun, Moon, Flower, Zap } from 'lucide-react';
import { Product } from '../types';
import { ProductService } from '../services/productService';

interface AIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserPreferences {
  gender: 'kadın' | 'erkek' | 'unisex' | '';
  age: string;
  occasion: string;
  season: string;
  intensity: string;
  budget: string;
  favoriteNotes: string[];
}

const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    gender: '',
    age: '',
    occasion: '',
    season: '',
    intensity: '',
    budget: '',
    favoriteNotes: []
  });
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const resetModal = () => {
    setStep(1);
    setPreferences({
      gender: '',
      age: '',
      occasion: '',
      season: '',
      intensity: '',
      budget: '',
      favoriteNotes: []
    });
    setRecommendations([]);
    setIsAnalyzing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const generateRecommendations = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Filtreleri hazırla
      const filters: any = {
        inStock: true
      };

      // Cinsiyet filtresi
      if (preferences.gender && preferences.gender !== 'unisex') {
        filters.category = preferences.gender;
      }

      // Bütçe filtresi
      if (preferences.budget) {
        const budgetRanges = {
          'budget': [0, 300],
          'mid': [300, 500],
          'luxury': [500, 1000]
        };
        filters.priceRange = budgetRanges[preferences.budget as keyof typeof budgetRanges] || [0, 1000];
      }

      // Sevilen notlar
      if (preferences.favoriteNotes.length > 0) {
        filters.notes = preferences.favoriteNotes;
      }

      // Ürünleri getir
      let filteredProducts = await ProductService.getProductsForAI(filters);
      
      // Eğer filtreli ürün yoksa, tüm ürünleri al
      if (filteredProducts.length === 0) {
        filteredProducts = await ProductService.getAllProducts();
        filteredProducts = filteredProducts.filter(p => p.inStock);
      }

      // Occasion-based scoring
      const occasionScores: { [key: string]: { [key: string]: number } } = {
        'daily': { 'light': 3, 'moderate': 2, 'strong': 1 },
        'work': { 'light': 3, 'moderate': 2, 'strong': 1 },
        'evening': { 'light': 1, 'moderate': 2, 'strong': 3 },
        'special': { 'light': 1, 'moderate': 2, 'strong': 3 },
        'romantic': { 'light': 2, 'moderate': 3, 'strong': 3 }
      };
      
      // Score products based on preferences
      const scoredProducts = filteredProducts.map(product => {
        let score = 0;
        
        // Featured products get bonus points
        if (product.featured) score += 2;
        
        // In stock products get priority
        if (product.inStock) score += 3;
        
        // Occasion scoring
        if (preferences.occasion && preferences.intensity) {
          const occasionScore = occasionScores[preferences.occasion]?.[preferences.intensity] || 1;
          score += occasionScore;
        }
        
        // Note matching
        if (preferences.favoriteNotes.length > 0 && product.notes) {
          const allNotes = [
            ...(product.notes.top || []),
            ...(product.notes.middle || []),
            ...(product.notes.base || [])
          ];
          const matchingNotes = preferences.favoriteNotes.filter(note =>
            allNotes.some(productNote => 
              productNote.toLowerCase().includes(note.toLowerCase()) ||
              note.toLowerCase().includes(productNote.toLowerCase())
            )
          );
          score += matchingNotes.length * 2;
        }
        
        return { ...product, aiScore: score };
      });
      
      // Sort by score and take top 3
      const topRecommendations = scoredProducts
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 3);
      
      setRecommendations(topRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to sample products
      const sampleProducts = ProductService.getSampleProducts();
      setRecommendations(sampleProducts.slice(0, 3));
    }
    
    setIsAnalyzing(false);
    setStep(3);
  };

  const handleNoteToggle = (note: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteNotes: prev.favoriteNotes.includes(note)
        ? prev.favoriteNotes.filter(n => n !== note)
        : [...prev.favoriteNotes, note]
    }));
  };

  const handlePurchase = (product: Product) => {
    window.open(product.shopierLink, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-charcoal-900">
                  AI Parfüm Danışmanı
                </h2>
                <p className="text-charcoal-600">Size özel parfüm önerileri</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-charcoal-700">
              Adım {step} / 3
            </span>
            <span className="text-sm text-charcoal-500">
              {step === 1 && 'Tercihlerinizi belirleyin'}
              {step === 2 && 'Detayları tamamlayın'}
              {step === 3 && 'Önerileriniz hazır!'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Basic Preferences */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-primary-600" />
                Temel Tercihleriniz
              </h3>
              
              {/* Gender */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-3">
                  Hangi kategoride parfüm arıyorsunuz?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'kadın', label: 'Kadın', icon: '👩' },
                    { value: 'erkek', label: 'Erkek', icon: '👨' },
                    { value: 'unisex', label: 'Unisex', icon: '👥' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPreferences(prev => ({ ...prev, gender: option.value as any }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.gender === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-3">
                  Yaş aralığınız?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['18-25', '26-35', '36-45', '45+'].map(age => (
                    <button
                      key={age}
                      onClick={() => setPreferences(prev => ({ ...prev, age }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        preferences.age === age
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-3">
                  Bütçe aralığınız?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'budget', label: 'Ekonomik', range: '₺200-300', icon: '💰' },
                    { value: 'mid', label: 'Orta Segment', range: '₺300-500', icon: '💎' },
                    { value: 'luxury', label: 'Lüks', range: '₺500+', icon: '👑' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPreferences(prev => ({ ...prev, budget: option.value }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.budget === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.range}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!preferences.gender || !preferences.age || !preferences.budget}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Devam Et
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Detailed Preferences */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <Heart size={20} className="text-primary-600" />
                Detaylı Tercihleriniz
              </h3>

              {/* Occasion */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-3">
                  Parfümü hangi durumlar için kullanacaksınız?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'daily', label: 'Günlük Kullanım', icon: <Sun size={20} /> },
                    { value: 'work', label: 'İş/Ofis', icon: <Calendar size={20} /> },
                    { value: 'evening', label: 'Akşam', icon: <Moon size={20} /> },
                    { value: 'special', label: 'Özel Günler', icon: <Sparkles size={20} /> },
                    { value: 'romantic', label: 'Romantik', icon: <Heart size={20} /> }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPreferences(prev => ({ ...prev, occasion: option.value }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.occasion === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mb-2 flex justify-center">{option.icon}</div>
                      <div className="font-medium text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-3">
                  Parfüm yoğunluğu tercihiniz?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Hafif', desc: 'Günlük kullanım için' },
                    { value: 'moderate', label: 'Orta', desc: 'Dengeli ve kalıcı' },
                    { value: 'strong', label: 'Yoğun', desc: 'Güçlü ve etkileyici' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPreferences(prev => ({ ...prev, intensity: option.value }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.intensity === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-3">
                  Sevdiğiniz koku notları (birden fazla seçebilirsiniz)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    'Gül', 'Yasemin', 'Lavanta', 'Bergamot',
                    'Vanilya', 'Sandal Ağacı', 'Misk', 'Amber',
                    'Limon', 'Karabiber', 'Vetiver', 'Patchouli'
                  ].map(note => (
                    <button
                      key={note}
                      onClick={() => handleNoteToggle(note)}
                      className={`p-2 rounded-lg border transition-all text-sm ${
                        preferences.favoriteNotes.includes(note)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Geri
              </button>
              <button
                onClick={generateRecommendations}
                disabled={!preferences.occasion || !preferences.intensity}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles size={16} />
                Önerileri Oluştur
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Recommendations */}
        {step === 3 && (
          <div className="p-6">
            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Sparkles className="text-primary-600 animate-pulse" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-charcoal-900 mb-2">
                  AI Analiz Yapıyor...
                </h3>
                <p className="text-charcoal-600 mb-4">
                  Tercihlerinize göre en uygun parfümleri buluyoruz
                </p>
                <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Zap className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-2">
                    Size Özel Parfüm Önerileri
                  </h3>
                  <p className="text-charcoal-600">
                    AI analizimize göre size en uygun {recommendations.length} parfüm
                  </p>
                </div>

                <div className="space-y-6">
                  {recommendations.map((product, index) => (
                    <div key={product.id} className="bg-gradient-to-r from-primary-50 to-cream-50 rounded-2xl p-6 border border-primary-100">
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-xl shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            #{index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-xl font-serif font-bold text-charcoal-900 mb-1">
                                {product.name}
                              </h4>
                              <p className="text-primary-600 font-medium">{product.brand}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-charcoal-900">
                                ₺{product.price}
                              </div>
                              {product.originalPrice && (
                                <div className="text-sm text-gray-500 line-through">
                                  ₺{product.originalPrice}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-charcoal-600 mb-4 leading-relaxed">
                            {product.description}
                          </p>
                          
                          {product.notes && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {product.notes.top?.slice(0, 3).map((note, i) => (
                                  <span key={i} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handlePurchase(product)}
                              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300 font-medium flex items-center gap-2 transform hover:scale-105"
                            >
                              <ShoppingBag size={18} />
                              Hemen Satın Al
                            </button>
                            <div className="flex items-center gap-2 text-sm text-charcoal-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Stokta Var
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={handleClose}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationModal;