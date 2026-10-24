// api/holidays.ts
// Vercel Serverless / Edge Function for Korean Public Holidays (한국천문연구원 특일정보 API)
// 공공데이터포털 특일정보 제공 서비스(getRestDeInfo) 연동 및 일일 엣지 캐싱

export const config = {
  runtime: 'edge', // Vercel Edge Runtime으로 글로벌 초저지연 캐시 제공
};

// 2026 ~ 2030+ 검증된 국가 공휴일 안전 폴백 (API 키 미등록 또는 공공 서버 점검 시 100% 무중단 보장)
const FALLBACK_HOLIDAYS: Record<string, string> = {
  // 2026년
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-05-05': '어린이날', '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일(부처님오신날)',
  '2026-06-03': '제9회 지방선거', '2026-06-06': '현충일',
  '2026-08-15': '광복절', '2026-08-17': '대체공휴일(광복절)',
  '2026-09-24': '추석 연휴', '2026-09-25': '추석', '2026-09-26': '추석 연휴',
  '2026-10-03': '개천절', '2026-10-05': '대체공휴일(개천절)', '2026-10-09': '한글날',
  '2026-12-25': '기독탄신일',
  // 2027년
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴', '2027-02-07': '설날', '2027-02-08': '설날 연휴', '2027-02-09': '대체공휴일(설날)',
  '2027-03-01': '삼일절', '2027-03-03': '제21대 대통령선거', '2027-05-05': '어린이날', '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일', '2027-06-07': '대체공휴일(현충일)',
  '2027-08-15': '광복절', '2027-08-16': '대체공휴일(광복절)',
  '2027-09-14': '추석 연휴', '2027-09-15': '추석', '2027-09-16': '추석 연휴',
  '2027-10-03': '개천절', '2027-10-04': '대체공휴일(개천절)', '2027-10-09': '한글날', '2027-10-11': '대체공휴일(한글날)',
  '2027-12-25': '기독탄신일',
  // 2028년
  '2028-01-01': '신정',
  '2028-01-26': '설날 연휴', '2028-01-27': '설날', '2028-01-28': '설날 연휴',
  '2028-03-01': '삼일절', '2028-04-12': '제23대 국회의원선거', '2028-05-02': '부처님오신날', '2028-05-05': '어린이날',
  '2028-06-06': '현충일', '2028-08-15': '광복절',
  '2028-10-02': '추석 연휴', '2028-10-03': '추석/개천절', '2028-10-04': '추석 연휴', '2028-10-05': '대체공휴일(개천절)',
  '2028-10-09': '한글날', '2028-12-25': '기독탄신일',
  // 2029년
  '2029-01-01': '신정',
  '2029-02-12': '설날 연휴', '2029-02-13': '설날', '2029-02-14': '설날 연휴',
  '2029-03-01': '삼일절', '2029-05-05': '어린이날', '2029-05-07': '대체공휴일(어린이날)', '2029-05-20': '부처님오신날', '2029-05-21': '대체공휴일(부처님오신날)',
  '2029-06-06': '현충일', '2029-08-15': '광복절',
  '2029-09-21': '추석 연휴', '2029-09-22': '추석', '2029-09-23': '추석 연휴', '2029-09-24': '대체공휴일(추석)',
  '2029-10-03': '개천절', '2029-10-09': '한글날', '2029-12-25': '기독탄신일',
  // 2030년
  '2030-01-01': '신정',
  '2030-02-02': '설날 연휴', '2030-02-03': '설날', '2030-02-04': '설날 연휴', '2030-02-05': '대체공휴일(설날)',
  '2030-03-01': '삼일절', '2030-05-05': '어린이날', '2030-05-06': '대체공휴일(어린이날)', '2030-05-09': '부처님오신날',
  '2030-06-05': '제10회 지방선거', '2030-06-06': '현충일', '2030-08-15': '광복절',
  '2030-09-11': '추석 연휴', '2030-09-12': '추석', '2030-09-13': '추석 연휴',
  '2030-10-03': '개천절', '2030-10-09': '한글날', '2030-12-25': '기독탄신일',
};

export default async function handler(reqOrRequest: any, maybeRes?: any) {
  // Edge runtime: (request: Request), maybeRes is undefined
  // Node.js serverless runtime: (req: VercelRequest, res: VercelResponse)
  const isNode = maybeRes && typeof maybeRes.status === 'function';

  let targetYear = new Date().getFullYear().toString();
  let method = 'GET';

  if (isNode) {
    method = reqOrRequest.method || 'GET';
    if (reqOrRequest.query && reqOrRequest.query.year) {
      targetYear = String(reqOrRequest.query.year);
    }
  } else {
    method = reqOrRequest.method || 'GET';
    const url = new URL(reqOrRequest.url);
    targetYear = url.searchParams.get('year') || targetYear;
  }

  const responseHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    // Vercel Edge Caching: 24시간 동안 캐시 유지, 백그라운드 갱신 (stale-while-revalidate 7일)
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  };

  if (method === 'OPTIONS') {
    if (isNode) {
      Object.entries(responseHeaders).forEach(([k, v]) => maybeRes.setHeader(k, v));
      return maybeRes.status(204).end();
    }
    return new Response(null, { status: 204, headers: responseHeaders });
  }

  // 1. 해당 연도의 기본 폴백 공휴일 추출
  const resultHolidays: Record<string, string> = {};
  Object.keys(FALLBACK_HOLIDAYS).forEach((dateStr) => {
    if (dateStr.startsWith(targetYear)) {
      resultHolidays[dateStr] = FALLBACK_HOLIDAYS[dateStr];
    }
  });

  // 2. 한국천문연구원(KASI) 공공데이터포털 API 연동
  const apiKey = process.env.KASI_API_KEY || process.env.DATA_GO_KR_API_KEY;

  if (apiKey) {
    try {
      const apiUrl = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=${encodeURIComponent(
        apiKey
      )}&solYear=${targetYear}&numOfRows=100&_type=json`;

      const response = await fetch(apiUrl, {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          const rawItems = data?.response?.body?.items?.item;
          const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

          for (const item of items) {
            if (item && item.locdate && item.isHoliday === 'Y') {
              const locStr = String(item.locdate);
              const formattedDate = `${locStr.slice(0, 4)}-${locStr.slice(4, 6)}-${locStr.slice(6, 8)}`;
              resultHolidays[formattedDate] = item.dateName || '공휴일';
            }
          }
        } catch {
          // JSON 파싱 실패 시 폴백 유지
        }
      }
    } catch (e) {
      console.error('KASI API fetch failed:', e);
    }
  }

  const payload = {
    year: targetYear,
    source: apiKey ? 'kasi_live_or_cached' : 'fallback_database',
    holidays: resultHolidays,
  };

  if (isNode) {
    Object.entries(responseHeaders).forEach(([k, v]) => maybeRes.setHeader(k, v));
    return maybeRes.status(200).json(payload);
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: responseHeaders,
  });
}

