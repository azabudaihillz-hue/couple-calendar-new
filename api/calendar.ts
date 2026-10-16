// api/calendar.ts
// iOS 아이폰 잠금화면 & 기본 캘린더 실시간 구독용 (.ics 피드 생성기)

export const config = {
  runtime: 'edge',
};

const CYCLE_BASE_DATE = new Date('2026-09-08T00:00:00Z');

const HAE_SHIFTS: Record<string, { label: string; text: string }> = {
  DAY: { label: '데이', text: 'D' },
  SW: { label: '스윙', text: 'S' },
  GY: { label: '야간', text: 'G' },
  OFF: { label: '휴무', text: '휴' },
};

const getCalculatedShift = (dateString: string) => {
  const target = new Date(dateString + 'T00:00:00Z');
  const diffTime = target.getTime() - CYCLE_BASE_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = ((diffDays % 24) + 24) % 24;

  if (cycleDay < 6) return HAE_SHIFTS.DAY;
  if (cycleDay < 8) return HAE_SHIFTS.OFF;
  if (cycleDay < 14) return HAE_SHIFTS.SW;
  if (cycleDay < 16) return HAE_SHIFTS.OFF;
  if (cycleDay < 22) return HAE_SHIFTS.GY;
  return HAE_SHIFTS.OFF;
};

const formatICSDate = (dateStr: string) => dateStr.replace(/-/g, '');

const getNextDayICSDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0].replace(/-/g, '');
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const supabaseUrl = url.searchParams.get('u') || process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = url.searchParams.get('k') || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  const overridesMap: Record<string, any> = {};

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/couple_calendar?select=*`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          rows.forEach((r) => {
            if (r && r.date) overridesMap[r.date] = r;
          });
        }
      }
    } catch (e) {
      console.error('Supabase fetch error in ICS:', e);
    }
  }

  const now = new Date();
  const startBase = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));
  const events: string[] = [];
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  for (let i = 0; i < 210; i++) {
    const target = new Date(startBase.getTime() + i * 86400000);
    const dateStr = target.toISOString().split('T')[0];
    const row = overridesMap[dateStr] || {};

    const haeShift = row.hae_shift || getCalculatedShift(dateStr);
    const dawonShift = row.dawon_shift || null;
    const memo = (row.memo || '').trim();

    const haeText = `${haeShift.text}${haeShift.ot ? `(+${haeShift.ot})` : ''}`;
    const dawonText = dawonShift ? `${dawonShift.text}${dawonShift.ot ? `(+${dawonShift.ot})` : ''}` : '-';

    const isDoubleOff = haeShift.id === 'OFF' && dawonShift?.id === 'OFF';
    const isDateDay = memo.includes('♥') || memo.includes('데이트');

    let summary = `[해:${haeText} | 다원:${dawonText}]`;
    if (isDateDay) {
      const cleanMemo = memo.replace('♥', '').trim();
      summary = `❤️데이트 ${cleanMemo ? `(${cleanMemo}) ` : ''}${summary}`;
    } else if (isDoubleOff) {
      summary = `💕겹휴무! ${summary}`;
    } else if (memo) {
      summary = `📝${memo} ${summary}`;
    }

    const descriptionLines = [
      `해 근무: ${haeShift.label}${haeShift.ot ? ` + OT ${haeShift.ot}시간` : ''}`,
      `다원 근무: ${dawonShift ? dawonShift.label + (dawonShift.ot ? ` + OT ${dawonShift.ot}시간` : '') : '미입력'}`,
    ];
    if (memo) descriptionLines.push(`공용 메모: ${memo}`);

    events.push(
      [
        'BEGIN:VEVENT',
        `UID:couple-cal-${dateStr}@couplecalendar.vercel.app`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART;VALUE=DATE:${formatICSDate(dateStr)}`,
        `DTEND;VALUE=DATE:${getNextDayICSDate(dateStr)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${descriptionLines.join('\\n')}`,
        'END:VEVENT',
      ].join('\r\n')
    );
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Couple Shift Calendar//KR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:❤️ 우리만의 캘린더',
    'X-WR-TIMEZONE:Asia/Seoul',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
