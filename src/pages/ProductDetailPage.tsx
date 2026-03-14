import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, CartItem } from '../types';
import { useApp } from '../store/AppContext';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, ShoppingBag, Heart, Share2, Minus, Plus, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES: Record<string, { name: string; color: string }> = {
  jewelry: { name: 'Bijoux', color: 'bg-amber-100 text-amber-800' },
  watches: { name: 'Montres', color: 'bg-blue-100 text-blue-800' },
  hijabs: { name: 'Hijabs', color: 'bg-purple-100 text-purple-800' },
  accessories: { name: 'Accessoires', color: 'bg-rose-100 text-rose-800' },
};

const hasHtmlContent = (text: string): boolean => {
  if (!text) return false;
  return /<(?=.*? )(?!(?:p|br|strong|b|em|i|u|h[1-6]|ul|ol|li|a|img|span|div)\b)[a-z]+[^>]*>/i.test(text) ||
         /<img/i.test(text) ||
         /<a\s/i.test(text);
};

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cart, cartTotal, createOrder } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    city: '',
    quantity: 1
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const productImages = product?.images && product.images.length > 0
    ? product.images
    : [product?.image].filter(Boolean) as string[];

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedImage < productImages.length - 1) {
      setSelectedImage(prev => prev + 1);
    } else if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && selectedImage > 0) {
      setSelectedImage(prev => prev - 1);
    } else if (e.key === 'ArrowRight' && selectedImage < productImages.length - 1) {
      setSelectedImage(prev => prev + 1);
    }
  };

  const goToPreviousImage = () => {
    if (selectedImage > 0) setSelectedImage(prev => prev - 1);
  };

  const goToNextImage = () => {
    if (selectedImage < productImages.length - 1) setSelectedImage(prev => prev + 1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.log('Product not found for id:', id);
        setIsLoading(false);
        return;
      }

      const foundProduct: Product = {
        id: data.id,
        name: data.name,
        price: data.price,
        originalPrice: data.original_price,
        description: data.description,
        image: data.image,
        images: data.images || [data.image],
        category: data.category,
        subcategory: data.subcategory,
        colors: data.colors,
        sizes: data.sizes,
        inStock: data.in_stock,
        isNew: data.is_new,
        textDirection: data.text_direction
      };

      setProduct(foundProduct);

      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4);

      if (related) {
        setRelatedProducts(related.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          images: p.images || [p.image],
          category: p.category,
          inStock: p.in_stock,
          isNew: p.is_new
        })));
      }
    } catch (e) {
      console.error('Error loading product:', e);
    }
    setIsLoading(false);
  };

  const handleAddToCart = () => {
    if (product) {
      const cartItem: CartItem = {
        product,
        quantity,
        color: product.colors?.[0],
        size: product.sizes?.[0]
      };
      addToCart(cartItem);
      alert(`${quantity} x ${product.name} ajouté(s) au panier !`);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) setQuantity(newQuantity);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!orderForm.name || !orderForm.phone || !orderForm.city) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const orderItem: CartItem = {
      product,
      quantity: orderForm.quantity,
      color: product.colors?.[0],
      size: product.sizes?.[0]
    };

    createOrder({
      items: [orderItem],
      customerName: orderForm.name,
      phone: orderForm.phone,
      city: orderForm.city,
      total: product.price * orderForm.quantity
    });

    setOrderSubmitted(true);
    setOrderForm({ name: '', phone: '', city: '', quantity: 1 });
    setTimeout(() => setOrderSubmitted(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="pt-20 pb-16 px-4">
          <div className="animate-pulse max-w-7xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="pt-20 pb-16 px-4 text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Produit non trouvé</h1>
          <p className="text-gray-600 mb-8">Le produit que vous recherchez n'existe pas.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORIES[product.category] || { name: product.category, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div
                className="aspect-square bg-white rounded-sm overflow-hidden relative"
                ref={imageContainerRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onKeyDown={handleKeyDown}
                tabIndex={0}
              >
                <img
                  src={productImages[selectedImage] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600/f5f5f5/666?text=Image';
                  }}
                />
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.preventDefault(); goToPreviousImage(); }}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors ${selectedImage === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      disabled={selectedImage === 0}
                    >
                      <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); goToNextImage(); }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors ${selectedImage === productImages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      disabled={selectedImage === productImages.length - 1}
                    >
                      <ChevronRight size={24} className="text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex justify-center gap-2">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        selectedImage === idx ? 'bg-stone-900 scale-110' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Détails */}
            <div className="space-y-6">
              <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase ${categoryInfo.color}`}>
                {categoryInfo.name}
              </span>

              <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-stone-900 tracking-tight">
                  {product.price.toLocaleString('fr-FR')} DH
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {product.originalPrice.toLocaleString('fr-FR')} DH
                  </span>
                )}
                {!product.inStock && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm">Rupture de stock</span>
                )}
              </div>

              {product.originalPrice && product.originalPrice > product.price && (
                <div className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full">
                  Économie de {(product.originalPrice - product.price).toLocaleString('fr-FR')} DH
                </div>
              )}

              <div className="h-px bg-gray-200"></div>

              {/* Formulaire commande */}
              <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg border border-neutral-100">
                <h3 className="text-xl font-semibold text-neutral-900 mb-5 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Commander maintenant
                </h3>

                {!orderSubmitted ? (
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">Nom complet</label>
                      <input
                        type="text"
                        value={orderForm.name}
                        onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all bg-neutral-50"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all bg-neutral-50"
                        placeholder="Votre numéro de téléphone"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">Ville</label>
                      <input
                        type="text"
                        value={orderForm.city}
                        onChange={(e) => setOrderForm({...orderForm, city: e.target.value})}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all bg-neutral-50"
                        placeholder="Votre ville de livraison"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">Quantité</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(-1)}
                          className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={orderForm.quantity}
                          onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value) || 1})}
                          className="w-20 px-3 py-3 text-center border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all bg-neutral-50"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(1)}
                          className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!product.inStock}
                        className="w-full px-6 py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white hover:from-neutral-800 hover:to-neutral-700 disabled:from-neutral-300 disabled:to-neutral-200 disabled:cursor-not-allowed transition-all font-semibold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Commander - {(product.price * orderForm.quantity).toLocaleString('fr-FR')} DH
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-green-600 font-semibold text-lg mb-2">Commande passée avec succès!</div>
                    <p className="text-neutral-500">Nous vous contacterons bientôt pour la confirmation.</p>
                  </div>
                )}
              </div>

              {/* Boutons panier */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-stone-900 text-white hover:bg-stone-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingBag size={20} />
                  <span className="uppercase tracking-wider text-sm font-medium">
                    {!product.inStock ? 'Épuisé' : 'Ajouter au panier'}
                  </span>
                </button>
              </div>

              <div className="pt-4" dir={product.textDirection || 'ltr'}>
                {hasHtmlContent(product.description) ? (
                  <div
                    className="description-content text-gray-600 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-normal">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Avantages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={20} className="text-stone-900" />
                  <span>Livraison gratuite<br/>+200 DH</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={20} className="text-stone-900" />
                  <span>Produit authentique<br/>Garanti</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RefreshCw size={20} className="text-stone-900" />
                  <span>Retour gratuit<br/>14 jours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Produits similaires */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-light text-center text-gray-900 mb-2 uppercase tracking-wider">
                Vous pourriez aimer
              </h2>
              <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-12"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:underline">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {relatedProduct.price.toLocaleString('fr-FR')} DH
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}