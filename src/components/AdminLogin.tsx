import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

const ADMIN_CODE = 'admin123';

export default function AdminLogin() {
  const [code, setCode] = useState('');
  const { setIsAdmin } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === ADMIN_CODE) {
      setIsAdmin(true);
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard');
    } else {
      alert('Code incorrect ! Le code est: admin123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-serif">S</span>
          </div>
          <h1 className="text-2xl font-serif mb-2">Administration</h1>
          <p className="text-sm text-neutral-500">Accès réservé - Entrez le code secret</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Code d'accès</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-center text-lg tracking-widest"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-neutral-800 transition-colors font-medium"
          >
            Accéder au panneau
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-neutral-500 hover:text-black transition-colors"
          >
            ← Retour au site
          </button>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 text-center">
            💡 Code par défaut: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
