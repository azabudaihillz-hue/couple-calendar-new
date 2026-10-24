import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 🔒 Pure JavaScript SHA-256 implementation
 * - Works identically across React Native iOS, Android, and Web without native dependencies
 */
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let compositeAscii = ascii + '\x80';
  while (compositeAscii[lengthProperty] % 64 - 56) compositeAscii += '\x00';

  for (i = 0; i < compositeAscii[lengthProperty]; i++) {
    j = compositeAscii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sA = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const sE = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);

      const temp1 = hash[7] + sE + ch + k[i] + w[i];
      const temp2 = sA + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

const PIN_SALT = 'couple_vault_v1_';
const STORAGE_PIN_HASH_KEY = '@admin_vault_pin_hash';
const STORAGE_LOCK_UNTIL_KEY = '@admin_vault_lock_until';
const STORAGE_FAIL_COUNT_KEY = '@admin_vault_fail_count';

// 🔐 소스코드 내 평문 PIN 완전 배제 (솔트 적용된 64자리 단방향 해시만 탑재)
// 사용자 PIN: 'couple_vault_v1_' + 초기 PIN 해시
const DEFAULT_SALTED_PIN_HASH = '1e9209557e240eb689d3c37a9340259f736fd76e198b80b32703a4af5fea9e67';

export const hashVaultPin = (pin: string): string => {
  return sha256(PIN_SALT + pin);
};

export const getStoredPinHash = async (): Promise<string> => {
  try {
    const envHash = process.env.EXPO_PUBLIC_ADMIN_PIN_HASH;
    if (envHash && envHash.length === 64) return envHash;
    const localHash = await AsyncStorage.getItem(STORAGE_PIN_HASH_KEY);
    return localHash || DEFAULT_SALTED_PIN_HASH;
  } catch {
    return DEFAULT_SALTED_PIN_HASH;
  }
};

export const updateVaultPin = async (newPin: string): Promise<boolean> => {
  if (!newPin || newPin.length < 4) return false;
  try {
    const newHash = hashVaultPin(newPin);
    await AsyncStorage.setItem(STORAGE_PIN_HASH_KEY, newHash);
    return true;
  } catch (e) {
    console.error('Failed to update vault pin', e);
    return false;
  }
};

/**
 * 🛡️ 5회 연속 오류 시 60초간 잠금 로직
 */
const MAX_FAIL_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60초

export interface LockStatus {
  isLocked: boolean;
  remainingSeconds: number;
}

export const checkVaultLockStatus = async (): Promise<LockStatus> => {
  try {
    const lockUntilStr = await AsyncStorage.getItem(STORAGE_LOCK_UNTIL_KEY);
    if (!lockUntilStr) return { isLocked: false, remainingSeconds: 0 };

    const lockUntil = parseInt(lockUntilStr, 10);
    const now = Date.now();
    if (now < lockUntil) {
      const remainingSeconds = Math.ceil((lockUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    } else {
      // 잠금 시간 경과 시 해제
      await AsyncStorage.removeItem(STORAGE_LOCK_UNTIL_KEY);
      await AsyncStorage.removeItem(STORAGE_FAIL_COUNT_KEY);
      return { isLocked: false, remainingSeconds: 0 };
    }
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
};

export const recordVaultPinFailure = async (): Promise<{
  isLocked: boolean;
  remainingSeconds: number;
  failedCount: number;
}> => {
  try {
    const countStr = await AsyncStorage.getItem(STORAGE_FAIL_COUNT_KEY);
    const count = (countStr ? parseInt(countStr, 10) : 0) + 1;
    await AsyncStorage.setItem(STORAGE_FAIL_COUNT_KEY, count.toString());

    if (count >= MAX_FAIL_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
      await AsyncStorage.setItem(STORAGE_LOCK_UNTIL_KEY, lockUntil.toString());
      return { isLocked: true, remainingSeconds: 60, failedCount: count };
    }

    return { isLocked: false, remainingSeconds: 0, failedCount: count };
  } catch {
    return { isLocked: false, remainingSeconds: 0, failedCount: 1 };
  }
};

export const resetVaultPinFailures = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_FAIL_COUNT_KEY);
    await AsyncStorage.removeItem(STORAGE_LOCK_UNTIL_KEY);
  } catch (e) {
    console.error('Reset failures error', e);
  }
};

export const verifyVaultPin = async (enteredPin: string): Promise<boolean> => {
  const status = await checkVaultLockStatus();
  if (status.isLocked) return false;

  const expectedHash = await getStoredPinHash();
  const actualHash = hashVaultPin(enteredPin);

  if (actualHash === expectedHash) {
    await resetVaultPinFailures();
    return true;
  } else {
    await recordVaultPinFailure();
    return false;
  }
};
