import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import ScrollReveal from './ScrollReveal';

const categories = [
  {
    id: 'new',
    name: 'Nouveautés',
    subtitle: '99 PRODUITS',
    cta: 'VOIR LA COLLECTION',
    image: '/nouveautes.jpeg',
    link: '/category/new'
  },
  {
    id: 'sale',
    name: 'Promotions',
    subtitle: '',
    cta: '',
    image: '/promotions.jpeg',
    link: '/category/sale'
  },
  {
    id: 'jewelry',
    name: 'Bijoux',
    subtitle: '',
    cta: '',
    image: '/bijoux.jpeg',
    link: '/category/jewelry'
  },
  {
    id: 'watches',
    name: 'Montres',
    subtitle: '',
    cta: '',
    image: '/montres.jpeg',
    link: '/category/watches'
  },
  {
    id: 'hijabs',
    name: 'Hijabs',
    subtitle: '',
    cta: '',
    image: '/hijabs.jpeg',
    link: '/category/hijabs'
  },
  {
    id: 'accessories',
    name: 'Accessoires',
    subtitle: '',
    cta: '',
    image: '/accessoires.jpeg',
    link: '/category/accessories'
  }
];

export default function CategoryGrid() {
  const { products } = useApp();
  
  const getProductCount = (categoryId: string) => {
    if (categoryId === 'new') return products.filter(p => p.isNew).length;
    if (categoryId === 'sale') return products.filter(p => p.originalPrice).length;
    return products.filter(p => p.category === categoryId).length;
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ScrollReveal animation="fade-up" duration={600}>
        <h2 className="text-center text-lg tracking-widest text-neutral-900 mb-8">
          NOS CATÉGORIES
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((category, index) => (
          <ScrollReveal
            key={category.id}
            animation="fade-up"
            delay={index * 100}
            duration={700}
          >
            <Link
              to={category.link}
              className="category-card group relative aspect-[3/2] overflow-hidden bg-neutral-100"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="category-overlay absolute inset-0 bg-black/20" />
              
              <div className="category-content absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                {category.id === 'new' && (
                  <span className="text-xs tracking-widest mb-2 opacity-90">
                    {getProductCount(category.id)} PRODUITS
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-light tracking-wide mb-2">
                  {category.name}
                </h3>
                {category.cta && (
                  <span className="text-xs tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.cta}
                    <ArrowRight className="category-arrow w-4 h-4" />
                  </span>
                )}
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

