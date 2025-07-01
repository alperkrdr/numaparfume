import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, UserCheck, Users } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { getProductsByCategory, loading } = useProducts();
  
  const categoryProducts = category ? getProductsByCategory(category) : [];

  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'kadın':
        return {
          title: 'Kadın Parfümleri',
          description: 'Feminen ve zarif parfüm koleksiyonu',
          icon: User,
          color: 'text-pink-600',
          bgColor: 'bg-pink-100'
        };
      case 'erkek':
        return {
          title: 'Erkek Parfümleri',
          description: 'Güçlü ve maskülen parfüm koleksiyonu',
          icon: UserCheck,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'unisex':
        return {
          title: 'Unisex Parfümler',
          description: 'Herkes için uygun parfüm koleksiyonu',
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      default:
        return {
          title: 'Parfümler',
          description: 'Parfüm koleksiyonu',
          icon: User,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const categoryInfo = getCategoryInfo(category || '');
  const IconComponent = categoryInfo.icon;

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
            <div className={`w-12 h-12 ${categoryInfo.bgColor} rounded-full flex items-center justify-center`}>
              <IconComponent className={categoryInfo.color} size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-charcoal-900">
                {categoryInfo.title}
              </h1>
              <p className="text-gray-600">
                {categoryInfo.description}
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
              <p className="text-gray-600">Ürünler yükleniyor...</p>
            </div>
          </div>
        ) : categoryProducts.length > 0 ? (
          <>
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700">
                {categoryProducts.length} adet {category} parfümü
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className={`w-16 h-16 ${categoryInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <IconComponent className={categoryInfo.color} size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ürün Bulunamadı
            </h3>
            <p className="text-gray-600">
              Bu kategoride henüz parfüm bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 