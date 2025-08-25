import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

async function refreshAccessToken(refreshToken) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/users/refresh-token`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`
      },
      
    });

    const data = await res.json();

    if (res.ok) {
      return {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      };
    }

    throw new Error(data.message || "Failed to refresh access token");
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
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

          if (res.ok && payload) {
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
            }; // IMPORTANT: This will be passed to jwt as `user`
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
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
        token.coverImage = user.coverImage;
        token.watchHistory = user.watchHistory;
      }

      if(token?.accessToken){
        const decoded = jwtDecode(token.accessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          // Access token expired, try to refresh it
          const newTokens = await refreshAccessToken(token.refreshToken);
          token.accessToken = newTokens.accessToken;
          token.refreshToken = newTokens.refreshToken;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if(token){
        session.user.id = token.id;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.avatar = token.avatar;
        session.user.coverImage = token.coverImage;
        session.user.watchHistory = token.watchHistory;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
