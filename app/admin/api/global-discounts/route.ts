import { NextRequest, NextResponse } from "next/server";
import { getUserDbFromSession } from "@/lib/session";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    const allPrograms = await db.collection("GlobalDiscounts")
      .find({ isDeleted: false })
      .toArray();

    return NextResponse.json({ status: 200, data: allPrograms });
  } catch (error) {
    console.error("Greška prilikom čitanja globalnog popusta:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom čitanja globalnog popusta" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    const body = await req.json();
    const {
      name,
      description,
      type,
      applyTo = "global",
      minPurchaseAmount,
      discountPercentage,
      isActive = true,
      productIds = [],
    } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Ime popusta je obavezno!" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { message: "Tip popusta je obavezan!" },
        { status: 400 }
      );
    }

    const newProgram = {
      name,
      description,
      type,
      applyTo,
      minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
      discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
      isActive,
      productIds: productIds || [],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("GlobalDiscounts").insertOne(newProgram);

    return NextResponse.json({
      message: "Popust uspešno dodat",
      data: { _id: result.insertedId, ...newProgram },
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja globalnog popusta", error);
    return NextResponse.json(
      { message: "Greška prilikom dodavanja globalnog popusta!" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("id");

    if (!programId) {
      return NextResponse.json(
        { status: 400, message: "ID globalnog popusta je obavezan!" },
        { status: 400 }
      );
    }

    const result = await db.collection("GlobalDiscounts").updateOne(
      { _id: new ObjectId(programId) },
      { $set: { isDeleted: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Program nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Popust je uspešno obrisan!",
    });
  } catch (error) {
    console.error("Greška prilikom brisanja globalnog popusta!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom globalnog popusta!" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    const body = await req.json();
    const {
      id,
      name,
      description,
      type,
      applyTo,
      minPurchaseAmount,
      discountPercentage,
      isActive,
      productIds = [],
    } = body;

    if (!id) {
      return NextResponse.json(
        { status: 400, message: "ID globalnog popusta je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { status: 400, message: "Ime globalnog popusta je obavezno!" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { status: 400, message: "Tip globalnog popusta je obavezan!" },
        { status: 400 }
      );
    }

    const updateData = {
      name,
      description,
      type,
      applyTo,
      minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
      discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
      isActive,
      productIds: productIds || [],
      updatedAt: new Date(),
    };

    const result = await db.collection("GlobalDiscounts").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Popust nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Popust je uspešno ažuriran.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene globalnog popusta!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene globalnog popusta!" },
      { status: 500 }
    );
  }
}
