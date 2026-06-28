import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // When user signs in with Google, exchange for our backend JWT
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_token: account.id_token,
              name: profile?.name,
              email: profile?.email,
            }),
          });
          const data = await res.json();
          if (data.access_token) {
            token.backendToken = data.access_token;
          }
        } catch (e) {
          console.error("Failed to exchange Google token", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});
