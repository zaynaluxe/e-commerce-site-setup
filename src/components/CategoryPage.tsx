import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductGrid from './ProductGrid';
import { Product } from '../types';
import { loadProducts } from '../services/supabaseService';
import ScrollReveal from './ScrollReveal';

const categoryNames: Record<string, string> = {
  new: 'Nouveautés',
  jewelry: 'Bijoux',
  watches: 'Montres',
  hijabs: 'Hijabs',
  accessories: 'Accessoires',
  sale: 'Promotions',
};

const categoryImages: Record<string, string> = {
  new: '/nouveautes.jpeg',
  jewelry: '/bijoux.jpeg',
  watches: '/montres.jpeg',
  hijabs: '/hijabs.jpeg',
  accessories: '/accessoires.jpeg',
  sale: '/promotions.jpeg',
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 16;

  const categoryId = category || 'all';
  const displayCategoryName = category ? categoryNames[category as keyof typeof categoryNames] || category : 'Tous les produits';
  const categoryImage = category ? categoryImages[category as keyof typeof categoryImages] || '' : '';

  const fetchProducts = useCallback(async (append = false) => {
    try {
      const opts = { 
        limit, 
        offset: append ? offset : 0, 
        category: categoryId === 'all' ? undefined : categoryId 
      };
      if (categoryId === 'new') {
        opts.category = undefined; // fetch all and filter client for is_new
      } else if (categoryId === 'sale') {
        opts.category = undefined; // fetch all and filter client for originalPrice
      }
      
      const newProducts = await loadProducts(opts);
      
      setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
      setOffset(append ? offset + limit : limit);
      setHasMore(newProducts.length === limit);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoryId, offset, limit]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchProducts(true);
  };

  // Initial load
  useEffect(() => {
    window.scrollTo(0, 0);
    setProducts([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);
    fetchProducts(false);
  }, [category]);

  // Sale/new filter client-side if needed
  const displayProducts = React.useMemo(() => {
    if (!category || products.length === 0) return products;
    
    if (category === 'new') {
      return products.filter(p => p.isNew);
    }
    if (category === 'sale') {
      return products.filter(p => p.originalPrice);
    }
    return products;
  }, [products, category]);

  return (
    <div className="min-h-screen bg-white">
      {/* Category Hero */}
      {categoryImage && (
        <div className="relative h-[35vh] min-h-[250px] max-h-[350px]">
          <img src={categoryImage} alt={displayCategoryName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <ScrollReveal animation="fade-up" duration={600}>
              <h1 className="text-3xl sm:text-4xl font-light tracking-widest mb-2">
                {displayCategoryName.toUpperCase()}
              </h1>
              <p className="text-sm tracking-widest opacity-90">
                {displayProducts.length} produit{displayProducts.length > 1 ? 's' : ''}
              </p>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour
        </Link>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">Chargement des produits...</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <ProductGrid
            title=""
            products={displayProducts}
            loadMore={loadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500">Aucun produit disponible dans cette catégorie</p>
            <Link to="/" className="inline-block mt-4 text-neutral-900 underline">
              Retour à l'accueil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

