"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await fetch("/api/auth/csrf", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const token = data.csrfToken || data.token || data.csrf || "";
          if (token) {
            setCsrfToken(token);
          }
        }
      } catch {}
    };
    getCsrfToken();
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "MissingCSRF") {
        setError(
          "Error de seguridad. Por favor, recarga la página e intenta de nuevo."
        );
      } else if (errorParam === "CredentialsSignin") {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!csrfToken) {
      setError("Error de seguridad. Por favor, recarga la página.");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("csrfToken", csrfToken);
      params.append("username", username);
      params.append("password", password);
      params.append("redirect", "false");
      params.append("json", "true");

      const response = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: params.toString(),
      });

      if (response.redirected) {
        router.push("/admin");
        router.refresh();
        return;
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (result.error) {
          if (result.error === "CredentialsSignin") {
            setError("Usuario o contraseña incorrectos");
          } else if (result.error === "MissingCSRF") {
            setError(
              "Error de seguridad. Por favor, recarga la página e intenta de nuevo."
            );
            const csrfResponse = await fetch("/api/auth/csrf", {
              credentials: "include",
            });
            if (csrfResponse.ok) {
              const csrfData = await csrfResponse.json();
              setCsrfToken(csrfData.csrfToken || csrfData.token || "");
            }
          } else {
            setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
          }
        } else if (!result.error) {
          router.push("/admin");
          router.refresh();
        }
      } else if (response.ok) {
        // Si la respuesta es OK pero no es JSON, asumir éxito
        router.push("/admin");
        router.refresh();
      } else {
        setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Campo oculto para el token CSRF - NextAuth lo requiere */}
          {csrfToken && (
            <input type="hidden" name="csrfToken" value={csrfToken} />
          )}

          {/* Campos con name para que FormData los capture */}
          <input type="hidden" name="redirect" value="false" />
          <input type="hidden" name="json" value="true" />

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
