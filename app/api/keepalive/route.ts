import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from('councils').select('id').limit(1);

  if (error) {
    return new Response('supabase error: ' + error.message, { status: 500 });
  }
  return new Response('ok', { status: 200 });
};