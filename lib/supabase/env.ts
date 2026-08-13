const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

function requiredPublicVariable(name: keyof typeof publicEnv) {
  const value = publicEnv[name];
  if (!value) {
    throw new Error(`Missing required Supabase configuration: ${name}`);
  }
  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: requiredPublicVariable("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requiredPublicVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
