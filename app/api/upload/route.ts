import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const authHeader = request.headers.get("authorization");
        const expectedToken = process.env.CONTENT_EDIT_TOKEN;

        if (expectedToken) {
            if (authHeader && authHeader !== `Bearer ${expectedToken}`) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        // Verificar que Cloudinary esté configurado
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json(
                { error: "Cloudinary not configured" },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Convertir File a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Subir a Cloudinary usando upload_stream
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "landing-page",
                    resource_type: "auto", // Detecta automáticamente si es imagen o video
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            uploadStream.end(buffer);
        });

        const result = await uploadPromise as any;

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            resourceType: result.resource_type,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

