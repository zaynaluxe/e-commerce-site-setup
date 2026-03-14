import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useApp();

  const categories = [
    { name: 'Nouveautés', path: '/category/new' },
    { name: 'Bijoux', path: '/category/jewelry' },
    { name: 'Montres', path: '/category/watches' },
    { name: 'Hijabs', path: '/category/hijabs' },
    { name: 'Accessoires', path: '/category/accessories' },
  ];

  return (
    <>
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white text-center py-2 text-xs tracking-wide">
        Livraison gratuite sur toutes les commandes +500 DH au Maroc
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Left - Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6 text-neutral-800" />
          </button>

          {/* Center - Logo */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
            <div className="text-2xl font-serif tracking-widest text-neutral-900">
              LUXE & CO
            </div>
          </Link>

          {/* Right - Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCartClick}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-neutral-900 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="absolute left-0 top-0 h-full w-80 max-w-[80vw] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <span className="font-serif text-lg">Menu</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.path}>
                    <Link
                      to={cat.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-3 px-4 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-neutral-100">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-neutral-500 hover:text-neutral-900"
                >
                  Contact
                </Link>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-neutral-500 hover:text-neutral-900"
                >
                  À propos
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
