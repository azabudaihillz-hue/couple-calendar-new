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

const escapeICS = (text: string) => {
  if (!text) return '';
  return text.replace(/\\/g, '\\\\').replace(/[;,]/g, '\\$&').replace(/\r?\n/g, '\\n');
};

const escapeSummary = (text: string) => {
  if (!text) return '';
  return text.replace(/\r?\n/g, ' ').replace(/\\/g, '\\\\').replace(/[;,]/g, '\\$&');
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const supabaseUrl = url.searchParams.get('u') || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = url.searchParams.get('k') || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  const overridesMap: Record<string, any> = {};

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/couple_calendar?select=*`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          rows.forEach((r) => { if (r && r.date) overridesMap[r.date] = r; });
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

    const haeShift = row.hae_shift || getCalculatedShift(dateStr);
    const dawonShift = row.dawon_shift || null;
    const memo = (row.memo || '').trim();

    const haeText = `${haeShift.text}${haeShift.ot ? `(+${haeShift.ot})` : ''}`;
    const dawonText = dawonShift ? `${dawonShift.text}${dawonShift.ot ? `(+${dawonShift.ot})` : ''}` : '-';

    const isDoubleOff = haeShift.id === 'OFF' && dawonShift?.id === 'OFF';
    const isDateDay = memo.includes('♥') || memo.includes('데이트');

    let summary = `[해:${haeText} | 다원:${dawonText}]`;
    if (isDateDay) {
      const cleanMemo = escapeSummary(memo.replace('♥', '').trim());
      summary = `❤️데이트 ${cleanMemo ? `(${cleanMemo}) ` : ''}${summary}`;
    } else if (isDoubleOff) {
      summary = `💕겹휴무! ${summary}`;
    } else if (memo) {
      summary = `📝${escapeSummary(memo)} ${summary}`;
    }

    const descLines = [
      `해 근무: ${haeShift.label}${haeShift.ot ? ` + OT ${haeShift.ot}시간` : ''}`,
      `다원 근무: ${dawonShift ? dawonShift.label + (dawonShift.ot ? ` + OT ${dawonShift.ot}시간` : '') : '미입력'}`,
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

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Couple Shift Calendar//KR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:❤️ 우리만의 캘린더',
    'X-WR-TIMEZONE:Asia/Seoul',
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
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
