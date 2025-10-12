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

    const user = await db.collection("Users").findOne({
      _id: new ObjectId(id)
    });

    if (!user) {
      return NextResponse.json(
        { status: 404, message: "Korisnik nije pronađen!" },
        { status: 404 }
      );
    }

    // Don't return password to frontend
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ status: 200, data: userWithoutPassword });
  } catch (error) {
    console.error("Greška prilikom čitanja korisnika:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom čitanja korisnika" },
      { status: 500 }
    );
  }
}
