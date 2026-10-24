import type { ShiftInfo, MemoLog } from '../types';

export const HISTORY_SYNC_DATE = '1970-01-01';

// 📦 원본 데이터베이스에서 복구된 해(HAE) 수동 근무 오버라이드
export const RESTORED_HAE_OVERRIDES: Record<string, ShiftInfo> = {
  "2026-10-22": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-10-26": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-16": {
    "id": "SW",
    "ot": 4,
    "text": "S",
    "color": "#BDE0FE",
    "label": "스윙",
    "textColor": "#1C1C1E"
  },
  "2026-10-04": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-11": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-10-05": {
    "id": "DAY",
    "text": "D",
    "color": "#FEF08A",
    "label": "데이",
    "textColor": "#854D0E"
  },
  "2026-10-15": {
    "id": "SW",
    "ot": 4,
    "text": "S",
    "color": "#BDE0FE",
    "label": "스윙",
    "textColor": "#1C1C1E"
  },
  "2026-10-21": {
    "id": "GY",
    "ot": 0,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-09-17": {
    "id": "SW",
    "ot": 4,
    "text": "S",
    "color": "#BDE0FE",
    "label": "스윙",
    "textColor": "#1C1C1E"
  },
  "2026-09-18": {
    "id": "SW",
    "ot": 4,
    "text": "S",
    "color": "#BDE0FE",
    "label": "스윙",
    "textColor": "#1C1C1E"
  },
  "2026-11-25": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-01": {
    "id": "GY",
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-12-08": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-11-04": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-11-27": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-11-28": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-11-03": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-11-24": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-14": {
    "id": "SW",
    "ot": 4,
    "text": "S",
    "color": "#BDE0FE",
    "label": "스윙",
    "textColor": "#1C1C1E"
  },
  "2026-12-06": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-10-19": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-10-30": {
    "id": "DAY",
    "ot": 4,
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-12-07": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-11-23": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-12": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-11-08": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-26": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-15": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-10-10": {
    "id": "GY",
    "ot": 4,
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-11-07": {
    "id": "OFF",
    "text": "휴",
    "color": "#FECDD3",
    "label": "휴무",
    "textColor": "#9F1239"
  },
  "2026-12-14": {
    "id": "DAY",
    "ot": 4,
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  }
};

// 📦 원본 데이터베이스에서 복구된 다원(DAWON) 근무 이력 (총 122일)
export const RESTORED_DAWON_OVERRIDES: Record<string, ShiftInfo> = {
  "2026-09-28": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-10-22": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-09-24": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-10-12": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-01": {
    "id": "GY",
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-10-03": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-19": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-10-26": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-22": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-29": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-02": {
    "id": "GY",
    "text": "G",
    "color": "#D3D3D3",
    "label": "야간",
    "textColor": "#1C1C1E"
  },
  "2026-10-16": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-16": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-10-13": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-10-24": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-21": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-28": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-14": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-04": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-15": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-10-06": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-23": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-07": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-25": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-10-11": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-27": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-10-05": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-29": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-18": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-10-08": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-26": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-10-15": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-20": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-21": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-10-09": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-20": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-17": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-23": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-09-30": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-25": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-31": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-17": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-18": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-12-27": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-21": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-11-26": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-06": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-11-25": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-01": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-09-02": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-09-04": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-08": {
    "id": "GY",
    "text": "G",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-09-06": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-04": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-07": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-08": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-09": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-10": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-11": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-12": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-12-22": {
    "id": "OFF",
    "text": "휴",
    "color": "#FECDD3",
    "label": "휴무",
    "textColor": "#9F1239"
  },
  "2026-11-27": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-11-29": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-13": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-09-03": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-09-05": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-02": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-10-27": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-11-28": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-11-03": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-11-24": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-01": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-05": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-10-14": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-12-06": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-10-19": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-10-30": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-11-13": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-07": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-11-23": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-09": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-11-10": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-11-11": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-11-12": {
    "id": "EVE",
    "text": "E",
    "color": "#E0C3FC",
    "label": "이브닝",
    "textColor": "#1C1C1E"
  },
  "2026-11-14": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-03": {
    "id": "OFF",
    "text": "���",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-19": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-20": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-11-21": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-11-22": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-11-18": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-23": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-12-04": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-08": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-24": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-12-26": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-12-28": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-29": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-30": {
    "id": "DAY",
    "text": "D",
    "color": "#FEF08A",
    "label": "데이",
    "textColor": "#854D0E"
  },
  "2026-12-31": {
    "id": "DAY",
    "text": "D",
    "color": "#FEF08A",
    "label": "데이",
    "textColor": "#854D0E"
  },
  "2026-12-25": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-11-15": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-11-16": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-11-17": {
    "id": "NI",
    "text": "N",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-11-30": {
    "id": "DAY",
    "text": "D",
    "color": "#FFF3B0",
    "label": "데이",
    "textColor": "#1C1C1E"
  },
  "2026-10-10": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-11-07": {
    "id": "OFF",
    "text": "휴",
    "color": "#FFCAD4",
    "label": "휴무",
    "textColor": "#1C1C1E"
  },
  "2026-12-20": {
    "id": "DAY",
    "text": "D",
    "color": "#FEF08A",
    "label": "데이",
    "textColor": "#854D0E"
  },
  "2026-12-01": {
    "id": "DAY",
    "text": "D",
    "color": "#FEF08A",
    "label": "데이",
    "textColor": "#854D0E"
  },
  "2026-12-02": {
    "id": "DAY",
    "text": "D",
    "color": "#FEF08A",
    "label": "데이",
    "textColor": "#854D0E"
  },
  "2026-12-05": {
    "id": "DAY",
    "text": "D",
    "color": "#FEF08A",
    "label": "데이",
    "textColor": "#854D0E"
  },
  "2026-12-09": {
    "id": "GY",
    "text": "G",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-12-10": {
    "id": "OFF",
    "text": "휴",
    "color": "#FECDD3",
    "label": "휴무",
    "textColor": "#9F1239"
  },
  "2026-12-11": {
    "id": "OFF",
    "text": "휴",
    "color": "#FECDD3",
    "label": "휴무",
    "textColor": "#9F1239"
  },
  "2026-12-12": {
    "id": "DAY",
    "text": "D",
    "color": "#FEF08A",
    "label": "데이",
    "textColor": "#854D0E"
  },
  "2026-12-13": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-12-14": {
    "id": "EVE",
    "text": "E",
    "color": "#E9D5FF",
    "label": "이브닝",
    "textColor": "#581C87"
  },
  "2026-12-15": {
    "id": "OFF",
    "text": "휴",
    "color": "#FECDD3",
    "label": "휴무",
    "textColor": "#9F1239"
  },
  "2026-12-16": {
    "id": "GY",
    "text": "G",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-12-17": {
    "id": "GY",
    "text": "G",
    "color": "#E4E4E7",
    "label": "야간",
    "textColor": "#27272A"
  },
  "2026-12-18": {
    "id": "OFF",
    "text": "휴",
    "color": "#FECDD3",
    "label": "휴무",
    "textColor": "#9F1239"
  },
  "2026-12-19": {
    "id": "OFF",
    "text": "휴",
    "color": "#FECDD3",
    "label": "휴무",
    "textColor": "#9F1239"
  }
};

// 📦 원본 데이터베이스에서 복구된 공용 메모 (총 21건)
export const RESTORED_MEMOS: Record<string, string> = {
  "2026-10-03": "한강 ♥",
  "2026-09-22": "♥",
  "2026-09-29": "❤️ 데이트\n치이카와 인어의섬 조조 가야지?\nㄴ 30일인데 바부야...\n ㄴ아하!?!ㅋㅋㅋㅋㅋㅋㅋ",
  "2026-10-16": "서울대공원 ♥",
  "2026-10-24": "♥",
  "2026-09-14": "❤️ 데이트 ♥",
  "2026-10-04": "용산 ♥  비 예보 참고하기",
  "2026-09-23": "❤️ 데이트 ♥",
  "2026-10-08": "군산가염 ♥",
  "2026-10-09": "♥",
  "2026-09-30": "\n치이!!!!! 카와!!! ♥\n인천도화 15시 45분 영화",
  "2026-10-25": "♥",
  "2026-11-26": "오사카 여행  ♥",
  "2026-11-25": "오사카 여행  ♥",
  "2026-11-27": "B조 야간 2교대 지원",
  "2026-11-28": "B조 야간 2교대 지원",
  "2026-11-24": "오사카 여행  ♥",
  "2026-11-01": "♥",
  "2026-11-23": "오사카 여행  ♥",
  "2026-11-18": "♥",
  "2026-11-08": "생일 파티♥"
};

// 📦 원본 데이터베이스에서 복구된 해(HAE) 개인 메모
export const RESTORED_HAE_MEMOS: Record<string, string> = {
  "2026-10-12": "오후 6시 출근",
  "2026-10-26": "휴;;;\nFTR 미참�� > 추후 교육 일정 잡힐 예정",
  "2026-09-22": "낚시 3시 30분 연안부두",
  "2026-10-13": "소방훈련",
  "2026-10-28": "공정교육",
  "2026-10-11": "B조 야간 2교대 지원",
  "2026-10-29": "타운홀",
  "2026-11-04": "B조 야간 2교대 지원",
  "2026-11-29": "오후6시 출근",
  "2026-11-03": "B조 야간 2교대 지원",
  "2026-11-05": "오후 6시 출근\n회식 캔슬",
  "2026-11-30": "이날에 회식!!",
  "2026-10-10": "B조 야간 2교대 지원",
  "2026-11-07": "후반차 14~18시까지 근무 / 돠니 보려고 반차 옮겼당"
};

// 📦 원본 데이터베이스에서 복구된 다원(DAWON) 개인 메모
export const RESTORED_DAWON_MEMOS: Record<string, string> = {
  "2026-10-12": "다원이 치과 예약",
  "2026-09-22": "교육",
  "2026-09-21": "치과"
};

// 📦 원본 데이터베이스에서 복구된 기기 간 메모 수정 이력 (총 73건)
export const RESTORED_MEMO_HISTORY: MemoLog[] = [
  {
    "id": "1792776509479_bfac1",
    "timestamp": 1792776509479,
    "targetDate": "2026-11-30",
    "tab": "해",
    "type": "ADD",
    "oldContent": "",
    "content": "이날에 회식!!"
  },
  {
    "id": "1792776495676_j7t9c",
    "timestamp": 1792776495676,
    "targetDate": "2026-11-05",
    "tab": "해",
    "type": "EDIT",
    "oldContent": "오후 6시 출근\n망했슨 퇴근하고 이날에 팀 전체회식한다!!",
    "content": "오후 6시 출근\n회식 캔슬"
  },
  {
    "id": "1792704849825_5cuqy",
    "timestamp": 1792704849825,
    "targetDate": "2026-10-26",
    "tab": "해",
    "type": "EDIT",
    "oldContent": "휴;;;\nFTR 미참석",
    "content": "휴;;;\nFTR 미참석 > 추후 교육 일정 잡힐 예정"
  },
  {
    "id": "1792704806021_2aj9u",
    "timestamp": 1792704806021,
    "targetDate": "2026-11-05",
    "tab": "해",
    "type": "EDIT",
    "oldContent": "오후 6시 출근",
    "content": "오후 6시 출근\n망했슨 퇴근하고 이날에 팀 전체회식한다!!"
  },
  {
    "id": "1792403450832_xke2u",
    "timestamp": 1792403450832,
    "targetDate": "2026-10-27",
    "tab": "해",
    "type": "DELETE",
    "oldContent": "FTR",
    "content": "FTR"
  },
  {
    "id": "1792403446159_5r1gd",
    "timestamp": 1792403446159,
    "targetDate": "2026-10-26",
    "tab": "해",
    "type": "EDIT",
    "oldContent": "휴;;;",
    "content": "휴;;;\nFTR 미참석"
  },
  {
    "id": "1792343059426_iqixe",
    "timestamp": 1792343059426,
    "targetDate": "2026-11-07",
    "tab": "해",
    "type": "EDIT",
    "oldContent": "후반차 14~16까지 근무 돠니 보려고 반차 옮겼당",
    "content": "후반차 14~18시까지 근무 / 돠니 보려고 반차 옮겼당"
  },
  {
    "id": "1792343011829_v4oas",
    "timestamp": 1792343011829,
    "targetDate": "2026-11-07",
    "tab": "해",
    "type": "ADD",
    "oldContent": "",
    "content": "후반차 14~16까지 근무 돠니 보려고 반차 옮겼당"
  },
  {
    "id": "1792342976904_1kf4o",
    "timestamp": 1792342976904,
    "targetDate": "2026-10-27",
    "tab": "해",
    "type": "EDIT",
    "oldContent": "반차 예정 06-10\nFTR",
    "content": "FTR"
  },
  {
    "id": "1792234028787_ypu7d",
    "timestamp": 1792234028787,
    "targetDate": "2026-10-28",
    "tab": "해",
    "type": "EDIT",
    "oldContent": "공정교",
    "content": "공정교육"
  },
  {
    "id": "1792225379846_e6jmd",
    "timestamp": 1792225379846,
    "targetDate": "2026-10-17",
    "tab": "공용",
    "type": "DELETE",
    "oldContent": "낫마스.",
    "content": "낫마스."
  },
  {
    "id": "1792225228298_9zkfg",
    "timestamp": 1792225228298,
    "targetDate": "2026-11-26",
    "tab": "공용",
    "type": "EDIT",
    "oldContent": "여행 ❤️ 데이트 ♥",
    "content": "오사카 여행  ♥"
  },
  {
    "id": "1792225223884_hyg9d",
    "timestamp": 1792225223884,
    "targetDate": "2026-11-25",
    "tab": "공용",
    "type": "EDIT",
    "oldContent": "여행 ❤️ 데이트 ♥",
    "content": "오사카 여행  ♥"
  },
  {
    "id": "1792225211509_3n32f",
    "timestamp": 1792225211509,
    "targetDate": "2026-11-24",
    "tab": "공용",
    "type": "EDIT",
    "oldContent": "여행 ❤️ 데이트 ♥",
    "content": "오사카 여행  ♥"
  },
  {
    "id": "1792225200854_aeqxe",
    "timestamp": 1792225200854,
    "targetDate": "2026-11-23",
    "tab": "공용",
    "type": "EDIT",
    "oldContent": "여행 ❤️ 데이트 ♥",
    "content": "오사카 여행  ♥"
  },
  {
    "id": "1792224281007uo0t1",
    "timestamp": 1792224281007,
    "targetDate": "2026-10-17",
    "tab": "공용",
    "type": "EDIT",
    "content": "낫마스."
  },
  {
    "id": "1792223037049hgu7c",
    "timestamp": 1792223037049,
    "targetDate": "2026-10-17",
    "tab": "공용",
    "type": "ADD",
    "content": "낫마스"
  },
  {
    "id": "1792204224487coyop",
    "timestamp": 1792204224487,
    "targetDate": "2026-10-17",
    "tab": "공용",
    "type": "DELETE",
    "content": ""
  },
  {
    "id": "1792150986957tbrdy",
    "timestamp": 1792150986957,
    "targetDate": "2026-11-08",
    "tab": "공용",
    "type": "EDIT",
    "content": "생일 파티♥"
  },
  {
    "id": "1792150980368dm1ah",
    "timestamp": 1792150980368,
    "targetDate": "2026-11-08",
    "tab": "공용",
    "type": "EDIT",
    "content": "생일 파뤼♥"
  },
  {
    "id": "1792150702277vd6ek",
    "timestamp": 1792150702277,
    "targetDate": "2026-11-26",
    "tab": "공용",
    "type": "EDIT",
    "content": "여행 ❤️ 데이트 ♥"
  },
  {
    "id": "1792150700679smffg",
    "timestamp": 1792150700679,
    "targetDate": "2026-11-25",
    "tab": "공용",
    "type": "EDIT",
    "content": "여행 ❤️ 데이트 ♥"
  },
  {
    "id": "17921506952887hmf7",
    "timestamp": 1792150695288,
    "targetDate": "2026-11-24",
    "tab": "공용",
    "type": "EDIT",
    "content": "여행 ❤️ 데이트 ♥"
  },
  {
    "id": "179215069323767vkq",
    "timestamp": 1792150693237,
    "targetDate": "2026-11-23",
    "tab": "공용",
    "type": "EDIT",
    "content": "여행 ❤️ 데이트 ♥"
  },
  {
    "id": "1792150689949adq5j",
    "timestamp": 1792150689949,
    "targetDate": "2026-11-18",
    "tab": "공용",
    "type": "ADD",
    "content": "♥"
  },
  {
    "id": "179215068570231zk0",
    "timestamp": 1792150685702,
    "targetDate": "2026-11-08",
    "tab": "공용",
    "type": "ADD",
    "content": "♥"
  },
  {
    "id": "1792150682598jvnec",
    "timestamp": 1792150682598,
    "targetDate": "2026-11-01",
    "tab": "공용",
    "type": "ADD",
    "content": "♥"
  },
  {
    "id": "1791794645053y8gou",
    "timestamp": 1791794645053,
    "targetDate": "2026-10-13",
    "tab": "해",
    "type": "ADD",
    "content": "소방훈련"
  },
  {
    "id": "1791794529485ml2as",
    "timestamp": 1791794529485,
    "targetDate": "2026-10-27",
    "tab": "해",
    "type": "EDIT",
    "content": "반차 예정 06-10\nFTR"
  },
  {
    "id": "17917945092415ccfw",
    "timestamp": 1791794509241,
    "targetDate": "2026-10-29",
    "tab": "해",
    "type": "ADD",
    "content": "타운홀"
  },
  {
    "id": "1791794496376o9vp7",
    "timestamp": 1791794496376,
    "targetDate": "2026-10-28",
    "tab": "해",
    "type": "EDIT",
    "content": "공정교"
  },
  {
    "id": "1791794488845bi7tk",
    "timestamp": 1791794488845,
    "targetDate": "2026-10-27",
    "tab": "해",
    "type": "EDIT",
    "content": "반차 예정\nFTR"
  },
  {
    "id": "17917944468993hkni",
    "timestamp": 1791794446899,
    "targetDate": "2026-10-26",
    "tab": "해",
    "type": "EDIT",
    "content": "휴;;;"
  },
  {
    "id": "1791609058413p8hvq",
    "timestamp": 1791609058413,
    "targetDate": "2026-10-25",
    "tab": "공용",
    "type": "ADD",
    "content": "♥"
  },
  {
    "id": "1791609056224ifuwx",
    "timestamp": 1791609056224,
    "targetDate": "2026-10-24",
    "tab": "공용",
    "type": "ADD",
    "content": "♥"
  },
  {
    "id": "1791609051514aycjq",
    "timestamp": 1791609051514,
    "targetDate": "2026-10-17",
    "tab": "공용",
    "type": "ADD",
    "content": "♥"
  },
  {
    "id": "179160903654135pmh",
    "timestamp": 1791609036541,
    "targetDate": "2026-10-16",
    "tab": "공용",
    "type": "ADD",
    "content": "서울대공원 ♥"
  },
  {
    "id": "1791372109997rebpk",
    "timestamp": 1791372109997,
    "targetDate": "2026-10-09",
    "tab": "공용",
    "type": "ADD",
    "content": "♥"
  },
  {
    "id": "1791372107830cnjxh",
    "timestamp": 1791372107830,
    "targetDate": "2026-10-08",
    "tab": "공용",
    "type": "EDIT",
    "content": "군산가염 ♥"
  },
  {
    "id": "1791131993332vj86o",
    "timestamp": 1791131993332,
    "targetDate": "2026-10-08",
    "tab": "공용",
    "type": "ADD",
    "content": "군산가염"
  },
  {
    "id": "1790931008127irqf4",
    "timestamp": 1790931008127,
    "targetDate": "2026-10-04",
    "tab": "공용",
    "type": "EDIT",
    "content": "용산 ♥  비 예보 참고하기"
  },
  {
    "id": "1790930990128owsns",
    "timestamp": 1790930990128,
    "targetDate": "2026-10-03",
    "tab": "공용",
    "type": "EDIT",
    "content": "한강 ♥"
  },
  {
    "id": "17909309662118aqia",
    "timestamp": 1790930966211,
    "targetDate": "2026-10-12",
    "tab": "다원",
    "type": "ADD",
    "content": "다원이 치과 예약"
  },
  {
    "id": "1790284611770sfu6v",
    "timestamp": 1790284611770,
    "targetDate": "2026-10-27",
    "tab": "해",
    "type": "EDIT",
    "content": "반차 예정\n타운홀미팅"
  },
  {
    "id": "1790266383543stsvo",
    "timestamp": 1790266383543,
    "targetDate": "2026-11-29",
    "tab": "해",
    "type": "ADD",
    "content": "오후6시 출근"
  },
  {
    "id": "1790266372863bs95x",
    "timestamp": 1790266372863,
    "targetDate": "2026-11-27",
    "tab": "공용",
    "type": "ADD",
    "content": "B조 야간 2교대 지원"
  },
  {
    "id": "1790266366769aiz4x",
    "timestamp": 1790266366769,
    "targetDate": "2026-11-28",
    "tab": "공용",
    "type": "ADD",
    "content": "B조 야간 2교대 지원"
  },
  {
    "id": "17902663490306hh1o",
    "timestamp": 1790266349030,
    "targetDate": "2026-11-05",
    "tab": "해",
    "type": "ADD",
    "content": "오후 6시 출근"
  },
  {
    "id": "1790266299688c2nun",
    "timestamp": 1790266299688,
    "targetDate": "2026-11-04",
    "tab": "해",
    "type": "ADD",
    "content": "B조 야간 2교대 지원"
  },
  {
    "id": "1790266293222l6l0q",
    "timestamp": 1790266293222,
    "targetDate": "2026-11-03",
    "tab": "해",
    "type": "ADD",
    "content": "B조 야간 2교대 지원"
  },
  {
    "id": "1790266095820j0i2p",
    "timestamp": 1790266095820,
    "targetDate": "2026-10-12",
    "tab": "해",
    "type": "ADD",
    "content": "오후 6시 출근"
  },
  {
    "id": "17902660837313o8uw",
    "timestamp": 1790266083731,
    "targetDate": "2026-10-11",
    "tab": "해",
    "type": "ADD",
    "content": "B조 야간 2교대 지원"
  },
  {
    "id": "1790266068502k919n",
    "timestamp": 1790266068502,
    "targetDate": "2026-10-10",
    "tab": "해",
    "type": "ADD",
    "content": "B조 야간 2교대 지원"
  },
  {
    "id": "1790265896083z0bkq",
    "timestamp": 1790265896083,
    "targetDate": "2026-10-15",
    "tab": "해",
    "type": "DELETE",
    "content": ""
  },
  {
    "id": "1790265889435ebczj",
    "timestamp": 1790265889435,
    "targetDate": "2026-10-14",
    "tab": "해",
    "type": "DELETE",
    "content": ""
  },
  {
    "id": "1790265796742xa28x",
    "timestamp": 1790265796742,
    "targetDate": "2026-10-15",
    "tab": "해",
    "type": "ADD",
    "content": "B조 야간 2교대 지원"
  },
  {
    "id": "1790265787847l2fe7",
    "timestamp": 1790265787847,
    "targetDate": "2026-10-14",
    "tab": "해",
    "type": "ADD",
    "content": "B조 야간 2교대 지원"
  },
  {
    "id": "1790249986216lozam",
    "timestamp": 1790249986216,
    "targetDate": "2026-10-03",
    "tab": "공용",
    "type": "EDIT",
    "content": "송도 ♥"
  },
  {
    "id": "1790249572961fwpv0",
    "timestamp": 1790249572961,
    "targetDate": "2026-09-30",
    "tab": "공용",
    "type": "EDIT",
    "content": "치이!!!!! 카와!!! ♥\n인천도화 15시 45분 영화"
  },
  {
    "id": "1790209239413buv9t",
    "timestamp": 1790209239413,
    "targetDate": "2026-10-03",
    "tab": "공용",
    "type": "ADD",
    "content": "송도"
  },
  {
    "id": "179020923146278g44",
    "timestamp": 1790209231462,
    "targetDate": "2026-09-30",
    "tab": "공용",
    "type": "EDIT",
    "content": "치이!!!!! 카와!!! ♥ 용산 용산"
  },
  {
    "id": "1789960996193b0p78",
    "timestamp": 1789960996193,
    "targetDate": "2026-09-22",
    "tab": "해",
    "type": "EDIT",
    "content": "낚시 3시 30분 연안부두"
  },
  {
    "id": "1789960970016bbayd",
    "timestamp": 1789960970016,
    "targetDate": "2026-09-21",
    "tab": "다원",
    "type": "ADD",
    "content": "치과"
  },
  {
    "id": "17899609218772ngak",
    "timestamp": 1789960921877,
    "targetDate": "2026-10-27",
    "tab": "해",
    "type": "ADD",
    "content": "반차 예정"
  },
  {
    "id": "17899608814756cu7v",
    "timestamp": 1789960881475,
    "targetDate": "2026-10-26",
    "tab": "해",
    "type": "ADD",
    "content": "FTR 교육 참석 미정"
  },
  {
    "id": "1789960860772z2317",
    "timestamp": 1789960860772,
    "targetDate": "2026-10-28",
    "tab": "해",
    "type": "ADD",
    "content": "공정교육"
  },
  {
    "id": "17896187207385ques",
    "timestamp": 1789618720738,
    "targetDate": "2026-09-22",
    "tab": "공용",
    "type": "EDIT",
    "content": "♥"
  },
  {
    "id": "1789605745263za7w3",
    "timestamp": 1789605745263,
    "targetDate": "2026-10-04",
    "tab": "공용",
    "type": "EDIT",
    "content": "♥"
  },
  {
    "id": "1789604208011u6r34",
    "timestamp": 1789604208011,
    "targetDate": "2026-10-04",
    "tab": "공용",
    "type": "EDIT",
    "content": "❤️ 데이트 ♥"
  },
  {
    "id": "1789604199070gbnj9",
    "timestamp": 1789604199070,
    "targetDate": "2026-09-23",
    "tab": "공용",
    "type": "EDIT",
    "content": "❤️ 데이트 ♥"
  },
  {
    "id": "1789604197650mx5d4",
    "timestamp": 1789604197650,
    "targetDate": "2026-09-22",
    "tab": "��용",
    "type": "EDIT",
    "content": "❤️ 데이트 ♥"
  },
  {
    "id": "1789604194133lgpjr",
    "timestamp": 1789604194133,
    "targetDate": "2026-09-14",
    "tab": "공용",
    "type": "EDIT",
    "content": "❤️ 데이트 ♥"
  },
  {
    "id": "17896041832686ge4c",
    "timestamp": 1789604183268,
    "targetDate": "2026-09-30",
    "tab": "공용",
    "type": "EDIT",
    "content": "치이!!!!! 카와!!! ♥"
  }
];

// 📦 클라우드 DB 최초 시딩용 전체 행 데이터
export const INITIAL_CALENDAR_ROWS = [
  {
    "date": "2026-09-28",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-22",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-24",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-12",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "오후 6시 출근",
    "dawon_memo": "다원이 치과 예약"
  },
  {
    "date": "2026-10-01",
    "hae_shift": null,
    "dawon_shift": {
      "id": "GY",
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-03",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "한강 ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-19",
    "hae_shift": null,
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-26",
    "hae_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "휴;;;\nFTR 미참�� > 추후 교육 일정 잡힐 예정",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-22",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "♥",
    "hae_memo": "낚시 3시 30분 연안부두",
    "dawon_memo": "교육"
  },
  {
    "date": "2026-09-29",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "❤️ 데이트\n치이카와 인어의섬 조조 가야지?\nㄴ 30일인데 바부야...\n ㄴ아하!?!ㅋㅋㅋㅋㅋㅋㅋ",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-02",
    "hae_shift": null,
    "dawon_shift": {
      "id": "GY",
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-16",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "서울대공원 ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-16",
    "hae_shift": {
      "id": "SW",
      "ot": 4,
      "text": "S",
      "color": "#BDE0FE",
      "label": "스윙",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2027-07-01",
    "hae_shift": null,
    "dawon_shift": null,
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-13",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "소방훈련",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-24",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-21",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": "치과"
  },
  {
    "date": "2026-10-28",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "공정교육",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-14",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "❤️ 데이트 ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-04",
    "hae_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "용산 ♥  비 예보 참고하기",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-15",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-06",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-08-30",
    "hae_shift": null,
    "dawon_shift": null,
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-23",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "❤️ 데이트 ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-07",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-25",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-11",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "B조 야간 2교대 지원",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-27",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-05",
    "hae_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FEF08A",
      "label": "데이",
      "textColor": "#854D0E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-29",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "타운홀",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-18",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-08",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "군산가염 ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-26",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-15",
    "hae_shift": {
      "id": "SW",
      "ot": 4,
      "text": "S",
      "color": "#BDE0FE",
      "label": "스윙",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-20",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-21",
    "hae_shift": {
      "id": "GY",
      "ot": 0,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-09",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-20",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-17",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-23",
    "hae_shift": null,
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-30",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "\n치이!!!!! 카와!!! ♥\n인천도화 15시 45분 영화",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-25",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-31",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-17",
    "hae_shift": {
      "id": "SW",
      "ot": 4,
      "text": "S",
      "color": "#BDE0FE",
      "label": "스윙",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-18",
    "hae_shift": {
      "id": "SW",
      "ot": 4,
      "text": "S",
      "color": "#BDE0FE",
      "label": "스윙",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-27",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-21",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-26",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "오사카 여행  ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-06",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-25",
    "hae_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "오사카 여행  ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-01",
    "hae_shift": {
      "id": "GY",
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-02",
    "hae_shift": null,
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-04",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-08",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "GY",
      "text": "G",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-06",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-04",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "B조 야간 2교대 지원",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-07",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-08",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-09",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-10",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-11",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-12",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-22",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FECDD3",
      "label": "휴무",
      "textColor": "#9F1239"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-07-16",
    "hae_shift": null,
    "dawon_shift": null,
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-27",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "B조 야간 2교대 지원",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-29",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "오후6시 출근",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-13",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-03",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-09-05",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-02",
    "hae_shift": null,
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-27",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-28",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "B조 야간 2교대 지원",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-03",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "B조 야간 2교대 지원",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-24",
    "hae_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "오사카 여행  ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2028-03-31",
    "hae_shift": null,
    "dawon_shift": null,
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-01",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2028-09-01",
    "hae_shift": null,
    "dawon_shift": null,
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2027-01-11",
    "hae_shift": null,
    "dawon_shift": null,
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-05",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "오후 6시 출근\n회식 캔슬",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-14",
    "hae_shift": {
      "id": "SW",
      "ot": 4,
      "text": "S",
      "color": "#BDE0FE",
      "label": "스윙",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2028-10-17",
    "hae_shift": null,
    "dawon_shift": null,
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-06",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-19",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-30",
    "hae_shift": {
      "id": "DAY",
      "ot": 4,
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-13",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-07",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-23",
    "hae_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "오사카 여행  ♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-09",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-10",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-11",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-12",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E0C3FC",
      "label": "이브닝",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-14",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-03",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "���",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-19",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-20",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-21",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-22",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-18",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-23",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-04",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-08",
    "hae_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "생일 파티♥",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-24",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-26",
    "hae_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-28",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-29",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-30",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FEF08A",
      "label": "데이",
      "textColor": "#854D0E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-31",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FEF08A",
      "label": "데이",
      "textColor": "#854D0E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-25",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-15",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-16",
    "hae_shift": null,
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-17",
    "hae_shift": null,
    "dawon_shift": {
      "id": "NI",
      "text": "N",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-30",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "이날에 회식!!",
    "dawon_memo": ""
  },
  {
    "date": "2026-10-10",
    "hae_shift": {
      "id": "GY",
      "ot": 4,
      "text": "G",
      "color": "#D3D3D3",
      "label": "야간",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "B조 야간 2교대 지원",
    "dawon_memo": ""
  },
  {
    "date": "1970-01-01",
    "hae_shift": null,
    "dawon_shift": null,
    "memo": "[{\"id\":\"1792776509479_bfac1\",\"timestamp\":1792776509479,\"targetDate\":\"2026-11-30\",\"tab\":\"해\",\"type\":\"ADD\",\"oldContent\":\"\",\"content\":\"이날에 회식!!\"},{\"id\":\"1792776495676_j7t9c\",\"timestamp\":1792776495676,\"targetDate\":\"2026-11-05\",\"tab\":\"해\",\"type\":\"EDIT\",\"oldContent\":\"오후 6시 출근\\n망했슨 퇴근하고 이날에 팀 전체회식한다!!\",\"content\":\"오후 6시 출근\\n회식 캔슬\"},{\"id\":\"1792704849825_5cuqy\",\"timestamp\":1792704849825,\"targetDate\":\"2026-10-26\",\"tab\":\"해\",\"type\":\"EDIT\",\"oldContent\":\"휴;;;\\nFTR 미참석\",\"content\":\"휴;;;\\nFTR 미참석 > 추후 교육 일정 잡힐 예정\"},{\"id\":\"1792704806021_2aj9u\",\"timestamp\":1792704806021,\"targetDate\":\"2026-11-05\",\"tab\":\"해\",\"type\":\"EDIT\",\"oldContent\":\"오후 6시 출근\",\"content\":\"오후 6시 출근\\n망했슨 퇴근하고 이날에 팀 전체회식한다!!\"},{\"id\":\"1792403450832_xke2u\",\"timestamp\":1792403450832,\"targetDate\":\"2026-10-27\",\"tab\":\"해\",\"type\":\"DELETE\",\"oldContent\":\"FTR\",\"content\":\"FTR\"},{\"id\":\"1792403446159_5r1gd\",\"timestamp\":1792403446159,\"targetDate\":\"2026-10-26\",\"tab\":\"해\",\"type\":\"EDIT\",\"oldContent\":\"휴;;;\",\"content\":\"휴;;;\\nFTR 미참석\"},{\"id\":\"1792343059426_iqixe\",\"timestamp\":1792343059426,\"targetDate\":\"2026-11-07\",\"tab\":\"해\",\"type\":\"EDIT\",\"oldContent\":\"후반차 14~16까지 근무 돠니 보려고 반차 옮겼당\",\"content\":\"후반차 14~18시까지 근무 / 돠니 보려고 반차 옮겼당\"},{\"id\":\"1792343011829_v4oas\",\"timestamp\":1792343011829,\"targetDate\":\"2026-11-07\",\"tab\":\"해\",\"type\":\"ADD\",\"oldContent\":\"\",\"content\":\"후반차 14~16까지 근무 돠니 보려고 반차 옮겼당\"},{\"id\":\"1792342976904_1kf4o\",\"timestamp\":1792342976904,\"targetDate\":\"2026-10-27\",\"tab\":\"해\",\"type\":\"EDIT\",\"oldContent\":\"반차 예정 06-10\\nFTR\",\"content\":\"FTR\"},{\"id\":\"1792234028787_ypu7d\",\"timestamp\":1792234028787,\"targetDate\":\"2026-10-28\",\"tab\":\"해\",\"type\":\"EDIT\",\"oldContent\":\"공정교\",\"content\":\"공정교육\"},{\"id\":\"1792225379846_e6jmd\",\"timestamp\":1792225379846,\"targetDate\":\"2026-10-17\",\"tab\":\"공용\",\"type\":\"DELETE\",\"oldContent\":\"낫마스.\",\"content\":\"낫마스.\"},{\"id\":\"1792225228298_9zkfg\",\"timestamp\":1792225228298,\"targetDate\":\"2026-11-26\",\"tab\":\"공용\",\"type\":\"EDIT\",\"oldContent\":\"여행 ❤️ 데이트 ♥\",\"content\":\"오사카 여행  ♥\"},{\"id\":\"1792225223884_hyg9d\",\"timestamp\":1792225223884,\"targetDate\":\"2026-11-25\",\"tab\":\"공용\",\"type\":\"EDIT\",\"oldContent\":\"여행 ❤️ 데이트 ♥\",\"content\":\"오사카 여행  ♥\"},{\"id\":\"1792225211509_3n32f\",\"timestamp\":1792225211509,\"targetDate\":\"2026-11-24\",\"tab\":\"공용\",\"type\":\"EDIT\",\"oldContent\":\"여행 ❤️ 데이트 ♥\",\"content\":\"오사카 여행  ♥\"},{\"id\":\"1792225200854_aeqxe\",\"timestamp\":1792225200854,\"targetDate\":\"2026-11-23\",\"tab\":\"공용\",\"type\":\"EDIT\",\"oldContent\":\"여행 ❤️ 데이트 ♥\",\"content\":\"오사카 여행  ♥\"},{\"id\":\"1792224281007uo0t1\",\"timestamp\":1792224281007,\"targetDate\":\"2026-10-17\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"낫마스.\"},{\"id\":\"1792223037049hgu7c\",\"timestamp\":1792223037049,\"targetDate\":\"2026-10-17\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"낫마스\"},{\"id\":\"1792204224487coyop\",\"timestamp\":1792204224487,\"targetDate\":\"2026-10-17\",\"tab\":\"공용\",\"type\":\"DELETE\",\"content\":\"\"},{\"id\":\"1792150986957tbrdy\",\"timestamp\":1792150986957,\"targetDate\":\"2026-11-08\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"생일 파티♥\"},{\"id\":\"1792150980368dm1ah\",\"timestamp\":1792150980368,\"targetDate\":\"2026-11-08\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"생일 파뤼♥\"},{\"id\":\"1792150702277vd6ek\",\"timestamp\":1792150702277,\"targetDate\":\"2026-11-26\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"여행 ❤️ 데이트 ♥\"},{\"id\":\"1792150700679smffg\",\"timestamp\":1792150700679,\"targetDate\":\"2026-11-25\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"여행 ❤️ 데이트 ♥\"},{\"id\":\"17921506952887hmf7\",\"timestamp\":1792150695288,\"targetDate\":\"2026-11-24\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"여행 ❤️ 데이트 ♥\"},{\"id\":\"179215069323767vkq\",\"timestamp\":1792150693237,\"targetDate\":\"2026-11-23\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"여행 ❤️ 데이트 ♥\"},{\"id\":\"1792150689949adq5j\",\"timestamp\":1792150689949,\"targetDate\":\"2026-11-18\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"♥\"},{\"id\":\"179215068570231zk0\",\"timestamp\":1792150685702,\"targetDate\":\"2026-11-08\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"♥\"},{\"id\":\"1792150682598jvnec\",\"timestamp\":1792150682598,\"targetDate\":\"2026-11-01\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"♥\"},{\"id\":\"1791794645053y8gou\",\"timestamp\":1791794645053,\"targetDate\":\"2026-10-13\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"소방훈련\"},{\"id\":\"1791794529485ml2as\",\"timestamp\":1791794529485,\"targetDate\":\"2026-10-27\",\"tab\":\"해\",\"type\":\"EDIT\",\"content\":\"반차 예정 06-10\\nFTR\"},{\"id\":\"17917945092415ccfw\",\"timestamp\":1791794509241,\"targetDate\":\"2026-10-29\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"타운홀\"},{\"id\":\"1791794496376o9vp7\",\"timestamp\":1791794496376,\"targetDate\":\"2026-10-28\",\"tab\":\"해\",\"type\":\"EDIT\",\"content\":\"공정교\"},{\"id\":\"1791794488845bi7tk\",\"timestamp\":1791794488845,\"targetDate\":\"2026-10-27\",\"tab\":\"해\",\"type\":\"EDIT\",\"content\":\"반차 예정\\nFTR\"},{\"id\":\"17917944468993hkni\",\"timestamp\":1791794446899,\"targetDate\":\"2026-10-26\",\"tab\":\"해\",\"type\":\"EDIT\",\"content\":\"휴;;;\"},{\"id\":\"1791609058413p8hvq\",\"timestamp\":1791609058413,\"targetDate\":\"2026-10-25\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"♥\"},{\"id\":\"1791609056224ifuwx\",\"timestamp\":1791609056224,\"targetDate\":\"2026-10-24\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"♥\"},{\"id\":\"1791609051514aycjq\",\"timestamp\":1791609051514,\"targetDate\":\"2026-10-17\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"♥\"},{\"id\":\"179160903654135pmh\",\"timestamp\":1791609036541,\"targetDate\":\"2026-10-16\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"서울대공원 ♥\"},{\"id\":\"1791372109997rebpk\",\"timestamp\":1791372109997,\"targetDate\":\"2026-10-09\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"♥\"},{\"id\":\"1791372107830cnjxh\",\"timestamp\":1791372107830,\"targetDate\":\"2026-10-08\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"군산가염 ♥\"},{\"id\":\"1791131993332vj86o\",\"timestamp\":1791131993332,\"targetDate\":\"2026-10-08\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"군산가염\"},{\"id\":\"1790931008127irqf4\",\"timestamp\":1790931008127,\"targetDate\":\"2026-10-04\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"용산 ♥  비 예보 참고하기\"},{\"id\":\"1790930990128owsns\",\"timestamp\":1790930990128,\"targetDate\":\"2026-10-03\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"한강 ♥\"},{\"id\":\"17909309662118aqia\",\"timestamp\":1790930966211,\"targetDate\":\"2026-10-12\",\"tab\":\"다원\",\"type\":\"ADD\",\"content\":\"다원이 치과 예약\"},{\"id\":\"1790284611770sfu6v\",\"timestamp\":1790284611770,\"targetDate\":\"2026-10-27\",\"tab\":\"해\",\"type\":\"EDIT\",\"content\":\"반차 예정\\n타운홀미팅\"},{\"id\":\"1790266383543stsvo\",\"timestamp\":1790266383543,\"targetDate\":\"2026-11-29\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"오후6시 출근\"},{\"id\":\"1790266372863bs95x\",\"timestamp\":1790266372863,\"targetDate\":\"2026-11-27\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"B조 야간 2교대 지원\"},{\"id\":\"1790266366769aiz4x\",\"timestamp\":1790266366769,\"targetDate\":\"2026-11-28\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"B조 야간 2교대 지원\"},{\"id\":\"17902663490306hh1o\",\"timestamp\":1790266349030,\"targetDate\":\"2026-11-05\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"오후 6시 출근\"},{\"id\":\"1790266299688c2nun\",\"timestamp\":1790266299688,\"targetDate\":\"2026-11-04\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"B조 야간 2교대 지원\"},{\"id\":\"1790266293222l6l0q\",\"timestamp\":1790266293222,\"targetDate\":\"2026-11-03\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"B조 야간 2교대 지원\"},{\"id\":\"1790266095820j0i2p\",\"timestamp\":1790266095820,\"targetDate\":\"2026-10-12\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"오후 6시 출근\"},{\"id\":\"17902660837313o8uw\",\"timestamp\":1790266083731,\"targetDate\":\"2026-10-11\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"B조 야간 2교대 지원\"},{\"id\":\"1790266068502k919n\",\"timestamp\":1790266068502,\"targetDate\":\"2026-10-10\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"B조 야간 2교대 지원\"},{\"id\":\"1790265896083z0bkq\",\"timestamp\":1790265896083,\"targetDate\":\"2026-10-15\",\"tab\":\"해\",\"type\":\"DELETE\",\"content\":\"\"},{\"id\":\"1790265889435ebczj\",\"timestamp\":1790265889435,\"targetDate\":\"2026-10-14\",\"tab\":\"해\",\"type\":\"DELETE\",\"content\":\"\"},{\"id\":\"1790265796742xa28x\",\"timestamp\":1790265796742,\"targetDate\":\"2026-10-15\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"B조 야간 2교대 지원\"},{\"id\":\"1790265787847l2fe7\",\"timestamp\":1790265787847,\"targetDate\":\"2026-10-14\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"B조 야간 2교대 지원\"},{\"id\":\"1790249986216lozam\",\"timestamp\":1790249986216,\"targetDate\":\"2026-10-03\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"송도 ♥\"},{\"id\":\"1790249572961fwpv0\",\"timestamp\":1790249572961,\"targetDate\":\"2026-09-30\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"치이!!!!! 카와!!! ♥\\n인천도화 15시 45분 영화\"},{\"id\":\"1790209239413buv9t\",\"timestamp\":1790209239413,\"targetDate\":\"2026-10-03\",\"tab\":\"공용\",\"type\":\"ADD\",\"content\":\"송도\"},{\"id\":\"179020923146278g44\",\"timestamp\":1790209231462,\"targetDate\":\"2026-09-30\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"치이!!!!! 카와!!! ♥ 용산 용산\"},{\"id\":\"1789960996193b0p78\",\"timestamp\":1789960996193,\"targetDate\":\"2026-09-22\",\"tab\":\"해\",\"type\":\"EDIT\",\"content\":\"낚시 3시 30분 연안부두\"},{\"id\":\"1789960970016bbayd\",\"timestamp\":1789960970016,\"targetDate\":\"2026-09-21\",\"tab\":\"다원\",\"type\":\"ADD\",\"content\":\"치과\"},{\"id\":\"17899609218772ngak\",\"timestamp\":1789960921877,\"targetDate\":\"2026-10-27\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"반차 예정\"},{\"id\":\"17899608814756cu7v\",\"timestamp\":1789960881475,\"targetDate\":\"2026-10-26\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"FTR 교육 참석 미정\"},{\"id\":\"1789960860772z2317\",\"timestamp\":1789960860772,\"targetDate\":\"2026-10-28\",\"tab\":\"해\",\"type\":\"ADD\",\"content\":\"공정교육\"},{\"id\":\"17896187207385ques\",\"timestamp\":1789618720738,\"targetDate\":\"2026-09-22\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"♥\"},{\"id\":\"1789605745263za7w3\",\"timestamp\":1789605745263,\"targetDate\":\"2026-10-04\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"♥\"},{\"id\":\"1789604208011u6r34\",\"timestamp\":1789604208011,\"targetDate\":\"2026-10-04\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"❤️ 데이트 ♥\"},{\"id\":\"1789604199070gbnj9\",\"timestamp\":1789604199070,\"targetDate\":\"2026-09-23\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"❤️ 데이트 ♥\"},{\"id\":\"1789604197650mx5d4\",\"timestamp\":1789604197650,\"targetDate\":\"2026-09-22\",\"tab\":\"��용\",\"type\":\"EDIT\",\"content\":\"❤️ 데이트 ♥\"},{\"id\":\"1789604194133lgpjr\",\"timestamp\":1789604194133,\"targetDate\":\"2026-09-14\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"❤️ 데이트 ♥\"},{\"id\":\"17896041832686ge4c\",\"timestamp\":1789604183268,\"targetDate\":\"2026-09-30\",\"tab\":\"공용\",\"type\":\"EDIT\",\"content\":\"치이!!!!! 카와!!! ♥\"}]",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-11-07",
    "hae_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FECDD3",
      "label": "휴무",
      "textColor": "#9F1239"
    },
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FFCAD4",
      "label": "휴무",
      "textColor": "#1C1C1E"
    },
    "memo": "",
    "hae_memo": "후반차 14~18시까지 근무 / 돠니 보려고 반차 옮겼당",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-20",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FEF08A",
      "label": "데이",
      "textColor": "#854D0E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-01",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FEF08A",
      "label": "데이",
      "textColor": "#854D0E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-02",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FEF08A",
      "label": "데이",
      "textColor": "#854D0E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-05",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FEF08A",
      "label": "데이",
      "textColor": "#854D0E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-09",
    "hae_shift": null,
    "dawon_shift": {
      "id": "GY",
      "text": "G",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-10",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FECDD3",
      "label": "휴무",
      "textColor": "#9F1239"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-11",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FECDD3",
      "label": "휴무",
      "textColor": "#9F1239"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-12",
    "hae_shift": null,
    "dawon_shift": {
      "id": "DAY",
      "text": "D",
      "color": "#FEF08A",
      "label": "데이",
      "textColor": "#854D0E"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-13",
    "hae_shift": null,
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-14",
    "hae_shift": {
      "id": "DAY",
      "ot": 4,
      "text": "D",
      "color": "#FFF3B0",
      "label": "데이",
      "textColor": "#1C1C1E"
    },
    "dawon_shift": {
      "id": "EVE",
      "text": "E",
      "color": "#E9D5FF",
      "label": "이브닝",
      "textColor": "#581C87"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-15",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FECDD3",
      "label": "휴무",
      "textColor": "#9F1239"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-16",
    "hae_shift": null,
    "dawon_shift": {
      "id": "GY",
      "text": "G",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-17",
    "hae_shift": null,
    "dawon_shift": {
      "id": "GY",
      "text": "G",
      "color": "#E4E4E7",
      "label": "야간",
      "textColor": "#27272A"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-18",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FECDD3",
      "label": "휴무",
      "textColor": "#9F1239"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  },
  {
    "date": "2026-12-19",
    "hae_shift": null,
    "dawon_shift": {
      "id": "OFF",
      "text": "휴",
      "color": "#FECDD3",
      "label": "휴무",
      "textColor": "#9F1239"
    },
    "memo": "",
    "hae_memo": "",
    "dawon_memo": ""
  }
];
