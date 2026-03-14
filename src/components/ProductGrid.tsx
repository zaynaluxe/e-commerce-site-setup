import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Product } from '../types';
import ScrollReveal from './ScrollReveal';

interface ProductGridProps {
  title: string;
  products: Product[];
  showViewAll?: boolean;
  viewAllLink?: string;
  loadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export default function ProductGrid({ 
  title, 
  products, 
  showViewAll = true, 
  viewAllLink = '/', 
  loadMore,
  hasMore = false,
  loadingMore = false
}: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xl sm:text-2xl tracking-[0.25em] text-neutral-900 font-light">
            {title}
          </h2>
          {showViewAll && products.length > 4 && (
            <Link
              to={viewAllLink}
              className="text-xs tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors duration-300 flex items-center gap-2 group"
            >
              VIEW ALL
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          )}
        </div>
      </ScrollReveal>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {(hasMore || loadingMore) && loadMore && (
        <ScrollReveal animation="fade-up" delay={200} duration={600}>
          <div className="text-center mt-16">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-block border border-neutral-300 text-neutral-900 px-10 py-3 text-xs tracking-[0.2em] hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 disabled:opacity-50"
            >
              {loadingMore ? 'CHARGEMENT...' : 'CHARGER PLUS'}
            </button>
          </div>
        </ScrollReveal>
      )}
    </section>
  );
}

