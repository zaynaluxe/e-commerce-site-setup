import { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, CheckCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { cart, cartTotal, updateCartQuantity, removeFromCart, createOrder } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderItems, setOrderItems] = useState<typeof cart>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    ville: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sauvegarder les articles avant de créer la commande
    setOrderItems([...cart]);
    setOrderTotal(cartTotal);
    
    createOrder({
      items: cart,
      customerName: formData.nom,
      phone: formData.telephone,
      city: formData.ville,
      total: cartTotal
    });
    
    setOrderPlaced(true);
    // Le message reste affiché pendant 5 secondes avant de fermer
    setTimeout(() => {
      setOrderPlaced(false);
      setShowForm(false);
      setOrderItems([]);
      onClose();
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Panier ({cart.length})
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {orderPlaced ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex flex-col items-center justify-center p-8 text-center border-b border-neutral-100">
              <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
              <h3 className="text-xl font-medium mb-2">Merci pour votre commande !</h3>
              <p className="text-neutral-500 text-sm mb-4">
                Votre commande a été confirmée avec succès.
              </p>
              <p className="text-neutral-600 text-sm font-medium">
                Notre équipe va vous contacter rapidement pour confirmer les détails de votre commande.
              </p>
              <p className="text-neutral-400 text-xs mt-2">
                Numéro de commande: #{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </p>
            </div>
            
            {/* Afficher les articles commandés */}
            <div className="p-4">
              <h4 className="text-sm font-medium text-neutral-700 mb-3">Articles commandés:</h4>
              <div className="space-y-3">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 bg-neutral-50 p-3 rounded">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2">{item.product.name}</h4>
                      {item.color && (
                        <p className="text-xs text-neutral-500">Couleur: {item.color}</p>
                      )}
                      <p className="text-sm text-neutral-600 mt-1">Qté: {item.quantity} x {item.product.price.toFixed(2)} DH</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between font-medium">
                <span>Total payé:</span>
                <span>{orderTotal.toFixed(2)} DH</span>
              </div>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
            <p className="text-neutral-500">Votre panier est vide</p>
            <button
              onClick={onClose}
              className="mt-4 text-sm underline hover:text-neutral-900"
            >
              Continuer vos achats
            </button>
          </div>
        ) : showForm ? (
          <div className="flex-1 overflow-y-auto p-6">
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-neutral-500 hover:text-neutral-900 mb-6"
            >
              ← Retour au panier
            </button>
            
            <h3 className="text-lg font-medium mb-6">Finaliser la commande</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full border border-neutral-300 px-4 py-3 rounded focus:outline-none focus:border-neutral-900"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="w-full border border-neutral-300 px-4 py-3 rounded focus:outline-none focus:border-neutral-900"
                  placeholder="06 XX XX XX XX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ville *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ville}
                  onChange={(e) => setFormData({...formData, ville: e.target.value})}
                  className="w-full border border-neutral-300 px-4 py-3 rounded focus:outline-none focus:border-neutral-900"
                  placeholder="Casablanca, Rabat, etc."
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 mt-6">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">{cartTotal.toFixed(2)} DH</span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-neutral-900 text-white py-4 text-sm tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  CONFIRMER LA COMMANDE
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.color}`} className="flex gap-4 bg-neutral-50 p-3 rounded">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2">{item.product.name}</h4>
                    {item.color && (
                      <p className="text-xs text-neutral-500 mt-1">Couleur: {item.color}</p>
                    )}
                    <p className="text-sm font-medium mt-2">{item.product.price.toFixed(2)} DH</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-neutral-300 rounded">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-neutral-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-neutral-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Sous-total</span>
                <span>{cartTotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Livraison</span>
                <span>Calculée à la confirmation</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-neutral-100">
                <span>Total</span>
                <span>{cartTotal.toFixed(2)} DH</span>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-neutral-900 text-white py-4 text-sm tracking-widest hover:bg-neutral-800 transition-colors"
              >
                COMMANDER
              </button>
              <button
                onClick={onClose}
                className="w-full text-center text-sm text-neutral-500 hover:text-neutral-900"
              >
                Continuer vos achats
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
