import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const tokenConfigured = !!process.env.CONTENT_EDIT_TOKEN;
    const isDevelopment = process.env.NODE_ENV === "development";

    // En producción, siempre requerir auth manual si el token está configurado
    // En desarrollo, si el token está configurado, no requiere auth manual
    const requiresAuth = isDevelopment ? !tokenConfigured : true;

    return NextResponse.json({
      tokenConfigured,
      requiresAuth,
      isDevelopment,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check auth status" },
      { status: 500 }
    );
  }
}

