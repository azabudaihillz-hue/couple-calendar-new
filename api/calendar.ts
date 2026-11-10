export const config = {
  runtime: 'edge',
};

const CYCLE_BASE_DATE = new Date('2026-09-08T00:00:00Z');
const HISTORY_SYNC_DATE = '1970-01-01';
const PROFILE_CONFIG_DATE = '1970-01-02';
const DEFAULT_LEFT_NAME = '좌측';
const DEFAULT_RIGHT_NAME = '우측';

const isCustomName = (val: unknown, defaultVal: string): val is string => {
  return typeof val === 'string' && val.trim().length > 0 && val.trim() !== defaultVal;
};

const LEFT_SHIFTS: Record<string, { label: string; text: string }> = {
  DAY: { label: '데이', text: 'D' },
  SW: { label: '스윙', text: 'S' },
  GY: { label: '야간', text: 'G' },
  OFF: { label: '휴무', text: '휴' },
};

const getCalculatedShift = (dateString: string, baseDate: Date = CYCLE_BASE_DATE) => {
  const target = new Date(dateString + 'T00:00:00Z');
  const diffTime = target.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = ((diffDays % 24) + 24) % 24;

  if (cycleDay < 6) return LEFT_SHIFTS.DAY;
  if (cycleDay < 8) return LEFT_SHIFTS.OFF;
  if (cycleDay < 14) return LEFT_SHIFTS.SW;
  if (cycleDay < 16) return LEFT_SHIFTS.OFF;
  if (cycleDay < 22) return LEFT_SHIFTS.GY;
  return LEFT_SHIFTS.OFF;
};

const escapeICS = (text: string) => {
  if (!text) return '';
  return text.replace(/\\/g, '\\\\').replace(/[;,]/g, '\\$&').replace(/\r?\n/g, '\\n');
};

const escapeSummary = (text: string) => {
  if (!text) return '';
  return text.replace(/\r?\n/g, ' ').replace(/\\/g, '\\\\').replace(/[;,]/g, '\\$&');
};

const isValidSupabaseUrl = (val: string): boolean => {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(val.trim());
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const envSupabaseUrl = (
    process.env.EXPO_PUBLIC_COUPLE_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL_ ||
    process.env.SUPABASE_URL ||
    ''
  ).trim();
  const envSupabaseKey = (
    process.env.EXPO_PUBLIC_COUPLE_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_ ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const querySupabaseUrl = (url.searchParams.get('u') || '').trim();
  const querySupabaseKey = (url.searchParams.get('k') || '').trim();

  // 🔒 SSRF 및 서버 토큰 유출 방지: 서버 환경변수를 최우선 사용하고, 쿼리 파라미터는 유효한 Supabase 도메인일 때만 허용
  const supabaseUrl = isValidSupabaseUrl(envSupabaseUrl)
    ? envSupabaseUrl
    : isValidSupabaseUrl(querySupabaseUrl)
    ? querySupabaseUrl
    : '';
  const supabaseKey = isValidSupabaseUrl(envSupabaseUrl) && envSupabaseKey
    ? envSupabaseKey
    : isValidSupabaseUrl(querySupabaseUrl)
    ? querySupabaseKey
    : '';

  const paramLeft = url.searchParams.get('left')?.trim().slice(0, 12);
  const paramRight = url.searchParams.get('right')?.trim().slice(0, 12);

  let leftName = isCustomName(paramLeft, DEFAULT_LEFT_NAME) ? paramLeft : DEFAULT_LEFT_NAME;
  let rightName = isCustomName(paramRight, DEFAULT_RIGHT_NAME) ? paramRight : DEFAULT_RIGHT_NAME;
  let baseDateObj = CYCLE_BASE_DATE;

  const overridesMap: Record<string, any> = {};

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/couple_calendar?select=*`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          let dbLeftName = '';
          let dbRightName = '';

          rows.forEach((r) => {
            if (r && r.date) {
              if (r.date === PROFILE_CONFIG_DATE) {
                if (isCustomName(r.hae_memo, DEFAULT_LEFT_NAME)) dbLeftName = r.hae_memo.trim();
                if (isCustomName(r.dawon_memo, DEFAULT_RIGHT_NAME)) dbRightName = r.dawon_memo.trim();
                if (r.memo) {
                  try {
                    const cfg = JSON.parse(r.memo);
                    if (isCustomName(cfg.leftName, DEFAULT_LEFT_NAME)) {
                      dbLeftName = cfg.leftName.trim();
                    }
                    if (isCustomName(cfg.rightName, DEFAULT_RIGHT_NAME)) {
                      dbRightName = cfg.rightName.trim();
                    }
                    if (cfg.cycleBaseDate && /^\d{4}-\d{2}-\d{2}$/.test(cfg.cycleBaseDate)) {
                      baseDateObj = new Date(cfg.cycleBaseDate + 'T00:00:00Z');
                    }
                  } catch (e) {}
                }
                return;
              }
              if (r.date === HISTORY_SYNC_DATE) {
                if (!dbLeftName && isCustomName(r.hae_memo, DEFAULT_LEFT_NAME)) {
                  dbLeftName = r.hae_memo.trim();
                }
                if (!dbRightName && isCustomName(r.dawon_memo, DEFAULT_RIGHT_NAME)) {
                  dbRightName = r.dawon_memo.trim();
                }
                return;
              }
              overridesMap[r.date] = r;
            }
          });

          if (dbLeftName) leftName = dbLeftName;
          if (dbRightName) rightName = dbRightName;
        }
      }
    } catch (e) {}
  }

  const now = new Date();
  const startBase = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));
  const events: string[] = [];
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  for (let i = 0; i < 210; i++) {
    const target = new Date(startBase.getTime() + i * 86400000);
    const dateStr = target.toISOString().split('T')[0];
    const row = overridesMap[dateStr] || {};

    const leftShift = row.hae_shift || getCalculatedShift(dateStr, baseDateObj);
    const rightShift = row.dawon_shift || null;
    const memo = (row.memo || '').trim();

    const leftText = `${leftShift.text}${leftShift.ot ? `(+${leftShift.ot})` : ''}`;
    const rightText = rightShift ? `${rightShift.text}${rightShift.ot ? `(+${rightShift.ot})` : ''}` : '-';

    const isDoubleOff = leftShift.id === 'OFF' && rightShift?.id === 'OFF';
    const isDateDay = memo.includes('♥') || memo.includes('데이트');

    let summary = `[${leftName}:${leftText} | ${rightName}:${rightText}]`;
    if (isDateDay) {
      const cleanMemo = escapeSummary(memo.replace('♥', '').trim());
      summary = `❤️데이트 ${cleanMemo ? `(${cleanMemo}) ` : ''}${summary}`;
    } else if (isDoubleOff) {
      summary = `💕겹휴무! ${summary}`;
    } else if (memo) {
      summary = `📝${escapeSummary(memo)} ${summary}`;
    }

    const descLines = [
      `${leftName} 근무: ${leftShift.label}${leftShift.ot ? ` + OT ${leftShift.ot}시간` : ''}`,
      `${rightName} 근무: ${rightShift ? rightShift.label + (rightShift.ot ? ` + OT ${rightShift.ot}시간` : '') : '미입력'}`,
    ];
    if (memo) descLines.push(`공용 메모: ${escapeICS(memo)}`);

    const formattedDate = dateStr.replace(/-/g, '');
    
    events.push(
      [
        'BEGIN:VEVENT',
        `UID:couple-cal-${dateStr}@couplecalendar.vercel.app`,
        `DTSTAMP:${dtStamp}`,
        // ✨ 핵심 변경점: 하루 종일(VALUE=DATE) 대신 시간을 00:00~23:59로 꽉 채워서 아이폰 위젯에 강제 노출!
        `DTSTART;TZID=Asia/Seoul:${formattedDate}T000000`,
        `DTEND;TZID=Asia/Seoul:${formattedDate}T235959`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${descLines.join('\\n')}`,
        'END:VEVENT',
      ].join('\r\n')
    );
  }

  const calendarTitle =
    leftName !== DEFAULT_LEFT_NAME || rightName !== DEFAULT_RIGHT_NAME
      ? `❤️ ${leftName} & ${rightName} 캘린더`
      : '❤️ 우리만의 캘린더';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Couple Shift Calendar//KR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeSummary(calendarTitle)}`,
    'X-WR-TIMEZONE:Asia/Seoul',
    'REFRESH-INTERVAL;VALUE=DURATION:PT5M',
    'X-PUBLISHED-TTL:PT5M',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Seoul',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0900',
    'TZOFFSETTO:+0900',
    'TZNAME:KST',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
