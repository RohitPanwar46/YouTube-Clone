import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
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
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data) {
            return data; // IMPORTANT: This will be passed to jwt as `user`
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
        token.id = user.data.user._id;
        token.accessToken = user.data.accessToken;
        token.refreshToken = user.data.refreshToken;
        token.name = user.data.user.fullName || user.data.user.username;
        token.email = user.data.user.email;
        token.avatar = user.data.user.avatar;
        token.coverImage = user.data.user.coverImage || null;
        token.watchHistory = user.data.user.watchHistory || [];
      }
      return token;
    },
    async session({ session, token }) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.avatar = token.avatar;
        session.user.coverImage = token.coverImage;
        session.user.watchHistory = token.watchHistory;

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
