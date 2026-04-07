import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { detectContactType, normalizeContact } from "./contact";

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
      },
      async authorize(credentials) {
        if (!credentials?.contact || !credentials?.password) return null;

        const contact = credentials.contact as string;
        const password = credentials.password as string;
        const type = detectContactType(contact);
        const normalized = normalizeContact(contact, type);

        let user;
        if (type === "email") {
          user = await prisma.webUser.findFirst({ where: { email: normalized } });
        } else if (type === "phone") {
          user = await prisma.webUser.findFirst({ where: { phone: normalized } });
        } else {
          user = await prisma.webUser.findFirst({ where: { telegramUsername: normalized } });
        }

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

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
