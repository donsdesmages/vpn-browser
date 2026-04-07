import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
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
        email: { label: "Email", type: "email" },
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
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.webUser.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
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
