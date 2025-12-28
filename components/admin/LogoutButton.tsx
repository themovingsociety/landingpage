"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    // Obtener token CSRF
    const getCsrfToken = async () => {
      try {
        const response = await fetch("/api/auth/csrf", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken || data.token || "");
        }
      } catch (err) {
        console.error("Error obteniendo CSRF token:", err);
      }
    };
    getCsrfToken();
  }, []);

  const handleLogout = async () => {
    if (!csrfToken) {
      // Si no hay token, intentar obtenerlo primero
      const response = await fetch("/api/auth/csrf", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken || data.token || "");
      }
    }

    // Cerrar sesión mediante POST request con token CSRF
    const params = new URLSearchParams();
    if (csrfToken) {
      params.append("csrfToken", csrfToken);
    }

    await fetch("/api/auth/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
      body: params.toString(),
    });
    
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
    >
      Cerrar Sesión
    </button>
  );
}

