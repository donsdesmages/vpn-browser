import crypto from "crypto";
import { prisma } from "./prisma";

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createOtp(
  webUserId: number,
  tokenType: "otp" | "link"
): Promise<{ token: string; code: string }> {
  const token = generateToken();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.webOtpToken.create({
    data: { webUserId, token, tokenType, code, expiresAt },
  });

  return { token, code };
}

export async function verifyOtp(
  token: string,
  code: string
): Promise<number | null> {
  const otp = await prisma.webOtpToken.findUnique({ where: { token } });

  if (
    !otp ||
    otp.used ||
    otp.code !== code ||
    otp.expiresAt < new Date()
  ) {
    return null;
  }

  await prisma.webOtpToken.update({ where: { id: otp.id }, data: { used: true } });
  return otp.webUserId;
}

export async function createLinkToken(webUserId: number): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await prisma.webOtpToken.create({
    data: { webUserId, token, tokenType: "link", expiresAt },
  });

  return token;
}

export async function consumeLinkToken(token: string): Promise<number | null> {
  const otp = await prisma.webOtpToken.findUnique({ where: { token } });

  if (!otp || otp.used || otp.tokenType !== "link" || otp.expiresAt < new Date()) {
    return null;
  }

  await prisma.webOtpToken.update({ where: { id: otp.id }, data: { used: true } });
  return otp.webUserId;
}
