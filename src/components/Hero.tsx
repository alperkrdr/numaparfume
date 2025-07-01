import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useSettings } from '../hooks/useSettings';
import AIRecommendationModal from './AIRecommendationModal';

interface HeroProps {}

const Hero: React.FC<HeroProps> = () => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleShowFeatured = () => {
    console.log('🎯 Öne Çıkanlar butonu tıklandı');
    navigate('/featured');
  };

  const handleShowCollection = () => {
    console.log('🎯 Koleksiyonu Keşfet butonu tıklandı');
    navigate('/collection');
  };

  // Admin panelinden ayarlanabilir hero görseli
  const heroImage = settings?.heroImage || 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg';

  return (
    <>
      <section className="relative bg-gradient-to-br from-cream-50 via-white to-primary-50 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left animate-slide-up">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <Sparkles className="text-primary-600 mr-2 animate-float" size={24} />
                <span className="text-primary-600 font-medium">
                  {settings?.siteSlogan || 'Benzersiz Benzerlik'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-charcoal-900 mb-6 leading-tight">
                Eşsiz Kokuların
                <span className="text-primary-600 block">Büyülü Dünyası</span>
              </h1>
              
              <p className="text-lg md:text-xl text-charcoal-600 mb-8 leading-relaxed">
                {settings?.siteDescription || 'Numa Parfume ile kendinizi özel hissedin. Benzersiz benzerlik felsefemizle, doğanın en güzel kokularından ilham alan parfümlerimiz, her anınızı unutulmaz kılar.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={handleShowCollection}
                  className="bg-primary-600 text-white px-8 py-4 rounded-full font-medium hover:bg-primary-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Koleksiyonu Keşfet
                </button>
                <button 
                  onClick={handleShowFeatured}
                  className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-full font-medium hover:bg-primary-600 hover:text-white transition-all duration-300"
                >
                  Öne Çıkanlar
                </button>
              </div>

              {/* AI Recommendation Button */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto lg:mx-0"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Bot size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">AI Parfüm Danışmanı</div>
                    <div className="text-sm opacity-90">Size özel parfüm önerisi alın</div>
                  </div>
                  <Sparkles size={16} className="animate-pulse" />
                </button>
                <p className="text-sm text-charcoal-500 mt-3 text-center lg:text-left">
                  Yapay zeka ile kişiselleştirilmiş parfüm önerileri
                </p>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in">
              <div className="relative z-10">
                <img
                  src={heroImage}
                  alt="Numa Parfume Collection"
                  className="w-full h-96 md:h-[500px] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full opacity-60 animate-float"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cream-200 rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      </section>

      {/* AI Recommendation Modal */}
      <AIRecommendationModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </>
  );
};

export default Hero;