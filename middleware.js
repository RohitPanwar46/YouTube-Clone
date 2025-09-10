// middleware.js
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // here we can add logics and update the request
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow if user is logged in
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/edit/:path*",
    "/upload/:path*",
    "/dashboard/:path*",
    "/playlist/:path*",
    "/subscriptions/:path*",
    "/channel/:path*",
    "/history/:path*",
  ], // add routes here to protect
};
