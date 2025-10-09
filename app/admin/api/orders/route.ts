// app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserDbFromSession } from "@/lib/session";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    // Parse the request body
    const body = await req.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { status: 400, message: "Id porudžbine je obevezno!" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { status: 400, message: "Status orudžbine je obevezan!" },
        { status: 400 }
      );
    }

    // Update the order status
    const result = await db.collection("Orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Porudžbina nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Status porudžbine je uspešno ažuriran!",
    });
  } catch (error) {
    console.error("Greška prilikom ažuriranja statusa:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom ažuriranja statusa!" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;
    const { searchParams } = new URL(req.url);

    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    // Build filter query - search by Order ID only
    const filter: any = {};
    if (search) {
      // Check if search is a valid ObjectId (full match)
      if (ObjectId.isValid(search) && search.length === 24) {
        filter._id = new ObjectId(search);
      } else if (search.length > 0) {
        // For partial matches, get all orders and filter by string representation
        // This will be handled after fetching
      }
    }

    // For partial ObjectId search, we need to fetch all and filter
    if (search && search.length > 0 && search.length < 24) {
      // Fetch all orders and filter by string representation of _id
      const allOrders = await db.collection("Orders")
        .find({})
        .sort({ orderTime: -1 })
        .toArray();
      const filteredOrders = allOrders.filter(order =>
        order._id.toString().toLowerCase().includes(search.toLowerCase())
      );

      const totalCount = filteredOrders.length;
      const paginatedOrders = filteredOrders.slice(page * pageSize, (page + 1) * pageSize);

      return NextResponse.json({
        data: paginatedOrders,
        totalCount,
        page,
        pageSize
      }, { status: 200 });
    }

    // Get total count for exact match or no search
    const totalCount = await db.collection("Orders").countDocuments(filter);

    // Get paginated data - sorted by newest first
    const allOrders = await db.collection("Orders")
      .find(filter)
      .sort({ orderTime: -1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      data: allOrders,
      totalCount,
      page,
      pageSize
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}