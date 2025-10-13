import { NextRequest, NextResponse } from "next/server";
import { getUserDbFromSession } from "@/lib/session";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json(
        { status: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db, tenantId, isSuperAdmin, permissions } = session;

    // Only regular admin users can access this endpoint
    if (isSuperAdmin) {
      return NextResponse.json(
        { status: 403, message: "Super admin users cannot access this endpoint" },
        { status: 403 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { status: 400, message: "Tenant ID not found" },
        { status: 400 }
      );
    }

    // Check for manage_buyers permission
    if (!permissions.includes("manage_buyers")) {
      return NextResponse.json(
        { status: 403, message: "You don't have permission to manage buyers" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Fetch buyer (customer user without tenantId)
    const user = await db.collection("Users").findOne({
      _id: new ObjectId(id),
      tenantId: { $exists: false }
    });

    if (!user) {
      return NextResponse.json(
        { status: 404, message: "Kupac nije pronađen!" },
        { status: 404 }
      );
    }

    // Don't return password to frontend
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ status: 200, data: userWithoutPassword });
  } catch (error) {
    console.error("Greška prilikom čitanja kupca:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom čitanja kupca" },
      { status: 500 }
    );
  }
}
