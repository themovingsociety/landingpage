"use client";

import { useState, useEffect } from "react";
import type { HeroContent, PortfolioContent, ContactContent } from "@/types/cms";

type SectionType = "hero" | "portfolio" | "contact";

export default function ContentAdminPage() {
  const [section, setSection] = useState<SectionType>("hero");
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editToken, setEditToken] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Verificar si se requiere autenticación
    checkAuthStatus();
    loadContent();
  }, [section]);

  const checkAuthStatus = async () => {
    setCheckingAuth(true);
    try {
      const response = await fetch("/api/content/auth");
      const result = await response.json();
      
      if (result.tokenConfigured && !result.requiresAuth) {
        setRequiresAuth(false);
        setEditToken("");
      } else {
        setRequiresAuth(true);
        const savedToken = localStorage.getItem("content_edit_token");
        if (savedToken) {
          setEditToken(savedToken);
        }
      }
    } catch {
      setRequiresAuth(true);
      const savedToken = localStorage.getItem("content_edit_token");
      if (savedToken) {
        setEditToken(savedToken);
      }
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content?section=${section}`);
      const result = await response.json();
      if (result.success) {
        setContent(result.data);
      } else {
        setMessage({ type: "error", text: "Error al cargar contenido" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al cargar contenido" });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (requiresAuth && !editToken) {
      setMessage({
        type: "error",
        text: "Por favor, ingresa el token de edición",
      });
      return;
    }

    setSaving(true);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (editToken) {
        headers.Authorization = `Bearer ${editToken}`;
      }

      const response = await fetch("/api/content", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          section,
          data: content,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage({
          type: "success",
          text: `Contenido guardado exitosamente${result.redeployTriggered ? ". Redeploy iniciado..." : ""}`,
        });
        if (requiresAuth && editToken) {
          localStorage.setItem("content_edit_token", editToken);
        }
      } else {
        setMessage({ type: "error", text: result.error || "Error al guardar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar contenido" });
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePortfolioItem = (index: number, field: string, value: any) => {
    setContent((prev: PortfolioContent) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {checkingAuth ? "Verificando configuración..." : "Cargando contenido..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Editor de Contenido</h1>
          
          {/* Token Input - Solo mostrar si se requiere autenticación */}
          {requiresAuth && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de Edición
              </label>
              <input
                type="password"
                value={editToken}
                onChange={(e) => setEditToken(e.target.value)}
                placeholder="Ingresa el token de edición"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Configura CONTENT_EDIT_TOKEN en las variables de entorno
              </p>
            </div>
          )}

          {!requiresAuth && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                ✓ Modo desarrollo: El token se usa automáticamente desde las variables de entorno
              </p>
            </div>
          )}

          {/* Section Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as SectionType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="hero">Hero</option>
              <option value="portfolio">Portfolio</option>
              <option value="contact">Contact</option>
            </select>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-4 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Content Editor */}
          {content && (
            <div className="space-y-6">
              {section === "hero" && (
                <HeroEditor
                  content={content as HeroContent}
                  updateContent={updateContent}
                />
              )}

              {section === "portfolio" && (
                <PortfolioEditor
                  content={content as PortfolioContent}
                  updateContent={updateContent}
                  updateItem={updatePortfolioItem}
                />
              )}

              {section === "contact" && (
                <ContactEditor
                  content={content as ContactContent}
                  updateContent={updateContent}
                />
              )}

              <button
                onClick={saveContent}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hero Editor Component
function HeroEditor({
  content,
  updateContent,
}: {
  content: HeroContent;
  updateContent: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título (usa \n para saltos de línea)
        </label>
        <textarea
          value={content.title}
          onChange={(e) => updateContent("title", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texto del CTA
        </label>
        <input
          type="text"
          value={content.ctaText}
          onChange={(e) => updateContent("ctaText", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link del CTA
        </label>
        <input
          type="text"
          value={content.ctaLink}
          onChange={(e) => updateContent("ctaLink", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes/Videos (una por línea)
        </label>
        <textarea
          value={content.images?.join("\n") || ""}
          onChange={(e) =>
            updateContent(
              "images",
              e.target.value.split("\n").filter((line) => line.trim())
            )
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
    </div>
  );
}

// Portfolio Editor Component
function PortfolioEditor({
  content,
  updateContent,
  updateItem,
}: {
  content: PortfolioContent;
  updateContent: (field: string, value: any) => void;
  updateItem: (index: number, field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título (usa \n para saltos de línea)
        </label>
        <textarea
          value={content.title}
          onChange={(e) => updateContent("title", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtítulo
        </label>
        <input
          type="text"
          value={content.subtitle}
          onChange={(e) => updateContent("subtitle", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Items del Portfolio
        </label>
        <div className="space-y-4">
          {content.items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 p-4 rounded-md">
              <h4 className="font-semibold mb-2">Item {index + 1}</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Título"
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Imagen (ruta)"
                  value={item.image}
                  onChange={(e) => updateItem(index, "image", e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Tags (separados por coma)"
                  value={item.tags?.join(", ") || ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "tags",
                      e.target.value.split(",").map((t) => t.trim())
                    )
                  }
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Contact Editor Component
function ContactEditor({
  content,
  updateContent,
}: {
  content: ContactContent;
  updateContent: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título
        </label>
        <input
          type="text"
          value={content.title}
          onChange={(e) => updateContent("title", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtítulo (usa \n para saltos de línea)
        </label>
        <textarea
          value={content.subtitle}
          onChange={(e) => updateContent("subtitle", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={content.email}
          onChange={(e) => updateContent("email", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instagram URL
        </label>
        <input
          type="url"
          value={content.instagram || ""}
          onChange={(e) => updateContent("instagram", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}

