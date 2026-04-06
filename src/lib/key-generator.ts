const BASE_URL = process.env.KEY_GENERATOR_URL || "http://key-generator:8080";

// Суррогатный telegramId для веб-пользователей
export function toSurrogateTelegramId(webUserId: number): number {
  return webUserId + 9_000_000_000_000;
}

export interface UserInfo {
  active: boolean;
  expiringDate: string | null;
  accessKey: string | null;
}

export async function getUserInfo(telegramId: number): Promise<UserInfo> {
  const res = await fetch(
    `${BASE_URL}/api/internal/v1/user-info?telegramId=${telegramId}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    return { active: false, expiringDate: null, accessKey: null };
  }
  const data = await res.json();
  return {
    active: data.active ?? false,
    expiringDate: data.expiringDate ?? null,
    accessKey: data.accessKey ?? null,
  };
}

export async function generateKey(
  telegramId: number,
  email: string,
  durationSeconds: number
): Promise<void> {
  const params = new URLSearchParams({
    telegramId: String(telegramId),
    email,
    durationSeconds: String(durationSeconds),
  });
  const res = await fetch(
    `${BASE_URL}/api/internal/v1/key-generator?${params}`,
    { method: "POST" }
  );
  if (!res.ok) {
    throw new Error(`key-generator error: ${res.status}`);
  }
}

export async function removeUser(telegramId: number): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/api/internal/v1/user-remove?telegramId=${telegramId}`,
    { method: "POST" }
  );
  if (!res.ok) {
    throw new Error(`key-generator remove error: ${res.status}`);
  }
}
