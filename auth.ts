import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

function getPasswordHash(): string {
    let hash = (process.env.ADMIN_PASSWORD_HASH || "").trim();

    if (hash && !hash.startsWith("$2b$") && hash.length === 52) {
        const dollar = String.fromCharCode(36);
        const prefix = dollar + "2b" + dollar + "10" + dollar + "e";
        return prefix + hash;
    }

    return hash;
}

const users = [
    {
        id: "1",
        username: process.env.ADMIN_USERNAME || "",
        passwordHash: getPasswordHash(),
    },
];

async function verifyCredentials(
    username: string,
    password: string
): Promise<{ id: string; username: string } | null> {
    const user = users.find((u) => u.username === username);
    if (!user) {
        return null;
    }

    if (!user.passwordHash || user.passwordHash.trim() === "") {
        return null;
    }

    const cleanHash = user.passwordHash.trim();

    try {
        const isValid = await bcrypt.compare(password, cleanHash);
        if (isValid) {
            return { id: user.id, username: user.username };
        }
    } catch {
        return null;
    }

    return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Usuario", type: "text" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const user = await verifyCredentials(
                    credentials.username as string,
                    credentials.password as string
                );

                if (user) {
                    return {
                        id: user.id,
                        name: user.username,
                    };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

