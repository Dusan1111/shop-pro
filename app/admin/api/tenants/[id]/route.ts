import { NextRequest, NextResponse } from "next/server";
import { clientPromise, settingsDbName } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);
    const { id } = await params;

    const tenant = await db.collection("Tenants").findOne({
      _id: new ObjectId(id)
    });

    if (!tenant) {
      return NextResponse.json(
        { status: 404, message: "Firma nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: 200, data: tenant });
  } catch (error) {
    console.error("Greška prilikom čitanja firme:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom čitanja firme" },
      { status: 500 }
    );
  }
}
