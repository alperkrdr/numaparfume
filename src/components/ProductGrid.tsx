import React, { useState, useMemo, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error?: string | null;
  viewTitle: string;
}

const PRODUCTS_PER_PAGE = 12;

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, error, viewTitle }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when products change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = products.slice(startIndex, endIndex);

    return {
      totalProducts,
      totalPages,
      currentProducts,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [products, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePrevPage = useCallback(() => {
    if (paginationData.hasPrevPage) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, paginationData.hasPrevPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, paginationData.hasNextPage, handlePageChange]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-red-600 font-bold text-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!products || !Array.isArray(products)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-red-600 font-bold text-lg">
          Ürünler yüklenemedi. Lütfen sayfayı yenileyin.
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
        
        {/* Product Count */}
        {paginationData.totalProducts > 0 && (
          <div className="mt-6 text-sm text-gray-600">
            {paginationData.totalProducts} ürün bulundu
            {paginationData.totalPages > 1 && (
              <span className="ml-2">
                (Sayfa {currentPage} / {paginationData.totalPages})
              </span>
            )}
          </div>
        )}
      </div>

      {paginationData.totalProducts === 0 ? (
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
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
            {paginationData.currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={!paginationData.hasPrevPage}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="mr-1" />
                Önceki
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and adjacent pages
                    return page === 1 || 
                           page === paginationData.totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if needed
                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-3 py-2 text-sm text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={!paginationData.hasNextPage}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sonraki
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ProductGrid;