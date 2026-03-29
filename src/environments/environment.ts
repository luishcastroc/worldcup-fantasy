export const environment = {
  production: false,
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL ?? '').trim(),
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim(),
  predictionDeadline: (import.meta.env.VITE_PREDICTION_DEADLINE ?? '2026-06-11T00:00:00Z').trim(),
};
