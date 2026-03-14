export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'jewelry' | 'watches' | 'hijabs' | 'accessories';
  subcategory?: string;
  description: string;
  textDirection?: 'ltr' | 'rtl';
  colors?: string[];
  sizes?: string[];
  inStock: boolean;
  isNew?: boolean;
  images?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  phone: string;
  city: string;
  total: number;
  date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export type Category = {
  id: string;
  name: string;
  image: string;
  productCount?: number;
};
