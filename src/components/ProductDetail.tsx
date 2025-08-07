import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Package, Star, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import SEO from './SEO';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id && products.length > 0) {
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    // Optional: Show a notification
    alert(`${quantity} adet ${product.name} sepete eklendi!`);
  };

  const handleDirectPurchase = () => {
    if (product && product.externalLink) {
      window.location.href = product.externalLink;
    } else {
      alert('Bu ürün için direkt satın alma linki bulunmuyor.');
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // SEO için Schema.org yapılandırılmış veri
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "image": product.image,
    "sku": product.id,
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": `https://numaparfume.com/product/${product.id}`,
      "priceCurrency": "TRY",
      "price": product.price,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Numa Parfume"
      }
    },
         "aggregateRating": {
       "@type": "AggregateRating",
       "ratingValue": "4.5",
       "ratingCount": "50"
     }
  } : undefined;

  return (
    <>
      {product && (
        <SEO
          title={`${product.name} - ${product.brand} | Numa Parfume`}
          description={`${product.description} ${product.size} ${product.category} parfümü. ${product.price}₺ fiyatıyla Numa Parfume'den online satın alın.`}
          keywords={`${product.name}, ${product.brand}, ${product.category} parfüm, ${product.notes?.top?.join(', ') || ''}, parfüm satın al`}
          image={product.image}
          url={`https://numaparfume.com/product/${product.id}`}
          type="product"
          schema={productSchema}
        />
      )}
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Geri Dön</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    Öne Çıkan
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    %{discountPercentage} İndirim
                  </span>
                )}
                {!product.inStock && (
                  <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Tükendi
                  </span>
                )}
              </div>

              {/* Like Button */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
              >
                <Heart 
                  size={20} 
                  className={`${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                />
              </button>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Category */}
            <div className="flex items-center justify-between">
              <span className="text-primary-600 text-sm font-medium uppercase tracking-wide">
                {product.brand}
              </span>
              <span className="text-gray-500 text-sm capitalize bg-gray-100 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="font-serif font-bold text-3xl text-charcoal-900">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-charcoal-900">
                ₺{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₺{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Size */}
            <div className="flex items-center gap-2">
              <Package size={20} className="text-gray-400" />
              <span className="text-gray-700 font-medium">{product.size}</span>
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Notes */}
            {product.notes && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-charcoal-900">Parfüm Notaları</h3>
                
                {product.notes.top && product.notes.top.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Üst Notalar</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.top.map((note, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.notes.middle && product.notes.middle.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Orta Notalar</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.middle.map((note, index) => (
                        <span key={index} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.notes.base && product.notes.base.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Alt Notalar</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.base.map((note, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Adet:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  Sepete Ekle
                </button>

                <button
                  onClick={handleDirectPurchase}
                  disabled={!product.inStock}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hemen Satın Al
                </button>
              </div>

              {/* Stock Status */}
              <div className="text-center">
                {product.inStock ? (
                  <span className="text-green-600 text-sm">✅ Stokta mevcut</span>
                ) : (
                  <span className="text-red-600 text-sm">❌ Stokta yok</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProductDetail; 