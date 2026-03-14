// ✅ Composant skeleton à utiliser pendant le chargement des produits
// Usage : import ProductSkeleton from './ProductSkeleton';
// Puis dans votre page : if (loadingProducts) return <ProductSkeleton count={6} />;

interface ProductSkeletonProps {
  count?: number;
}

export default function ProductSkeleton({ count = 6 }: ProductSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          {/* Image */}
          <div className="bg-neutral-200 rounded-xl h-64 w-full mb-3" />
          {/* Nom du produit */}
          <div className="bg-neutral-200 rounded h-4 w-3/4 mb-2" />
          {/* Prix */}
          <div className="bg-neutral-200 rounded h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}