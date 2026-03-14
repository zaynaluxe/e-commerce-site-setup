// Fichier : netlify/functions/keep-alive.ts
// Ce fichier est une fonction Netlify qui ping Supabase toutes les 5 minutes
// pour l'empêcher de s'endormir.
//
// ✅ INSTALLATION :
// 1. Créez le dossier "netlify/functions/" à la racine de votre projet
// 2. Placez ce fichier dedans : netlify/functions/keep-alive.ts
// 3. Dans netlify.toml (voir fichier séparé), configurez le cron

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler = async () => {
  try {
    // Requête légère : on récupère juste 1 produit pour réveiller la base
    const { error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) throw error;

    console.log('✅ Supabase keep-alive OK :', new Date().toISOString());

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok', time: new Date().toISOString() })
    };
  } catch (err) {
    console.error('❌ Keep-alive échoué :', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', error: String(err) })
    };
  }
};