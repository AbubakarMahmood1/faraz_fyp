import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!account) return false;

        // Call our backend social login endpoint
        const response = await axios.post(
          `${API_BASE_URL}/social-login`,
          {
            provider: account.provider,
            providerId: account.providerAccountId,
            email: user.email,
            username: user.name || user.email?.split('@')[0],
            registerAs: 'explorer', // Default role
          }
        );

        if (response.data.status === 'success') {
          // Store backend token in user object (will be passed to JWT callback)
          user.backendToken = response.data.token;
          user.userId = response.data.data.user.id;
          user.username = response.data.data.user.username;
          user.registerAs = response.data.data.user.registerAs;
          user.profileCompleted = response.data.data.user.profileCompleted;
          return true;
        }

        return false;
      } catch (error) {
        console.error('Social login error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // Add backend data to token on initial signin
      if (user) {
        token.backendToken = user.backendToken;
        token.userId = user.userId;
        token.username = user.username;
        token.registerAs = user.registerAs;
        token.profileCompleted = user.profileCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      // Add backend data to session
      if (token && session.user) {
        session.user.backendToken = token.backendToken as string;
        session.user.userId = token.userId as string;
        session.user.username = token.username as string;
        session.user.registerAs = token.registerAs as string;
        session.user.profileCompleted = token.profileCompleted as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
