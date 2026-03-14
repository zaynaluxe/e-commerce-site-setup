import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  loadProducts,
  loadOrders,
  addProduct as saveToSupabase,
  createOrder as saveOrderToSupabase,
  deleteProduct as deleteFromSupabase,
  updateProduct as updateProductInSupabase,
  invalidateProductsCache
} from '../services/supabaseService';

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isAdmin: boolean;
  direction: 'ltr' | 'rtl';
  loadingProducts: boolean;
  loadingOrders: boolean;
  setIsAdmin: (value: boolean) => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getProductsByCategory: (category: string) => Product[];
  getNewArrivals: () => Product[];
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // ✅ Charger les produits depuis Supabase avec état de chargement
  useEffect(() => {
    setLoadingProducts(true);
    loadProducts({ limit: 100 })
      .then(data => { if (data) setProducts(data); })
      .finally(() => setLoadingProducts(false));
  }, []);

  // ✅ Panier en mémoire (se réinitialise au rechargement — normal pour un panier)
  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ Commandes chargées depuis Supabase avec état de chargement
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setLoadingOrders(true);
    loadOrders()
      .then(data => { if (data) setOrders(data); })
      .finally(() => setLoadingOrders(false));
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Direction conservée dans localStorage (données légères, aucun risque)
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(() => {
    try { return (localStorage.getItem('direction') as 'ltr' | 'rtl') || 'ltr'; }
    catch { return 'ltr'; }
  });

  useEffect(() => {
    try { localStorage.setItem('direction', direction); } catch (_) {}
    document.documentElement.dir = direction;
    document.documentElement.lang = direction === 'rtl' ? 'ar' : 'fr';
  }, [direction]);

  const addProduct = async (product: Partial<Product>) => {
    const images = product.images && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);

    const newProduct: Product = {
      id: uuidv4(),
      name: product.name || 'Produit sans nom',
      price: product.price || 0,
      category: product.category || 'jewelry',
      subcategory: product.subcategory,
      description: product.description || '',
      textDirection: product.textDirection || 'ltr',
      image: images[0] || '',
      images,
      colors: product.colors,
      sizes: product.sizes,
      inStock: product.inStock !== undefined ? product.inStock : true,
      isNew: product.isNew || false,
      originalPrice: product.originalPrice
    };

    // Mise à jour optimiste (affichage immédiat)
    setProducts(prev => [...prev, newProduct]);
    await saveToSupabase(newProduct);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        if (updates.images && updates.images.length > 0 && !updates.image) {
          updates.image = updates.images[0];
        }
        const updated = { ...p, ...updates };
        updateProductInSupabase(id, updated);
        return updated;
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteFromSupabase(id);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i =>
        i.product.id === item.product.id &&
        i.color === item.color &&
        i.size === item.size
      );
      if (existing) {
        return prev.map(i =>
          i.product.id === item.product.id && i.color === item.color && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setCart([]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const order: Order = {
      ...orderData,
      id: uuidv4(),
      date: new Date().toISOString(),
      status: 'pending'
    };
    setOrders(prev => [order, ...prev]);
    await saveOrderToSupabase(orderData);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const getProductsByCategory = (category: string) => {
    if (category === 'all') return products;
    return products.filter(p => p.category === category || p.subcategory === category);
  };

  const getNewArrivals = () => products.filter(p => p.isNew);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider value={{
      products, cart, orders, isAdmin, direction,
      loadingProducts, loadingOrders,
      setIsAdmin, setDirection,
      addProduct, updateProduct, deleteProduct,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      createOrder, updateOrderStatus,
      getProductsByCategory, getNewArrivals,
      cartTotal, cartCount
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}