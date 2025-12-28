import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import type { HeroContent, PortfolioContent, ContactContent } from "@/types/cms";

// GET: Obtener contenido actual
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const section = searchParams.get("section");

        if (!section || !["hero", "portfolio", "contact"].includes(section)) {
            return NextResponse.json(
                { error: "Invalid section. Must be: hero, portfolio, or contact" },
                { status: 400 }
            );
        }

        const filePath = join(process.cwd(), "content", `${section}.json`);
        const fileContents = await readFile(filePath, "utf-8");
        const content = JSON.parse(fileContents);

        return NextResponse.json({ success: true, data: content });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to read content" },
            { status: 500 }
        );
    }
}

// PUT: Actualizar contenido
export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const expectedToken = process.env.CONTENT_EDIT_TOKEN;

        if (expectedToken) {
            if (authHeader && authHeader !== `Bearer ${expectedToken}`) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            // Esto funciona tanto en desarrollo como en producción
        }

        const body = await request.json();
        const { section, data } = body;

        if (!section || !["hero", "portfolio", "contact"].includes(section)) {
            return NextResponse.json(
                { error: "Invalid section. Must be: hero, portfolio, or contact" },
                { status: 400 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Data is required" },
                { status: 400 }
            );
        }

        // Validar estructura básica según la sección
        if (section === "hero") {
            if (!data.title || !data.ctaText || !data.ctaLink) {
                return NextResponse.json(
                    { error: "Invalid hero data structure" },
                    { status: 400 }
                );
            }
        } else if (section === "portfolio") {
            if (!data.title || !data.subtitle || !Array.isArray(data.items)) {
                return NextResponse.json(
                    { error: "Invalid portfolio data structure" },
                    { status: 400 }
                );
            }
        } else if (section === "contact") {
            if (!data.title || !data.subtitle || !data.email) {
                return NextResponse.json(
                    { error: "Invalid contact data structure" },
                    { status: 400 }
                );
            }
        }

        // Escribir el archivo JSON
        const filePath = join(process.cwd(), "content", `${section}.json`);
        await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

        // Opcional: Trigger redeploy automático si está configurado
        const autoRedeploy = process.env.AUTO_REDEPLOY === "true";
        if (autoRedeploy) {
            try {
                // Llamar al endpoint de redeploy en segundo plano (no esperar respuesta)
                fetch(`${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/redeploy`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${expectedToken || ""}`,
                    },
        }).catch(() => {
          // Error silencioso por seguridad
        });
      } catch {
        // Error silencioso por seguridad
      }
        }

        return NextResponse.json({
            success: true,
            message: `${section} content updated successfully`,
            redeployTriggered: autoRedeploy,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update content" },
            { status: 500 }
        );
    }
}

