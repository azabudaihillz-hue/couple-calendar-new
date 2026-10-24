import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔒 Vercel / Expo 환경 변수 로드
// 우선순위: EXPO_PUBLIC_COUPLE_SUPABASE_URL -> EXPO_PUBLIC_SUPABASE_URL
const rawUrl = (
  process.env.EXPO_PUBLIC_COUPLE_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL_ ||
  process.env.SUPABASE_URL ||
  ''
).trim();

// 우선순위: EXPO_PUBLIC_COUPLE_SUPABASE_ANON_KEY -> EXPO_PUBLIC_SUPABASE_ANON_KEY
const rawKey = (
  process.env.EXPO_PUBLIC_COUPLE_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_ ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

// 환경변수가 정상적으로 주입되었는지 검증 (빈 문자열이거나 템플릿 값인 경우 제외)
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('your-project')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] EXPO_PUBLIC_COUPLE_SUPABASE_URL 또는 EXPO_PUBLIC_COUPLE_SUPABASE_ANON_KEY 환경 변수가 누락되었습니다.\n' +
    'Vercel 대시보드(Settings > Environment Variables)에서 Type=Config 로 변수를 등록하고 반드시 Redeploy 하세요.'
  );
}

// ⚠️ 절대 금지: createClient('', '')를 호출하면 런타임 예외로 React 전체가 화이트스크린으로 크래시합니다.
// 환경변수가 온전할 때만 실제 인스턴스를 생성하고, 없으면 안전하게 null을 반환합니다.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;