import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-serif tracking-widest mb-4">LUXE & CO</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Votre destination pour des accessoires de luxe. Bijoux en acier inoxydable, montres élégantes et hijabs premium.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-neutral-600 hover:text-neutral-900">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-600 hover:text-neutral-900">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-sm mb-4">CATÉGORIES</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link to="/category/jewelry" className="hover:text-neutral-900">Bijoux</Link></li>
              <li><Link to="/category/watches" className="hover:text-neutral-900">Montres</Link></li>
              <li><Link to="/category/hijabs" className="hover:text-neutral-900">Hijabs</Link></li>
              <li><Link to="/category/accessories" className="hover:text-neutral-900">Accessoires</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4">INFORMATIONS</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link to="/" className="hover:text-neutral-900">À propos</Link></li>
              <li><Link to="/" className="hover:text-neutral-900">Livraison</Link></li>
              <li><Link to="/" className="hover:text-neutral-900">Retours</Link></li>
              <li><Link to="/" className="hover:text-neutral-900">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-sm mb-4">CONTACT</h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+212 6XX XX XX XX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contact@luxeco.ma</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Casablanca, Maroc</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © 2024 Luxe & Co. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-neutral-500 items-center">
            <Link to="/" className="hover:text-neutral-900">Politique de confidentialité</Link>
            <Link to="/" className="hover:text-neutral-900">Conditions d'utilisation</Link>
            <Link to="/admin/login" className="text-neutral-300 hover:text-neutral-400 text-xs" title="Admin">
              ⚙
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
