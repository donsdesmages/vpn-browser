export type ContactType = "email" | "phone" | "telegram";

export function detectContactType(value: string): ContactType {
  const v = value.trim();
  if (v.startsWith("@") || /^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(v)) return "telegram";
  if (v.startsWith("+") || /^[78]\d{9,10}$/.test(v.replace(/\D/g, ""))) return "phone";
  return "email";
}

export function normalizeContact(value: string, type: ContactType): string {
  if (type === "telegram") return value.replace(/^@/, "").toLowerCase();
  if (type === "phone") return "+" + value.replace(/\D/g, "").replace(/^8/, "7");
  return value.trim().toLowerCase();
}

export const CONTACT_LABELS: Record<ContactType, string> = {
  email: "Email",
  phone: "Телефон",
  telegram: "Telegram",
};

export const CONTACT_ICONS: Record<ContactType, string> = {
  email: "✉️",
  phone: "📱",
  telegram: "✈️",
};
