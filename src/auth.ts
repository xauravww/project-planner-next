import { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Extend session type to include user id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Rate limit by IP would go here, but we don't have access to req
                // Implement in middleware instead

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // Use constant-time comparison to prevent timing attacks
                // Always run bcrypt even if user not found (on dummy hash)
                const dummyHash = "$2a$10$dummy.hash.for.timing.attack.prevention";
                const passwordToCompare = user?.password || dummyHash;
                
                const passwordsMatch = await bcrypt.compare(
                    credentials.password,
                    passwordToCompare
                );

                if (!user || !passwordsMatch) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);
