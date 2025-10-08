import { NextRequest, NextResponse } from "next/server";
import { getUserDbFromSession } from "@/lib/session";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    const program = await db.collection("GlobalDiscounts").findOne({
      _id: new ObjectId(params.id),
      isDeleted: false,
    });

    if (!program) {
      return NextResponse.json(
        { status: 404, message: "Program nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: 200, data: program });
  } catch (error) {
    console.error("Greška prilikom čitanja programa:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom čitanja programa" },
      { status: 500 }
    );
  }
}
