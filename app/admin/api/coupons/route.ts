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

    const allCoupons = await db.collection("Coupons")
      .find({ isDeleted: false })
      .toArray();

    return NextResponse.json({ status: 200, data: allCoupons });
  } catch (error) {
    console.error("Greška prilikom čitanja kupona:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom čitanja kupona" },
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
      code,
      name,
      description,
      type,
      discountValue,
      minPurchaseAmount,
      maxUsageCount,
      expiryDate,
      isActive = true,
    } = body;

    if (!code) {
      return NextResponse.json(
        { message: "Kod kupona je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: "Naziv kupona je obavezan!" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { message: "Tip kupona je obavezan!" },
        { status: 400 }
      );
    }

    if (!discountValue || Number(discountValue) <= 0) {
      return NextResponse.json(
        { message: "Vrednost popusta je obavezna i mora biti veća od 0!" },
        { status: 400 }
      );
    }

    if (minPurchaseAmount && Number(minPurchaseAmount) <= 0) {
      return NextResponse.json(
        { message: "Minimalan iznos kupovine mora biti veći od 0!" },
        { status: 400 }
      );
    }

    if (maxUsageCount && Number(maxUsageCount) <= 0) {
      return NextResponse.json(
        { message: "Maksimalan broj upotreba mora biti veći od 0!" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await db.collection("Coupons").findOne({
      code: code.toUpperCase(),
      isDeleted: false,
    });

    if (existingCoupon) {
      return NextResponse.json(
        { message: "Kupon sa ovim kodom već postoji!" },
        { status: 400 }
      );
    }

    const newCoupon = {
      code: code.toUpperCase(),
      name,
      description: description || undefined,
      type,
      discountValue: discountValue ? Number(discountValue) : undefined,
      minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
      maxUsageCount: maxUsageCount ? Number(maxUsageCount) : undefined,
      usageCount: 0,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("Coupons").insertOne(newCoupon);

    return NextResponse.json({
      message: "Kupon uspešno dodat",
      data: { _id: result.insertedId, ...newCoupon },
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja kupona", error);
    return NextResponse.json(
      { message: "Greška prilikom dodavanja kupona!" },
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
    const couponId = searchParams.get("id");

    if (!couponId) {
      return NextResponse.json(
        { status: 400, message: "ID kupona je obavezan!" },
        { status: 400 }
      );
    }

    const result = await db.collection("Coupons").updateOne(
      { _id: new ObjectId(couponId) },
      { $set: { isDeleted: true, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Kupon nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Kupon je uspešno obrisan!",
    });
  } catch (error) {
    console.error("Greška prilikom brisanja kupona!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom brisanja kupona!" },
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
      code,
      name,
      description,
      type,
      discountValue,
      minPurchaseAmount,
      maxUsageCount,
      expiryDate,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { status: 400, message: "ID kupona je obavezan!" },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { status: 400, message: "Kod kupona je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { status: 400, message: "Naziv kupona je obavezan!" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { status: 400, message: "Tip kupona je obavezan!" },
        { status: 400 }
      );
    }

    if (!discountValue || Number(discountValue) <= 0) {
      return NextResponse.json(
        { status: 400, message: "Vrednost popusta je obavezna i mora biti veća od 0!" },
        { status: 400 }
      );
    }

    if (minPurchaseAmount && Number(minPurchaseAmount) <= 0) {
      return NextResponse.json(
        { status: 400, message: "Minimalan iznos kupovine mora biti veći od 0!" },
        { status: 400 }
      );
    }

    if (maxUsageCount && Number(maxUsageCount) <= 0) {
      return NextResponse.json(
        { status: 400, message: "Maksimalan broj upotreba mora biti veći od 0!" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists (excluding current coupon)
    const existingCoupon = await db.collection("Coupons").findOne({
      code: code.toUpperCase(),
      _id: { $ne: new ObjectId(id) },
      isDeleted: false,
    });

    if (existingCoupon) {
      return NextResponse.json(
        { message: "Kupon sa ovim kodom već postoji!" },
        { status: 400 }
      );
    }

    const updateData = {
      code: code.toUpperCase(),
      name,
      description: description || undefined,
      type,
      discountValue: discountValue ? Number(discountValue) : undefined,
      minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
      maxUsageCount: maxUsageCount ? Number(maxUsageCount) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive,
      updatedAt: new Date(),
    };

    const result = await db.collection("Coupons").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Kupon nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Kupon je uspešno ažuriran.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene kupona!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene kupona!" },
      { status: 500 }
    );
  }
}
