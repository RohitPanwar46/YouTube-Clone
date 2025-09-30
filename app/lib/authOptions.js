// [...nextauth].js
import CredentialsProvider from "next-auth/providers/credentials";
import {jwtDecode} from "jwt-decode"; // default import // optional - server-side fetch is available in Node/Next
import { redirect } from "next/navigation";

async function refreshAccessToken(refreshToken) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/users/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      // backend returned error (invalid/expired refresh token)
      redirect("/login?error=SessionExpired");
    }

    return {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null; // caller will handle null (refresh failed)
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const payload = await res.json();
          if (res.ok && payload?.data?.user) {
            return {
              id: payload.data.user._id,
              email: payload.data.user.email,
              username: payload.data.user.username,
              accessToken: payload.data.accessToken,
              refreshToken: payload.data.refreshToken,
              name: payload.data.user.fullName || payload.data.user.username,
              avatar: payload.data.user.avatar,
              coverImage: payload.data.user.coverImage || null,
              watchHistory: payload.data.user.watchHistory || [],
            };
          }
          return null;
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    // optional: maxAge: 60 * 60 * 24 * 30, // 30 days
  },

  callbacks: {
    // jwt runs on server and can store refreshToken safely in the token
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken; // store in token (server-side)
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
        token.coverImage = user.coverImage;
        token.watchHistory = user.watchHistory;
        // store access token expiry to avoid repeated decode
        try {
          const decoded = jwtDecode(token.accessToken);
          token.accessTokenExpires = decoded.exp; // seconds since epoch
        } catch (e) {
          token.accessTokenExpires = Math.floor(Date.now() / 1000) + 60 * 15; // fallback
        }
      }

      // If we have an access token and expiry
      const currentTime = Math.floor(Date.now() / 1000);
      if (token?.accessToken && token?.accessTokenExpires) {
        // If not expired yet, just return token
        if (token.accessTokenExpires > currentTime + 5) {
          // still valid (with 5s buffer)
          return token;
        }

        // Access token expired -> try refresh
        if (!token.refreshToken) {
          // no refresh token available — force re-login
          token.error = "NoRefreshToken";
          return token;
        }

        const newTokens = await refreshAccessToken(token.refreshToken);

        if (!newTokens) {
          // Refresh failed
          token.error = "RefreshAccessTokenError";
          return token;
        }

        // Success: update tokens and expiry
        token.accessToken = newTokens.accessToken;
        token.refreshToken = newTokens.refreshToken;
        try {
          const decoded = jwtDecode(token.accessToken);
          token.accessTokenExpires = decoded.exp;
        } catch (e) {
          token.accessTokenExpires = Math.floor(Date.now() / 1000) + 60 * 15;
        }
      }

      return token;
    },

    // session is returned to the client — DO NOT expose refreshToken here
    async session({ session, token }) {
      if (!session.user) session.user = {};
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.avatar = token.avatar;
      session.user.coverImage = token.coverImage;
      session.user.watchHistory = token.watchHistory;

      // Expose accessToken (short-lived) so client can call backend if needed
      session.accessToken = token.accessToken;
      // Do NOT add session.refreshToken = token.refreshToken  <--- security risk

      // Expose an error field so client-side can detect refresh problems
      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
