import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import OAuth from "oauth";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { ZOTERO_CLIENT_KEY, ZOTERO_CLIENT_SECRET, ZOTERO_CALLBACK_URL } = process.env;

  if (!ZOTERO_CLIENT_KEY || !ZOTERO_CLIENT_SECRET || !ZOTERO_CALLBACK_URL) {
    console.error("Missing environment variables.");
    return NextResponse.json({ error: "Missing environment variables." }, { status: 500 });
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "/";

  const oauth = new OAuth.OAuth(
    "https://www.zotero.org/oauth/request",
    "https://www.zotero.org/oauth/access",
    ZOTERO_CLIENT_KEY,
    ZOTERO_CLIENT_SECRET,
    "1.0A",
    ZOTERO_CALLBACK_URL,
    "HMAC-SHA1"
  );

  return new Promise((resolve, reject) => {
    oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret) => {
      if (error) {
        console.error("Error fetching request token:", error);
        return reject(
          NextResponse.json({ error: "Failed to get request token." }, { status: 500 })
        );
      }

      const tokenSecretCookie = serialize("oauth_token_secret", oauth_token_secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
      });

      const stateCookie = serialize("state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
      });

      const response = NextResponse.redirect(
        `https://www.zotero.org/oauth/authorize?oauth_token=${oauth_token}`
      );
      response.headers.append("Set-Cookie", tokenSecretCookie);
      response.headers.append("Set-Cookie", stateCookie);

      resolve(response);
    });
  });
};
