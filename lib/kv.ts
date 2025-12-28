import { createClient } from "redis";
import type { HeroContent, PortfolioContent, ContactContent } from "@/types/cms";

// Claves para almacenar el contenido en KV
const KV_KEYS = {
    hero: "content:hero",
    portfolio: "content:portfolio",
    contact: "content:contact",
} as const;

type SectionType = "hero" | "portfolio" | "contact";

// Cliente Redis singleton
let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Obtener o crear el cliente Redis
 */
async function getRedisClient() {
    if (redisClient) {
        return redisClient;
    }

    if (!isKVConfigured()) {
        throw new Error("Vercel KV not configured");
    }

    // Para Vercel KV, usar las variables de entorno REST API
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
        throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN must be set");
    }

    // Crear cliente Redis con autenticación
    redisClient = createClient({
        url: url,
        password: token,
    });

    redisClient.on("error", (err) => {
        console.error("Redis Client Error", err);
    });

    await redisClient.connect();
    return redisClient;
}

/**
 * Obtener contenido desde Vercel KV
 */
export async function getContentFromKV<T>(
    section: SectionType
): Promise<T | null> {
    try {
        const client = await getRedisClient();
        const key = KV_KEYS[section];
        const content = await client.get(key);

        if (!content) {
            return null;
        }

        return JSON.parse(content) as T;
    } catch (error) {
        return null;
    }
}

/**
 * Guardar contenido en Vercel KV
 */
export async function saveContentToKV<T>(
    section: SectionType,
    data: T
): Promise<boolean> {
    try {
        const client = await getRedisClient();
        const key = KV_KEYS[section];
        await client.set(key, JSON.stringify(data));
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Verificar si KV está configurado
 */
export function isKVConfigured(): boolean {
    return !!(
        process.env.KV_REST_API_URL &&
        process.env.KV_REST_API_TOKEN
    );
}

/**
 * Cerrar la conexión Redis (útil para scripts)
 */
export async function closeRedisConnection() {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}

