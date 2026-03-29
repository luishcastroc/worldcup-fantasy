export const environment = {
  production: true,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  predictionDeadline: import.meta.env.VITE_PREDICTION_DEADLINE ?? '2026-06-11T00:00:00Z',
};
