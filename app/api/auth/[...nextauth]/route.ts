import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Adapter } from "next-auth/adapters";
import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import { User as NextAuthUser } from "next-auth";
import bcrypt from "bcrypt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      // Add other custom properties here
    } & DefaultSession["user"];
  }

  interface User extends NextAuthUser {
    role?: string;
  }
}

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "USER",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    process.env.APPLE_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_PRIVATE_KEY &&
    process.env.APPLE_KEY_ID
      ? AppleProvider({
          clientId: process.env.APPLE_ID!,
          teamId: process.env.APPLE_TEAM_ID!,
          privateKey: process.env.APPLE_PRIVATE_KEY!,
          keyId: process.env.APPLE_KEY_ID!,
          allowDangerousEmailAccountLinking: true,
        })
      : null,
  ].filter(Boolean),

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "credentials" && user) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.name,
              emailVerified: new Date(),
              profile: {
                create: {
                  firstName: user.name?.split(" ")[0],
                  lastName: user.name?.split(" ").slice(1).join(" "),
                },
              },
            },
          });
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role || "USER";
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });

        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
  },

  debug: process.env.NODE_ENV === "development",

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
