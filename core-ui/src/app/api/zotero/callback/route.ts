import { parse, serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import OAuth from "oauth";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { ZOTERO_CLIENT_KEY, ZOTERO_CLIENT_SECRET } = process.env;

  const url = new URL(request.url);
  const oauth_token = url.searchParams.get("oauth_token");
  const oauth_verifier = url.searchParams.get("oauth_verifier");

  const cookies = parse(request.headers.get("cookie") || "");
  const oauth_token_secret = cookies.oauth_token_secret;
  const state = cookies.state;

  if (!oauth_token || !oauth_verifier) {
    return NextResponse.json({ error: "Missing required query parameters." }, { status: 400 });
  }

  if (!oauth_token_secret) {
    return NextResponse.json({ error: "Missing or invalid oauth_token_secret." }, { status: 400 });
  }

  if (!state) {
    return NextResponse.json({ error: "Missing state parameter." }, { status: 400 });
  }

  const oauth = new OAuth.OAuth(
    "https://www.zotero.org/oauth/request",
    "https://www.zotero.org/oauth/access",
    ZOTERO_CLIENT_KEY!,
    ZOTERO_CLIENT_SECRET!,
    "1.0A",
    null,
    "HMAC-SHA1"
  );

  return new Promise<NextResponse>((resolve, reject) => {
    oauth.getOAuthAccessToken(
      oauth_token,
      oauth_token_secret,
      oauth_verifier,
      async (error, access_token, access_token_secret, results) => {
        if (error) {
          return reject(
            NextResponse.json({ error: "Failed to get access token." }, { status: 500 })
          );
        }

        const userID = results.userID;

        if (!userID) {
          return resolve(
            NextResponse.json({ error: "Failed to extract userID." }, { status: 500 })
          );
        }

        const sessionCookie = serialize(
          "zotero_session",
          JSON.stringify({ access_token, userID }),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
          }
        );

        const redirectedUrl = new URL(decodeURIComponent(state));
        redirectedUrl.searchParams.append("auth_success", "true");

        const response = NextResponse.redirect(redirectedUrl);
        response.headers.append("Set-Cookie", sessionCookie);

        resolve(response);
      }
    );
  });
};
