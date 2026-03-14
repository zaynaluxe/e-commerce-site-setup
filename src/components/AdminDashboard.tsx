import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useApp } from '../store/AppContext';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-neutral-500'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
             trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-neutral-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { orders, products } = useApp();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    
    // Calcul du panier moyen
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Produits en stock vs épuisés
    const inStockProducts = products.filter(p => p.inStock).length;
    const outOfStockProducts = products.filter(p => !p.inStock).length;
    
    // Commandes par statut
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
    };
    
    // Taux de conversion (simulé)
    const conversionRate = totalOrders > 0 ? 3.5 : 0;
    
    return {
      totalRevenue,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      averageOrderValue,
      inStockProducts,
      outOfStockProducts,
      ordersByStatus,
      conversionRate,
    };
  }, [orders, products]);

  // Ventes par mois (simulation basée sur les commandes existantes)
  const salesByMonth = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthOrders = orders.filter(order => {
        const orderMonth = new Date(order.date).getMonth();
        return orderMonth === index;
      });
      const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
      return { month, revenue, orders: monthOrders.length };
    }).slice(0, currentMonth + 1);
  }, [orders]);

  const maxRevenue = Math.max(...salesByMonth.map(m => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Tableau de Bord</h2>
          <p className="text-neutral-500">Vue d'ensemble de votre boutique</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {p === 'week' ? '7 jours' : p === 'month' ? '30 jours' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.totalRevenue.toFixed(2)} DH`}
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          change="+8.2%"
          trend="up"
          icon={<ShoppingBag className="w-6 h-6 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="Panier moyen"
          value={`${stats.averageOrderValue.toFixed(2)} DH`}
          change="-2.1%"
          trend="down"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          title="Produits en stock"
          value={`${stats.inStockProducts}/${products.length}`}
          icon={<Package className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-medium mb-6">Évolution des ventes</h3>
          <div className="h-64 flex items-end gap-2">
            {salesByMonth.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-xs text-neutral-500">
                    {data.revenue > 0 ? `${(data.revenue / 1000).toFixed(0)}k` : '0'}
                  </span>
                  <div 
                    className="w-full bg-neutral-900 rounded-t-md transition-all duration-500 hover:bg-neutral-700"
                    style={{ 
                      height: `${(data.revenue / maxRevenue) * 200}px`,
                      minHeight: data.revenue > 0 ? '4px' : '0'
                    }}
                  />
                </div>
                <span className="text-xs text-neutral-500">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-medium mb-6">Commandes par statut</h3>
          <div className="space-y-4">
            {[
              { label: 'En attente', value: stats.ordersByStatus.pending, color: 'bg-yellow-500', status: 'pending' },
              { label: 'Confirmées', value: stats.ordersByStatus.confirmed, color: 'bg-blue-500', status: 'confirmed' },
              { label: 'Expédiées', value: stats.ordersByStatus.shipped, color: 'bg-purple-500', status: 'shipped' },
              { label: 'Livrées', value: stats.ordersByStatus.delivered, color: 'bg-green-500', status: 'delivered' },
            ].map((item) => {
              const percentage = stats.totalOrders > 0 
                ? (item.value / stats.totalOrders) * 100 
                : 0;
              
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.value}</span>
                      <span className="text-xs text-neutral-400">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders & Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Dernières commandes</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Commande #{order.id.slice(-6)}</p>
                  <p className="text-xs text-neutral-500">{order.customerName} • {order.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.total.toFixed(2)} DH</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status === 'pending' ? 'En attente' :
                     order.status === 'confirmed' ? 'Confirmée' :
                     order.status === 'shipped' ? 'Expédiée' : 'Livrée'}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-neutral-500 py-4">Aucune commande pour le moment</p>
            )}
          </div>
        </div>

        {/* Stock Alert */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Alertes stock</h3>
          <div className="space-y-3">
            {products.filter(p => !p.inStock).slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-red-600">Rupture de stock</p>
                </div>
                <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                  Réapprovisionner
                </button>
              </div>
            ))}
            {products.filter(p => !p.inStock).length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-neutral-500">Tous les produits sont en stock !</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
