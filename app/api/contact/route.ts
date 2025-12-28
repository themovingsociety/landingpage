import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/contact-schema";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar los datos con Zod
        const validationResult = contactFormSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const {
            name,
            email,
            country,
            sports,
            hobbiesAndInterests,
            business,
            lastTrips,
            comments,
        } = validationResult.data;

        // Verificar que la variable de entorno esté configurada
        const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();

        if (!accessKey) {
            return NextResponse.json(
                {
                    error: "Server configuration error",
                    message: "Web3Forms access key is not configured",
                },
                { status: 500 }
            );
        }

        // Configurar el email HTML para Web3Forms
        const htmlContent = `
            <h2>New Request Access</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Country:</strong> ${country}</p>
            <p><strong>Sports:</strong> ${sports.replace(/\n/g, "<br>")}</p>
            <p><strong>Hobbies and interests:</strong> ${hobbiesAndInterests.replace(/\n/g, "<br>")}</p>
            <p><strong>Business:</strong> ${business.replace(/\n/g, "<br>")}</p>
            <p><strong>Last trips:</strong> ${lastTrips.replace(/\n/g, "<br>")}</p>
            <p><strong>Comments:</strong></p>
            <p>${comments.replace(/\n/g, "<br>")}</p>
        `;

        // Preparar los datos para Web3Forms usando URLSearchParams
        // (compatible con Node.js sin necesidad de bibliotecas adicionales)
        const formData = new URLSearchParams();
        formData.append("access_key", accessKey);
        formData.append("subject", `Request Access - ${name}`);
        formData.append("from_name", name);
        formData.append("email", email);
        formData.append("name", name);
        formData.append("country", country);
        formData.append("sports", sports);
        formData.append("hobbies_and_interests", hobbiesAndInterests);
        formData.append("business", business);
        formData.append("last_trips", lastTrips);
        formData.append("comments", comments);
        formData.append("html", htmlContent);

        // Enviar a Web3Forms
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });

        // Verificar el Content-Type antes de parsear
        const contentType = response.headers.get("content-type");
        let result;

        if (contentType && contentType.includes("application/json")) {
            result = await response.json();
        } else {
            const text = await response.text();

            if (response.status === 403) {
                throw new Error(
                    `Web3Forms API returned 403 Forbidden. Please verify your access key is correct and active.`
                );
            }

            throw new Error(
                `Web3Forms API returned an error. Status: ${response.status}. Please check your access key and configuration.`
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to send email via Web3Forms");
        }

        return NextResponse.json(
            {
                success: true,
                message: "Email sent successfully",
            },
            { status: 200 }
        );
    } catch (error) {

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    error: "Failed to send email",
                    message: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}

