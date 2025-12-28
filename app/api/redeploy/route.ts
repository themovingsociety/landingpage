import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CONTENT_EDIT_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken || !vercelProjectId) {
      return NextResponse.json(
        {
          error: "Vercel configuration missing",
          message:
            "VERCEL_TOKEN and VERCEL_PROJECT_ID must be set in environment variables",
        },
        { status: 500 }
      );
    }

    // Construir URL de la API de Vercel
    const vercelApiUrl = vercelTeamId
      ? `https://api.vercel.com/v1/deployments?teamId=${vercelTeamId}`
      : "https://api.vercel.com/v1/deployments";

    // Obtener el repositorio desde variables de entorno o usar defaults
    const gitRepo = process.env.VERCEL_GIT_REPO_SLUG || "landing";
    const gitOwner = process.env.VERCEL_GIT_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER;

    // Hacer el request a Vercel API para crear un nuevo deployment
    const response = await fetch(vercelApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: vercelProjectId,
        gitSource: gitOwner
          ? {
              type: "github",
              repo: `${gitOwner}/${gitRepo}`,
              ref: "main", // o "master" según tu branch principal
            }
          : undefined,
        // Si no hay gitSource, Vercel usará el último commit
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to trigger redeploy",
        },
        { status: response.status }
      );
    }

    const deployment = await response.json();

    return NextResponse.json({
      success: true,
      message: "Redeploy triggered successfully",
      deployment: {
        id: deployment.id,
        url: deployment.url,
        state: deployment.readyState,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET: Verificar estado de redeploy
export async function GET(request: NextRequest) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken || !vercelProjectId) {
      return NextResponse.json(
        {
          configured: false,
          message: "Vercel configuration missing",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      configured: true,
      projectId: vercelProjectId,
      teamId: vercelTeamId || "none",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check redeploy status",
      },
      { status: 500 }
    );
  }
}

