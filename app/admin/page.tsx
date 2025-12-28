import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8 admin-page">
      <div className="text-center max-w-2xl bg-white p-12 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl text-gray-800 font-bold">
            Panel de Administración
          </h1>
          <LogoutButton />
        </div>
        <p className="text-lg text-gray-600 mb-2">
          Bienvenido, <strong>{session.user?.name}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Sistema de contenido editable CMS
        </p>

        <div className="space-y-4">
          <Link
            href="/admin/content"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
          >
            Editor de Contenido
          </Link>
        </div>
      </div>
    </div>
  );
}
