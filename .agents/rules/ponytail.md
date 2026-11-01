# Ponytail Ruleset (YAGNI & Minimal Change Principle)

Based on [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) — "Think like a pragmatic senior developer."

## Core Rules for `couple-calendar-new`

1. **Preserve Existing UI & Data Layout**
   - Do NOT alter the current visual design, color palette, 4-tab layout (`캘린더`, `디데이`, `기록`, `관리·위젯`), or 5-stage salary calculator layout unless explicitly requested by the user.
   - Do NOT introduce unsolicited design refactors, animations, or layout shifts.

2. **YAGNI (You Aren't Gonna Need It)**
   - Implement only what is directly requested.
   - Avoid adding speculative abstractions, extra state management libraries, or heavy third-party dependencies when React Native / Expo built-ins and standard TypeScript suffice.

3. **Minimal, Surgical Diffs**
   - Keep code modifications focused on the exact bug or feature requested.
   - Preserve existing data contracts with Supabase (`couple_calendar` table rows, `1970-01-01` history sync, `1970-01-02` profile config sync) and `AsyncStorage` keys.

4. **Zero Hardcoded Personal Identifiers**
   - Never hardcode personal real names or plaintext PINs in source files, comments, or documentation.
   - Always use configurable `leftName` / `rightName` state and salted SHA-256 PIN verification (`src/utils/security.ts`).
