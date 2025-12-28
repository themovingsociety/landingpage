"use client";

import { useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  setToast: (
    toast: { message: string; type: "success" | "error" } | null
  ) => void;
  label?: string;
  accept?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  setToast,
  label = "Imagen/Video",
  accept = "image/*,video/*",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = file.type.startsWith("video/")
      ? 100 * 1024 * 1024
      : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(
        `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB} MB`
      );
      return;
    }

    setUploading(true);
    setError("");

    try {
      const editToken = localStorage.getItem("content_edit_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (editToken) {
        headers.Authorization = `Bearer ${editToken}`;
      }

      const signatureResponse = await fetch("/api/upload/signature", {
        method: "POST",
        headers,
        body: JSON.stringify({
          timestamp: Math.round(new Date().getTime() / 1000),
          folder: "landing-page",
        }),
      });

      const signatureData = await signatureResponse.json();

      if (!signatureData.signature) {
        throw new Error("No se pudo obtener la firma de upload");
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("api_key", signatureData.apiKey);
      uploadFormData.append("timestamp", signatureData.timestamp.toString());
      uploadFormData.append("signature", signatureData.signature);
      uploadFormData.append("folder", "landing-page");
      uploadFormData.append("resource_type", "auto");

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`;

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(
          errorData.error?.message || "Error al subir el archivo"
        );
      }

      const uploadResult = await uploadResponse.json();

      onChange(uploadResult.secure_url);
      setToast({
        message: "Archivo subido correctamente",
        type: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al subir el archivo. Por favor, intenta de nuevo.";
      setError(errorMessage);
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
          {value.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
          (value.includes("cloudinary") &&
            (value.includes("/video/") ||
              value.includes("resource_type=video"))) ? (
            <video
              src={value}
              controls
              className="max-w-full h-48 object-cover rounded-md border border-gray-300"
              muted
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
        <label
          className={`cursor-pointer ${uploading ? "pointer-events-none" : ""}`}
        >
          <span
            className={`inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading
              ? "Subiendo..."
              : value
              ? "Cambiar archivo"
              : "Subir imagen/video"}
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
            disabled={uploading}
            className={`text-red-600 hover:text-red-700 text-sm ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Eliminar
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL de la imagen/video"
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      )}
    </div>
  );
}
