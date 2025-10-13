import { NextRequest, NextResponse } from "next/server";
import { getUserDbFromSession } from "@/lib/session";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json(
        { status: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db, tenantId, isSuperAdmin } = session;

    // Only regular admin users can access this endpoint
    // Super admin users should use the other endpoint
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

    // Fetch users for the logged-in admin's tenant
    const users = await db.collection("Users").find({
    }).project({
      _id: 1,
      name: 1,
      lastname: 1,
      address: 1,
      postalCode: 1,
      city: 1,
      email: 1,
      phone: 1,
      createdAt: 1
    }).toArray();

    console.log("Fetched users:", users);
    return NextResponse.json({ status: 200, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { status: 500, message: (error as Error).message },
      { status: 500 }
    );
  }
}
