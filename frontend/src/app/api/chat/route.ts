import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Load backend URL from environment, fallback to localhost
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    // Proxy request directly to FastAPI backend stream endpoint
    const backendResponse = await fetch(`${backendUrl}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: body.message,
        model_choice: body.model_choice || "auto",
        image: body.image || null, // Forward optional base64 image data
        active_file_path: body.active_file_path || null,
        active_file_content: body.active_file_content || null,
        project_path: body.project_path || null,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: backendResponse.status }
      );
    }

    // Return the response body stream to the client
    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Next.js proxy route failed:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
