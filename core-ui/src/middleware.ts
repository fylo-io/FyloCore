import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ req }) => {
      const sessionToken = req.cookies.get("next-auth.session-token");
      if (sessionToken) {
        return true;
      }
      const url = req.nextUrl.clone();
      url.pathname = "/";
      NextResponse.redirect(url);
      return false;
    }
  },
  pages: {
    signIn: "/"
  }
});

export const config = {
  matcher: ["/((?!login|signup|images|graph|verify-email|download|^/$).*)"]
};
