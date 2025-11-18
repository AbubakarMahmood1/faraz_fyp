import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      backendToken?: string;
      userId?: string;
      username?: string;
      registerAs?: string;
      profileCompleted?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    backendToken?: string;
    userId?: string;
    username?: string;
    registerAs?: string;
    profileCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    userId?: string;
    username?: string;
    registerAs?: string;
    profileCompleted?: boolean;
  }
}
