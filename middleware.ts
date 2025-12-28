import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

  // Proteger todas las rutas de admin excepto login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!session) {
      // Redirigir a login si no está autenticado
      const loginUrl = new URL("/admin/login", request.url);
      // Agregar el path original como query para redirigir después del login
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Permitir acceso a login solo si no está autenticado
  if (pathname === "/admin/login") {
    if (session) {
      // Si ya está autenticado, redirigir al panel
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Excluir archivos estáticos y API routes de auth
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

