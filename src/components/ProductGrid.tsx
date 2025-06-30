import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  viewTitle: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, viewTitle }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <p className="text-charcoal-600 text-lg">Parfümler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal-900 mb-4">
          {viewTitle}
        </h2>
        <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
        <p className="text-charcoal-600 mt-4 max-w-2xl mx-auto">
          Benzersiz benzerlik felsefemizle, doğanın en güzel kokularından ilham alan parfümlerimizle kendinizi özel hissedin
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-charcoal-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-charcoal-700 mb-2">Ürün bulunamadı</h3>
          <p className="text-charcoal-500">Aradığınız kriterlere uygun parfüm bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;