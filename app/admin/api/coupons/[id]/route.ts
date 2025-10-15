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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;
    const { id } = await params;

    const coupon = await db.collection("Coupons").findOne({
      _id: new ObjectId(id),
      isDeleted: false,
    });

    if (!coupon) {
      return NextResponse.json(
        { status: 404, message: "Kupon nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: 200, data: coupon });
  } catch (error) {
    console.error("Greška prilikom čitanja kupona:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom čitanja kupona" },
      { status: 500 }
    );
  }
}
