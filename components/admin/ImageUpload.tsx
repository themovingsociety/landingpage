"use client";

import { useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Imagen",
  accept = "image/*,video/*",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Obtener token de edición si está guardado
      const editToken = localStorage.getItem("content_edit_token");
      const headers: HeadersInit = {};

      if (editToken) {
        headers.Authorization = `Bearer ${editToken}`;
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.url);
      } else {
        setError(result.error || "Error al subir la imagen");
      }
    } catch (err) {
      setError("Error al subir la imagen. Por favor, intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {value && (
        <div className="mb-3">
          {value.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={value}
              controls
              className="max-w-full h-48 object-cover rounded-md border border-gray-300"
            />
          ) : (
            <img
              src={value}
              alt="Preview"
              className="max-w-full h-48 object-cover rounded-md border border-gray-300"
            />
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {uploading ? "Subiendo..." : value ? "Cambiar imagen" : "Subir imagen"}
          </span>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Eliminar
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL de la imagen"
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      )}
    </div>
  );
}

