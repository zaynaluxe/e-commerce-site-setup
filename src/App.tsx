import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import CategoryGrid from './components/CategoryGrid';
import CategoryPage from './components/CategoryPage';
import Cart from './components/Cart';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { ProductDetailPage } from './pages/ProductDetailPage';
import ScrollReveal from './components/ScrollReveal';

import { loadProducts } from './services/supabaseService';
loadProducts({ limit: 100 });

function HomePage() {
  const { getNewArrivals, products } = useApp();
  const newArrivals = getNewArrivals();
  
  const jewelryProducts = products.filter(p => p.category === 'jewelry').slice(0, 4);
  const watchesProducts = products.filter(p => p.category === 'watches').slice(0, 4);

  return (
    <>
      <Hero />
      
      {/* Scroll indicator section */}
      <div className="bg-neutral-50 py-4 flex justify-center">
        <div className="w-12 h-12 flex items-center justify-center scroll-indicator">
          <svg 
            className="w-6 h-6 text-neutral-400 animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductGrid 
          title="NOUVELLES ARRIVÉES" 
          products={newArrivals}
          viewAllLink="/category/new"
        />
      )}

      {/* Jewelry Section */}
      {jewelryProducts.length > 0 && (
        <ProductGrid 
          title="COLLECTION BIJOUX" 
          products={jewelryProducts}
          viewAllLink="/category/jewelry"
        />
      )}

      {/* Watches Section */}
      {watchesProducts.length > 0 && (
        <ProductGrid 
          title="MONTRES DE LUXE" 
          products={watchesProducts}
          viewAllLink="/category/watches"
        />
      )}

      {/* Categories */}
      <CategoryGrid />

      {/* About Section */}
      <ScrollReveal animation="fade-up" duration={800} threshold={0.1}>
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif tracking-widest mb-4">✨ Qui sommes-nous ?</h2>
            <p className="text-neutral-600 leading-relaxed">
              Bienvenue chez <strong>LUXE & CO</strong>, votre destination incontournable pour des accessoires qui allient élégance, raffinement et qualité supérieure. 💎<br />
              Née d'une passion profonde pour le beau et le durable, notre marque a été créée pour toutes les femmes qui méritent le meilleur — sans compromis. 👑
            </p>
          </div>

          <div className="bg-neutral-50 rounded-lg p-6 sm:p-8 mb-8">
            <h3 className="text-lg font-medium mb-4 text-center">💍 Notre univers</h3>
            <p className="text-neutral-600 mb-4">Chez LUXE & CO, nous sélectionnons avec soin chaque pièce de notre collection :</p>
            <ul className="space-y-2 text-neutral-600">
              <li>💍 <strong>Bijoux en acier inoxydable</strong> — Élégants, résistants et intemporels. Nos bijoux ne ternissent jamais et subliment chaque tenue.</li>
              <li>⌚ <strong>Montres élégantes</strong> — Parce que chaque femme mérite une montre qui reflète sa personnalité et son style unique.</li>
              <li>🧕 <strong>Hijabs premium</strong> — Des tissus doux, fluides et raffinés, pour allier modestie et élégance au quotidien.</li>
            </ul>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-lg font-medium mb-3">🌟 Notre engagement</h3>
            <p className="text-neutral-600 leading-relaxed">
              Nous croyons que le luxe doit être accessible, authentique et durable. C'est pourquoi chaque produit est soigneusement sélectionné pour vous offrir le meilleur rapport qualité-prix. 🤍<br />
              Votre satisfaction est notre priorité absolue. Chaque commande est préparée avec amour et attention, pour que vous vous sentiez spéciale dès l'ouverture de votre colis. 📦✨
            </p>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-lg font-medium mb-3">💌 Rejoignez la famille LUXE & CO</h3>
            <p className="text-neutral-600 leading-relaxed">
              Des milliers de femmes au Maroc nous font déjà confiance. Rejoignez notre communauté et laissez-vous séduire par l'élégance à la marocaine. 🇲🇦💛
            </p>
          </div>

          <div className="text-center">
            <p className="italic text-neutral-500">"Le luxe, ce n'est pas une question de prix. C'est une question de qualité, de style et de confiance en soi." — LUXE & CO ✨</p>
          </div>
        </section>
      </ScrollReveal>

      {/* Services Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h4 className="font-medium text-sm mb-1">LIVRAISON AU MAROC</h4>
            <p className="text-sm text-neutral-500">Livraison gratuite sur toutes les commandes +500 DH</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h4 className="font-medium text-sm mb-1">RETOURS</h4>
            <p className="text-sm text-neutral-500">Retours acceptés sous 14 jours</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h4 className="font-medium text-sm mb-1">SERVICE CLIENT</h4>
            <p className="text-sm text-neutral-500">Disponible 7j/7 de 9h à 20h</p>
          </div>
        </div>
      </section>
    </>
  );
}

function ProtectedAdmin() {
  const { isAdmin, setIsAdmin } = useApp();
  
  useEffect(() => {
    const saved = localStorage.getItem('adminAuth');
    if (saved === 'true') {
      setIsAdmin(true);
    }
  }, [setIsAdmin]);
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <AdminPanel />;
}

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedAdmin />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route 
          path="/*" 
          element={
            <>
              <Header onCartClick={() => setIsCartOpen(true)} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
              </Routes>
              <Footer />
              <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;

