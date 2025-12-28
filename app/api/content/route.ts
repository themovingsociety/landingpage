import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import type { HeroContent, PortfolioContent, ContactContent } from "@/types/cms";
import { getContentFromKV, saveContentToKV, isKVConfigured } from "@/lib/kv";

// GET: Obtener contenido actual
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const section = searchParams.get("section") as "hero" | "portfolio" | "contact" | null;

        if (!section || !["hero", "portfolio", "contact"].includes(section)) {
            return NextResponse.json(
                { error: "Invalid section. Must be: hero, portfolio, or contact" },
                { status: 400 }
            );
        }

        // Intentar obtener desde KV primero
        if (isKVConfigured()) {
            const kvContent = await getContentFromKV<HeroContent | PortfolioContent | ContactContent>(section);
            if (kvContent) {
                return NextResponse.json({ success: true, data: kvContent });
            }
        }

        // Fallback a archivos JSON
        try {
            const filePath = join(process.cwd(), "content", `${section}.json`);
            const fileContents = await readFile(filePath, "utf-8");
            const content = JSON.parse(fileContents);
            return NextResponse.json({ success: true, data: content });
        } catch {
            return NextResponse.json(
                { error: "Content not found" },
                { status: 404 }
            );
        }
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

        // Guardar contenido: Priorizar Vercel KV, luego archivos JSON
        let savedToKV = false;
        let savedToFile = false;

        // Intentar guardar en KV primero (si está configurado)
        if (isKVConfigured()) {
            savedToKV = await saveContentToKV(section, data);
        }

        // También guardar en archivo JSON como backup (solo en desarrollo o si KV falló)
        if (!savedToKV || process.env.NODE_ENV === "development") {
            try {
                const contentDir = join(process.cwd(), "content");
                const filePath = join(contentDir, `${section}.json`);

                // Asegurar que el directorio content existe
                if (!existsSync(contentDir)) {
                    await mkdir(contentDir, { recursive: true });
                }

                // Escribir el archivo
                await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
                savedToFile = true;
            } catch (writeError) {
                // Si KV falló y el archivo también falla, reportar error
                if (!savedToKV) {
                    const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);

                    if (errorMessage.includes("EACCES") || errorMessage.includes("EROFS") || errorMessage.includes("read-only") || errorMessage.includes("ENOENT")) {
                        return NextResponse.json(
                            {
                                error: "Cannot write to filesystem. Please configure Vercel KV for production.",
                                requiresKV: true
                            },
                            { status: 503 }
                        );
                    }
                    throw writeError;
                }
            }
        }

        // Si no se guardó en ningún lugar, error
        if (!savedToKV && !savedToFile) {
            return NextResponse.json(
                {
                    error: "Failed to save content. Please check Vercel KV configuration.",
                    requiresKV: true
                },
                { status: 500 }
            );
        }

        // Ya no necesitamos redeploy automático porque KV persiste los cambios
        // El contenido se actualiza inmediatamente sin necesidad de redeploy

        return NextResponse.json({
            success: true,
            message: `${section} content updated successfully`,
            savedToKV: savedToKV,
            savedToFile: savedToFile,
        });
    } catch (error) {
        // Log del error para debugging (solo en servidor, no se expone al cliente)
        if (process.env.NODE_ENV === "development") {
            console.error("Error updating content:", error);
        }

        // Determinar el tipo de error
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Si es un error de escritura de archivo, dar mensaje específico
        if (errorMessage.includes("EACCES") || errorMessage.includes("EROFS") || errorMessage.includes("read-only")) {
            return NextResponse.json(
                {
                    error: "Filesystem is read-only. In production, content changes require a Git commit and redeploy.",
                    requiresRedeploy: true
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update content" },
            { status: 500 }
        );
    }
}

