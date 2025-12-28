import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const tokenConfigured = !!process.env.CONTENT_EDIT_TOKEN;
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json({
      tokenConfigured,
      requiresAuth: !tokenConfigured,
      isDevelopment,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check auth status" },
      { status: 500 }
    );
  }
}

