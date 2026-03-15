import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductGrid from './ProductGrid';
import { Product } from '../types';
import { supabase } from '../services/supabaseClient';
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

  const categoryId = category || 'all';
  const displayCategoryName = category
    ? categoryNames[category as keyof typeof categoryNames] || category
    : 'Tous les produits';
  const categoryImage = category
    ? categoryImages[category as keyof typeof categoryImages] || ''
    : '';

  // ✅ Requête directe Supabase, sans cache, avec bon filtre
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          id, name, price, original_price, description,
          image, images, category, subcategory,
          colors, sizes, in_stock, is_new, text_direction
        `);

      // ✅ Filtres directs dans Supabase (pas côté client)
      if (categoryId === 'new') {
        query = query.eq('is_new', true);
      } else if (categoryId === 'sale') {
        query = query.not('original_price', 'is', null);
      } else if (categoryId !== 'all') {
        query = query.or(`category.eq.${categoryId},subcategory.eq.${categoryId}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur chargement produits:', error);
        setProducts([]);
        return;
      }

      const mapped: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price,
        description: p.description,
        image: p.image,
        images: p.images || [p.image],
        category: p.category,
        subcategory: p.subcategory,
        colors: p.colors,
        sizes: p.sizes,
        inStock: p.in_stock,
        isNew: p.is_new,
        textDirection: p.text_direction,
      }));

      setProducts(mapped);
    } catch (error) {
      console.error('Erreur:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setProducts([]);
    fetchProducts();
  }, [category]);

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
                {loading ? '...' : `${products.length} produit${products.length > 1 ? 's' : ''}`}
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
          // ✅ Skeleton au lieu de texte
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-neutral-100 animate-pulse rounded-lg" />
                <div className="h-4 bg-neutral-100 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-neutral-100 animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <ProductGrid
            title=""
            products={products}
            loadMore={() => {}}
            hasMore={false}
            loadingMore={false}
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