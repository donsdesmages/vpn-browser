import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { detectContactType, normalizeContact } from "./contact";
import { verifyOtp } from "./otp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        contact: { label: "Contact", type: "text" },
        password: { label: "Password", type: "password" },
        otpToken: { label: "OTP Token", type: "text" },
        otpCode: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        // OTP flow
        if (credentials?.otpToken && credentials?.otpCode) {
          const userId = await verifyOtp(
            credentials.otpToken as string,
            credentials.otpCode as string
          );
          if (!userId) return null;
          const user = await prisma.webUser.findUnique({ where: { id: userId } });
          if (!user) return null;
          return { id: String(user.id), email: user.email };
        }

        // Password flow
        if (!credentials?.contact || !credentials?.password) return null;

        const type = detectContactType(credentials.contact as string);
        const normalized = normalizeContact(credentials.contact as string, type);

        let user;
        if (type === "email") {
          user = await prisma.webUser.findFirst({ where: { email: normalized } });
        } else if (type === "phone") {
          user = await prisma.webUser.findFirst({ where: { phone: normalized } });
        } else {
          user = await prisma.webUser.findFirst({ where: { telegramUsername: normalized } });
        }

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        return { id: String(user.id), email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
