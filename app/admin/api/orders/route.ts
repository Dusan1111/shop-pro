// app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

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
    const client = await clientPromise;
    const db = client.db(dbName);
    const allOrders = await db.collection("Orders").find().toArray();

    return NextResponse.json({ data: allOrders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}