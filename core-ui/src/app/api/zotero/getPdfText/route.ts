import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Get session cookie and access token
    const cookies = parse(req.headers.get("cookie") || "");
    const session = cookies.zotero_session;
    const { access_token } = JSON.parse(session || "");

    // Extract file URL from the request body
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    return NextResponse.json({ url: `${fileUrl}?key=${access_token}` });
  } catch (error) {
    console.error("Error processing the PDF:", error);
    return NextResponse.json({ error: "Error processing the PDF" }, { status: 500 });
  }
};
