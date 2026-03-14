import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero-section relative h-[85vh] min-h-[600px] bg-neutral-50">
      {/* Background Image - Bijoux dorés luxe */}
      <div className="absolute inset-0">
        <img
          src="/Necklace.avif"
          alt="Bijoux en acier inoxydable doré - Collection luxe"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Content */}
      <div className="hero-section relative h-full flex flex-col items-center justify-center text-center px-4">
        <div className="hero-content space-y-6">
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl font-light tracking-widest text-white mb-4 drop-shadow-lg">
            L'ÉLÉGANCE INTEMPORELLE
          </h1>
          <p className="hero-subtitle text-lg sm:text-xl text-white/90 mb-8 tracking-wide drop-shadow-md">
            BIJOUX & ACCESSOIRES EN ACIER INOXYDABLE
          </p>
          <Link
            to="/category/new"
            className="hero-button inline-block bg-white text-neutral-900 px-8 py-3 text-sm tracking-widest hover:bg-neutral-100 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
          >
            DÉCOUVRIR LA COLLECTION
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator absolute bottom-8 left-1/2">
        <ChevronDown className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
    </section>
  );
}

