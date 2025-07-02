import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import SEO from './SEO';

const CollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { getCollectionProducts, loading } = useProducts();
  
  const collectionProducts = getCollectionProducts();

  return (
    <>
      <SEO
        title="Koleksiyonumuz | Numa Parfume"
        description="Özenle seçilmiş parfüm koleksiyonumuz. Benzersiz benzerlik felsefesi ile hazırlanmış premium parfüm çeşitleri."
        keywords="parfüm koleksiyonu, premium parfüm, benzersiz parfüm, parfüm çeşitleri, kaliteli parfüm"
        url="https://numaparfume.com/collection"
        type="website"
      />
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
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="text-primary-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-charcoal-900">
                Koleksiyonumuz
              </h1>
              <p className="text-gray-600">
                Özenle seçilmiş parfüm koleksiyonumuz
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
              <p className="text-gray-600">Koleksiyon yükleniyor...</p>
            </div>
          </div>
        ) : collectionProducts.length > 0 ? (
          <>
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700">
                {collectionProducts.length} adet benzersiz parfüm
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collectionProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Koleksiyon Boş
            </h3>
            <p className="text-gray-600">
              Henüz koleksiyonda parfüm bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CollectionPage; 