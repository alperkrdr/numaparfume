import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';

const FeaturedPage: React.FC = () => {
  const navigate = useNavigate();
  const { getFeaturedProducts, loading } = useProducts();
  
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Ana Sayfaya Dön</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="text-yellow-600" size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-charcoal-900">
                Öne Çıkan Parfümler
              </h1>
              <p className="text-gray-600">
                En popüler ve beğenilen parfümlerimiz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Öne çıkan ürünler yükleniyor...</p>
            </div>
          </div>
        ) : featuredProducts.length > 0 ? (
          <>
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700">
                {featuredProducts.length} adet öne çıkan parfüm
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Öne Çıkan Ürün Yok
            </h3>
            <p className="text-gray-600">
              Henüz öne çıkan parfüm bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedPage; 