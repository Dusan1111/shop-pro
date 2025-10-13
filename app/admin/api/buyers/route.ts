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

    const { db, tenantId, isSuperAdmin, permissions } = session;

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

    // Check for manage_buyers permission
    if (!permissions.includes("manage_buyers")) {
      return NextResponse.json(
        { status: 403, message: "You don't have permission to manage buyers" },
        { status: 403 }
      );
    }

    // Get pagination parameters from query
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Query for buyers (users without tenantId - customers who place orders)
    const query = { tenantId: { $exists: false } };

    // Get total count for pagination
    const totalCount = await db.collection("Users").countDocuments(query);

    // Fetch buyers with pagination
    const users = await db.collection("Users")
      .find(query)
      .project({
        _id: 1,
        name: 1,
        lastname: 1,
        address: 1,
        postalCode: 1,
        city: 1,
        email: 1,
        phone: 1,
        createdAt: 1
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      status: 200,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { status: 500, message: (error as Error).message },
      { status: 500 }
    );
  }
}
