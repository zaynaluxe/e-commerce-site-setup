import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../store/AppContext';
import ScrollReveal from './ScrollReveal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useApp();
  
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : product.image;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      product,
      quantity: 1,
      color: selectedColor,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <ScrollReveal 
      animation="fade-up" 
      delay={index * 100} 
      duration={700}
    >
      <div 
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          
          {/* Sale Badge */}
          {product.originalPrice && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white px-2 py-1 text-[10px] font-semibold tracking-wider">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            </div>
          )}
          
          {/* New Badge */}
          {product.isNew && (
            <div className="absolute top-3 left-3" style={{ marginLeft: product.originalPrice ? '50px' : '0' }}>
              <span className="bg-neutral-900 text-white px-2 py-1 text-[10px] font-semibold tracking-wider">
                NEW
              </span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:scale-110"
          >
            <Heart className="w-4 h-4 text-neutral-700" strokeWidth={1.5} />
          </button>
          
          {/* Out of Stock */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-neutral-900 text-white px-6 py-2 text-xs font-medium tracking-widest">
                OUT OF STOCK
              </span>
            </div>
          )}

          {/* Quick View & Add to Cart Overlay */}
          {product.inStock && (
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-20 pb-4 px-3 transition-all duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="flex flex-col gap-2">
                <Link
                  to={`/product/${product.id}`}
                  className="w-full bg-white/95 backdrop-blur-sm py-2.5 text-center text-xs font-medium text-neutral-900 tracking-wider hover:bg-white hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  QUICK VIEW
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-neutral-900 text-white py-2.5 text-xs font-medium tracking-wider hover:bg-neutral-800 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      ADDED TO CART
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      ADD TO CART
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-normal text-neutral-900 line-clamp-2 leading-relaxed group-hover:text-neutral-600 transition-colors duration-300">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-neutral-900">
              {product.price.toFixed(2)} DH
            </span>
            {product.originalPrice && (
              <span className="text-sm text-neutral-400 line-through">
                {product.originalPrice.toFixed(2)} DH
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {product.colors.slice(0, 5).map((color) => (
                <button
                  key={color}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(color);
                  }}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    selectedColor === color 
                      ? 'ring-1.5 ring-neutral-900 ring-offset-1.5 scale-125' 
                      : 'hover:scale-110 ring-1 ring-neutral-200'
                  }`}
                  style={{
                    backgroundColor: 
                      color.toLowerCase() === 'blanc' ? '#f8f8f8' :
                      color.toLowerCase() === 'noir' ? '#1a1a1a' :
                      color.toLowerCase() === 'beige' ? '#d4c4a8' :
                      color.toLowerCase() === 'gris' ? '#9ca3af' :
                      color.toLowerCase() === 'marron' ? '#8b4513' :
                      color.toLowerCase() === 'bleu' ? '#3b82f6' :
                      color.toLowerCase() === 'rose' ? '#f472b6' :
                      color.toLowerCase() === 'rouge' ? '#dc2626' :
                      color.toLowerCase() === 'or' ? '#d4af37' :
                      color.toLowerCase() === 'argent' ? '#c0c0c0' :
                      color.toLowerCase() === 'or rose' ? '#e8b4b8' :
                      '#d1d5db'
                  }}
                  title={color}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-neutral-400 ml-1">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

