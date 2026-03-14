import { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Product, Order } from '../types';
import ProductForm from './ProductForm';
import AdminDashboard from './AdminDashboard';
import { Package, ShoppingBag, TrendingUp, Plus, Edit, Trash2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

type AdminView = 'dashboard' | 'products' | 'orders';

export default function AdminPanel() {
  const { products, orders, isAdmin, setIsAdmin, deleteProduct, updateOrderStatus, addProduct, updateProduct } = useApp();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!isAdmin) {
      setIsAdmin(true);
    }
  }, [isAdmin, setIsAdmin]);



  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    try {
      console.log('Saving product data:', productData);
      console.log('Description being saved:', productData.description);
      
      if (editingProduct) {
        // Update existing product
        updateProduct(editingProduct.id, productData);
        alert('Produit modifié avec succès!');
      } else {
        // Add new product
        addProduct(productData);
        alert('Produit ajouté avec succès!');
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-light tracking-wider">ADMINISTRATION</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen border-r border-neutral-200 hidden md:block">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'dashboard' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Tableau de bord</span>
            </button>
            <button
              onClick={() => setActiveView('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'products' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Produits</span>
            </button>
            <button
              onClick={() => setActiveView('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'orders' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Commandes</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8">
          {activeView === 'dashboard' && <AdminDashboard />}

          {activeView === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light">Gestion des produits</h2>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un produit</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Produit</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Catégorie</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Prix</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {paginatedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover bg-neutral-100"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                                }}
                              />
                              <div>
                                <p className="font-medium text-neutral-900">{product.name}</p>
                                <p className="text-sm text-neutral-500">{product.subcategory}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium">{product.price.toFixed(2)} DH</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.inStock 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {product.inStock ? 'En stock' : 'Épuisé'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
                    <p className="text-sm text-neutral-600">
                      Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, products.length)} sur {products.length} produits
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium px-3">
                        Page {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light">Gestion des commandes</h2>

              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">N° Commande</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Client</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Total</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Statut</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-neutral-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 font-medium">#{order.id.slice(-8).toUpperCase()}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-neutral-500">{order.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {new Date(order.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 font-medium">{order.total.toFixed(2)} DH</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Confirmer
                              </button>
                            )}
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="text-sm text-purple-600 hover:text-purple-800"
                              >
                                Expédier
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="text-sm text-green-600 hover:text-green-800"
                              >
                                Marquer livrée
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {orders.length === 0 && (
                  <div className="text-center py-12 text-neutral-500">
                    Aucune commande pour le moment
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}
