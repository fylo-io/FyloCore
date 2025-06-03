import axios from "axios";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const cookies = parse(request.headers.get("cookie") || "");
  const session = cookies.zotero_session;

  if (!session) {
    return NextResponse.json(
      { error: "No active session found. Please connect to Zotero." },
      { status: 401 }
    );
  }

  const { access_token, userID } = JSON.parse(session);

  try {
    const collectionsResponse = await axios.get(
      `https://api.zotero.org/users/${userID}/collections`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    const itemsResponse = await axios.get(`https://api.zotero.org/users/${userID}/items`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    return NextResponse.json({
      collections: collectionsResponse.data,
      items: itemsResponse.data
    });
  } catch (error) {
    console.error("Error fetching Zotero data:", error);
    return NextResponse.json({ error: "Failed to fetch Zotero data." }, { status: 500 });
  }
};
