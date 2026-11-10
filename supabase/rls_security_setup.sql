-- ============================================================================
-- 🔒 Couple Calendar (couple-calendar-new) Supabase 보안 및 RLS 설정 스크립트
-- 실행 위치: Supabase Dashboard -> SQL Editor -> New Query 붙여넣기 후 [Run] 클릭
-- ============================================================================

-- 1. 테이블이 없을 경우 기본 스키마 보장
CREATE TABLE IF NOT EXISTS public.couple_calendar (
  date text PRIMARY KEY,
  hae_shift jsonb,
  dawon_shift jsonb,
  memo text DEFAULT '',
  hae_memo text DEFAULT '',
  dawon_memo text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- 2. [핵심] Row Level Security (RLS) 활성화
-- Supabase의 "RLS Disabled in Public" 보안 경고 메일을 즉시 해결합니다.
ALTER TABLE public.couple_calendar ENABLE ROW LEVEL SECURITY;

-- 3. 파괴적 명령(DELETE / TRUNCATE) 권한 원천 차단
-- 앱은 조회(SELECT)와 저장(INSERT/UPDATE upsert)만 사용하므로,
-- 외부에서 anon 키로 전체 일정을 삭제(DELETE)하지 못하도록 DB 권한 레벨에서 차단합니다.
REVOKE ALL ON public.couple_calendar FROM PUBLIC;
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.couple_calendar FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.couple_calendar TO anon, authenticated;

-- 4. 기존 정책 초기화 (중복 방지)
DROP POLICY IF EXISTS "Enable all access for couple_calendar" ON public.couple_calendar;
DROP POLICY IF EXISTS "Allow public read access" ON public.couple_calendar;
DROP POLICY IF EXISTS "Allow public insert access" ON public.couple_calendar;
DROP POLICY IF EXISTS "Allow public update access" ON public.couple_calendar;
DROP POLICY IF EXISTS "couple_calendar_select_policy" ON public.couple_calendar;
DROP POLICY IF EXISTS "couple_calendar_insert_policy" ON public.couple_calendar;
DROP POLICY IF EXISTS "couple_calendar_update_policy" ON public.couple_calendar;

-- 5. 최소 권한 RLS 정책 생성 (형식 검증 및 데이터 길이 제한 적용)

-- [조회 정책] 유효한 날짜 형식(YYYY-MM-DD) 행만 조회 허용
CREATE POLICY "couple_calendar_select_policy"
ON public.couple_calendar
FOR SELECT
TO anon, authenticated
USING (
  date ~ '^\d{4}-\d{2}-\d{2}$'
);

-- [생성 정책] 유효한 날짜 형식(YYYY-MM-DD) 및 허용된 메모 크기 내에서만 추가 허용
CREATE POLICY "couple_calendar_insert_policy"
ON public.couple_calendar
FOR INSERT
TO anon, authenticated
WITH CHECK (
  date ~ '^\d{4}-\d{2}-\d{2}$'
  AND coalesce(length(memo), 0) <= 50000
  AND coalesce(length(hae_memo), 0) <= 5000
  AND coalesce(length(dawon_memo), 0) <= 5000
);

-- [수정 정책] 유효한 날짜 형식(YYYY-MM-DD) 및 허용된 메모 크기 내에서만 수정(Upsert) 허용
CREATE POLICY "couple_calendar_update_policy"
ON public.couple_calendar
FOR UPDATE
TO anon, authenticated
USING (
  date ~ '^\d{4}-\d{2}-\d{2}$'
)
WITH CHECK (
  date ~ '^\d{4}-\d{2}-\d{2}$'
  AND coalesce(length(memo), 0) <= 50000
  AND coalesce(length(hae_memo), 0) <= 5000
  AND coalesce(length(dawon_memo), 0) <= 5000
);

-- ※ DELETE 정책은 의도적으로 생성하지 않음 (외부 공격에 의한 데이터 삭제 100% 방지)
