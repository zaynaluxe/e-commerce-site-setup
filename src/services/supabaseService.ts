import { supabase } from "./supabaseClient";
import { Product } from "../types";

// ✅ Cache mémoire (rapide, session courante)
const memoryCache: Record<string, { data: Product[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) { console.error('Erreur upload image:', error); return null; }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erreur uploadImage:', error);
    return null;
  }
}

interface LoadProductsOptions {
  limit?: number;
  offset?: number;
  category?: string;
}

export async function loadProducts(options: LoadProductsOptions = {}): Promise<Product[]> {
  const { limit = 100, offset = 0, category } = options;
  const cacheKey = `products_${category || 'all'}_${offset}`;
  const now = Date.now();

  // ✅ 1. Cache mémoire (le plus rapide)
  if (memoryCache[cacheKey] && now - memoryCache[cacheKey].timestamp < CACHE_TTL) {
    return memoryCache[cacheKey].data;
  }

  // ✅ 2. Cache sessionStorage (survit à la navigation, pas au rechargement de page)
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (now - parsed.timestamp < CACHE_TTL) {
        memoryCache[cacheKey] = parsed;
        return parsed.data;
      }
    }
  } catch (_) {}

  // ✅ 3. Requête Supabase (seulement si pas en cache)
  let query = supabase
    .from("products")
    .select(`
      id, name, price, original_price, description,
      image, images, category, subcategory,
      colors, sizes, in_stock, is_new, text_direction
    `)
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) { console.error('Erreur chargement produits:', error); return []; }

  const products: Product[] = data.map((p: any) => ({
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
    textDirection: p.text_direction
  }));

  const entry = { data: products, timestamp: now };

  // Sauvegarder dans les deux caches
  memoryCache[cacheKey] = entry;
  try { sessionStorage.setItem(cacheKey, JSON.stringify(entry)); } catch (_) {}

  return products;
}

export function invalidateProductsCache(): void {
  // Vider cache mémoire
  Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
  // Vider sessionStorage
  try {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith('products_'))
      .forEach(k => sessionStorage.removeItem(k));
  } catch (_) {}
}

export async function loadOrders(): Promise<any[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order('created_at', { ascending: false });

  if (error) { console.error('Erreur chargement commandes:', error); return []; }

  return data.map((o: any) => ({
    id: o.id,
    customerName: o.customer_name,
    phone: o.customer_phone,
    city: o.customer_city,
    items: o.items,
    total: o.total,
    status: o.status,
    date: o.created_at
  }));
}

export async function addProduct(product: any) {
  const { data, error } = await supabase.from("products").insert([{
    id: product.id,
    name: product.name,
    price: product.price,
    original_price: product.originalPrice,
    description: product.description,
    image: product.image,
    images: product.images,
    category: product.category,
    subcategory: product.subcategory,
    colors: product.colors,
    sizes: product.sizes,
    in_stock: product.inStock,
    is_new: product.isNew,
    text_direction: product.textDirection
  }]);
  if (error) console.error(error);
  invalidateProductsCache();
  return data;
}

export async function createOrder(order: any) {
  const { data, error } = await supabase.from("orders").insert([{
    customer_name: order.customerName,
    customer_phone: order.phone,
    customer_city: order.city,
    items: order.items,
    total: order.total,
    status: 'pending'
  }]);
  if (error) console.error(error);
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) console.error(error);
  invalidateProductsCache();
}

export async function updateProduct(id: string, updates: any) {
  const { data, error } = await supabase.from("products").update({
    name: updates.name,
    price: updates.price,
    original_price: updates.originalPrice,
    description: updates.description,
    image: updates.image,
    images: updates.images,
    category: updates.category,
    subcategory: updates.subcategory,
    colors: updates.colors,
    sizes: updates.sizes,
    in_stock: updates.inStock,
    is_new: updates.isNew,
    text_direction: updates.textDirection
  }).eq("id", id);
  if (error) console.error(error);
  invalidateProductsCache();
  return data;
}