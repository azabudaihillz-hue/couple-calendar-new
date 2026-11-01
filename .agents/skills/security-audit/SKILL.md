---
name: security-audit
description: Structured multi-phase security audit workflow based on cloudflare/security-audit-skill for inspecting React Native, Expo, Vercel Edge API routes, and Supabase integrations.
---

# Security Audit Skill (`cloudflare/security-audit-skill`)

Use this skill when performing security reviews, pre-release checks, or vulnerability hunting on the repository.

## Phase 1: Reconnaissance & Surface Mapping
1. **Entry Points**:
   - Mobile / Web client (`App.tsx`, `src/`)
   - Vercel Edge / Serverless endpoints (`api/calendar.ts`, `api/holidays.js`)
   - Database client & environment configuration (`supabase.ts`, `.env.example`)
2. **Sensitive Assets**:
   - Personal names and private memos (`couple_calendar` table)
   - Salary & OT vault protected by 6-digit PIN (`src/utils/security.ts`)
   - Supabase URL and Anon Key handling

## Phase 2: Vulnerability Hunting Checklist
- **Secret & PII Hygiene**:
  - Verify zero plaintext PINs, passwords, service_role keys, or personal real names exist in tracked source files (`grep -rnE`).
- **Authentication & Vault Protection (`src/utils/security.ts`)**:
  - Ensure PIN verification uses salted SHA-256 (`couple_vault_v1_` + PIN) and never stores plaintext PINs in `AsyncStorage`.
  - Verify brute-force lockout (`MAX_FAIL_ATTEMPTS = 5`, `LOCKOUT_DURATION_MS = 60000`) is enforced before hash comparison.
- **API & ICS Feed Security (`api/calendar.ts`)**:
  - Ensure ICS output sanitizes newlines, semicolons, commas, and backslashes via `escapeICS` / `escapeSummary` to prevent ICS header/property injection.
  - Ensure private memos (`hae_memo`, `dawon_memo`) are never leaked into the public ICS feed (only public `memo` and shift codes should appear).
- **Supabase Data Integrity**:
  - Ensure client-side calls only use the public anon key with Row Level Security (RLS) enabled on `public.couple_calendar`.

## Phase 3: Candidate Validation & Reporting
- Confirm each finding against the actual code path before reporting.
- Classify severity (`Critical`, `High`, `Medium`, `Low`, `Informational`) with exact file and line references and minimal-diff remediation.
